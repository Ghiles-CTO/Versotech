#!/bin/bash

# VERSOTECH PORTAL - Structure Cleanup Script
# This script removes duplicate routes, test folders, and debug endpoints
# Run this before production deployment

set -e  # Exit on error

echo "🧹 VERSOTECH PORTAL - Structure Cleanup"
echo "======================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to confirm deletion
confirm_deletion() {
    local path=$1
    if [ -d "$path" ] || [ -f "$path" ]; then
        echo -e "${YELLOW}Found: $path${NC}"
        return 0
    else
        echo -e "${GREEN}Already clean: $path (not found)${NC}"
        return 1
    fi
}

echo "Step 1: Remove Duplicate Settings Routes"
echo "----------------------------------------"

if confirm_deletion "src/app/versoholdings"; then
    rm -rf src/app/versoholdings
    echo -e "${GREEN}✓ Deleted src/app/versoholdings/${NC}"
fi

if confirm_deletion "src/app/versotech"; then
    rm -rf src/app/versotech
    echo -e "${GREEN}✓ Deleted src/app/versotech/${NC}"
fi

echo ""
echo "Step 2: Remove Test Routes"
echo "----------------------------------------"

if confirm_deletion "src/app/test"; then
    rm -rf src/app/test
    echo -e "${GREEN}✓ Deleted src/app/test/${NC}"
fi

if confirm_deletion "src/app/test-enterprise"; then
    rm -rf src/app/test-enterprise
    echo -e "${GREEN}✓ Deleted src/app/test-enterprise/${NC}"
fi

echo ""
echo "Step 3: Remove Debug API Endpoints"
echo "----------------------------------------"

if confirm_deletion "src/app/api/debug"; then
    rm -rf src/app/api/debug
    echo -e "${GREEN}✓ Deleted src/app/api/debug/${NC}"
fi

if confirm_deletion "src/app/api/debug-deals"; then
    rm -rf src/app/api/debug-deals
    echo -e "${GREEN}✓ Deleted src/app/api/debug-deals/${NC}"
fi

if confirm_deletion "src/app/api/fix-profile"; then
    rm -rf src/app/api/fix-profile
    echo -e "${GREEN}✓ Deleted src/app/api/fix-profile/${NC}"
fi

echo ""
echo "Step 4: Remove Old Chat Interface (Optional)"
echo "----------------------------------------"
echo -e "${YELLOW}Note: Only run this after confirming enhanced chat works${NC}"

if confirm_deletion "src/components/messaging/chat-interface.tsx"; then
    read -p "Delete old chat-interface.tsx? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm src/components/messaging/chat-interface.tsx
        echo -e "${GREEN}✓ Deleted old chat interface${NC}"
    else
        echo -e "${YELLOW}⊘ Skipped (keeping for now)${NC}"
    fi
fi

echo ""
echo "Step 5: Check Demo Mode Files (Production)"
echo "----------------------------------------"
echo -e "${YELLOW}Warning: Demo mode files should be removed before production${NC}"

demo_files=(
    "src/lib/demo-auth.ts"
    "src/lib/demo-middleware.ts"
    "src/lib/demo-session.ts"
)

for file in "${demo_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${YELLOW}⚠ Found: $file (keep for dev, remove for production)${NC}"
    fi
done

echo ""
echo "======================================"
echo -e "${GREEN}✓ Cleanup Complete!${NC}"
echo ""
echo "Summary of changes:"
echo "- Removed duplicate settings routes"
echo "- Removed test folders"
echo "- Removed debug API endpoints"
echo ""
echo "Next steps:"
echo "1. Review changes: git status"
echo "2. Test the app: npm run dev"
echo "3. Commit changes: git add . && git commit -m 'chore: clean up duplicate routes and debug endpoints'"
echo ""
echo -e "${YELLOW}Before production deployment:${NC}"
echo "- Remove demo mode files (src/lib/demo-*.ts)"
echo "- Run: npm run build"
echo "- Run tests if available"
echo ""
