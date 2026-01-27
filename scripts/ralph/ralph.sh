#!/bin/bash
# Ralph Wiggum - Long-running AI agent loop
# Usage: ./ralph.sh [--tool amp|claude] [--retries N] [max_iterations]

# Parse arguments
TOOL="amp"
MAX_ITERATIONS=10
MAX_RETRIES=3

while [[ $# -gt 0 ]]; do
  case $1 in
    --tool) TOOL="$2"; shift 2 ;;
    --tool=*) TOOL="${1#*=}"; shift ;;
    --retries) MAX_RETRIES="$2"; shift 2 ;;
    --retries=*) MAX_RETRIES="${1#*=}"; shift ;;
    *) [[ "$1" =~ ^[0-9]+$ ]] && MAX_ITERATIONS="$1"; shift ;;
  esac
done

if [[ "$TOOL" != "amp" && "$TOOL" != "claude" ]]; then
  echo "Error: Invalid tool '$TOOL'. Must be 'amp' or 'claude'."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PRD_FILE="$SCRIPT_DIR/prd.json"
PROGRESS_FILE="$SCRIPT_DIR/progress.txt"
ARCHIVE_DIR="$SCRIPT_DIR/archive"
LAST_BRANCH_FILE="$SCRIPT_DIR/.last-branch"

# Archive previous run if branch changed
if [ -f "$PRD_FILE" ] && [ -f "$LAST_BRANCH_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  LAST_BRANCH=$(cat "$LAST_BRANCH_FILE" 2>/dev/null || echo "")

  if [ -n "$CURRENT_BRANCH" ] && [ -n "$LAST_BRANCH" ] && [ "$CURRENT_BRANCH" != "$LAST_BRANCH" ]; then
    DATE=$(date +%Y-%m-%d)
    FOLDER_NAME=$(echo "$LAST_BRANCH" | sed 's|^ralph/||')
    ARCHIVE_FOLDER="$ARCHIVE_DIR/$DATE-$FOLDER_NAME"

    echo "Archiving previous run: $LAST_BRANCH"
    mkdir -p "$ARCHIVE_FOLDER"
    [ -f "$PRD_FILE" ] && cp "$PRD_FILE" "$ARCHIVE_FOLDER/"
    [ -f "$PROGRESS_FILE" ] && cp "$PROGRESS_FILE" "$ARCHIVE_FOLDER/"
    echo "   Archived to: $ARCHIVE_FOLDER"

    echo "# Ralph Progress Log" > "$PROGRESS_FILE"
    echo "Started: $(date)" >> "$PROGRESS_FILE"
    echo "---" >> "$PROGRESS_FILE"
  fi
fi

# Track current branch
if [ -f "$PRD_FILE" ]; then
  CURRENT_BRANCH=$(jq -r '.branchName // empty' "$PRD_FILE" 2>/dev/null || echo "")
  [ -n "$CURRENT_BRANCH" ] && echo "$CURRENT_BRANCH" > "$LAST_BRANCH_FILE"
fi

# Initialize progress file
if [ ! -f "$PROGRESS_FILE" ]; then
  echo "# Ralph Progress Log" > "$PROGRESS_FILE"
  echo "Started: $(date)" >> "$PROGRESS_FILE"
  echo "---" >> "$PROGRESS_FILE"
fi

# Check for fatal errors that shouldn't retry
is_fatal_error() {
  echo "$1" | grep -qE "Invalid API key|Please run /login|unauthorized|authentication"
}

# Check for transient errors that should retry
is_transient_error() {
  echo "$1" | grep -qE "No messages returned|ECONNRESET|ETIMEDOUT|rate limit|503|502|504|overloaded|Connection reset|socket hang up"
}

# Run tool with timeout (kills hung processes)
run_tool() {
  local tmpfile=$(mktemp)
  local pid

  if [[ "$TOOL" == "amp" ]]; then
    cat "$SCRIPT_DIR/prompt.md" | amp --dangerously-allow-all >"$tmpfile" 2>&1 &
    pid=$!
  else
    claude --dangerously-skip-permissions --print <"$SCRIPT_DIR/CLAUDE.md" >"$tmpfile" 2>&1 &
    pid=$!
  fi

  # Wait up to 10 min, checking for hung errors every 2 sec
  local elapsed=0
  while kill -0 $pid 2>/dev/null; do
    sleep 2
    elapsed=$((elapsed + 2))

    # Check if it printed an error and hung
    if grep -qE "No messages returned|Invalid API key" "$tmpfile" 2>/dev/null; then
      echo ""
      echo "   ⚠ Detected hung process with error, killing..."
      kill $pid 2>/dev/null; sleep 1; kill -9 $pid 2>/dev/null
      cat "$tmpfile"
      rm -f "$tmpfile"
      return 1
    fi

    # Timeout after 10 min
    if [[ $elapsed -ge 600 ]]; then
      echo ""
      echo "   ⚠ Timeout after 10 minutes, killing..."
      kill $pid 2>/dev/null; sleep 1; kill -9 $pid 2>/dev/null
      cat "$tmpfile"
      rm -f "$tmpfile"
      return 124
    fi
  done

  wait $pid
  local exit_code=$?
  cat "$tmpfile"
  OUTPUT=$(cat "$tmpfile")
  rm -f "$tmpfile"
  return $exit_code
}

echo "Starting Ralph - Tool: $TOOL - Max iterations: $MAX_ITERATIONS - Max retries: $MAX_RETRIES"

for i in $(seq 1 $MAX_ITERATIONS); do
  echo ""
  echo "==============================================================="
  echo "  Ralph Iteration $i of $MAX_ITERATIONS ($TOOL)"
  echo "==============================================================="

  # Retry loop
  attempt=1
  delay=5
  OUTPUT=""
  success=false

  while [[ $attempt -le $MAX_RETRIES ]]; do
    if [[ $attempt -gt 1 ]]; then
      echo "   ⚠ Retry attempt $attempt of $MAX_RETRIES (waiting ${delay}s)..."
      sleep $delay
      delay=$((delay * 2))
    fi

    run_tool
    exit_code=$?

    # Check for fatal errors (don't retry)
    if is_fatal_error "$OUTPUT"; then
      echo ""
      echo "   ✗ Fatal error detected. Please fix and restart."
      exit 1
    fi

    # Check for transient errors (retry)
    if is_transient_error "$OUTPUT" || [[ $exit_code -ne 0 ]] || [[ -z "$OUTPUT" ]]; then
      echo ""
      echo "   ⚠ Transient error (exit: $exit_code), will retry..."
      attempt=$((attempt + 1))
      continue
    fi

    # Success
    success=true
    break
  done

  if [[ "$success" != "true" ]]; then
    echo ""
    echo "   ✗ All $MAX_RETRIES retries failed. Skipping iteration..."
    sleep 5
    continue
  fi

  # Check for completion
  if echo "$OUTPUT" | grep -q "<promise>COMPLETE</promise>"; then
    echo ""
    echo "✓ Ralph completed all tasks!"
    echo "Completed at iteration $i of $MAX_ITERATIONS"
    exit 0
  fi

  echo "Iteration $i complete. Continuing..."
  sleep 2
done

echo ""
echo "Ralph reached max iterations ($MAX_ITERATIONS) without completing all tasks."
echo "Check $PROGRESS_FILE for status."
exit 1
