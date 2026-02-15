#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT_DIR = Path(__file__).resolve().parent
DEFAULT_GLOBAL_OUTDIR = ROOT_DIR / "output" / "global"

SCOPES = [
    {
        "name": "vc1",
        "script": ROOT_DIR / "scopes" / "vc1" / "run_vc1_audit.py",
        "rules": ROOT_DIR / "scopes" / "vc1" / "rules_vc1.json",
        "outdir": ROOT_DIR / "scopes" / "vc1" / "output",
    },
    {
        "name": "vc2",
        "script": ROOT_DIR / "scopes" / "vc2" / "run_vc2_audit.py",
        "rules": ROOT_DIR / "scopes" / "vc2" / "rules_vc2.json",
        "outdir": ROOT_DIR / "scopes" / "vc2" / "output",
    },
    {
        "name": "in",
        "script": ROOT_DIR / "scopes" / "in" / "run_in_audit.py",
        "rules": ROOT_DIR / "scopes" / "in" / "rules_in.json",
        "outdir": ROOT_DIR / "scopes" / "in" / "output",
    },
]


def parse_stdout_value(stdout: str, key: str) -> str | None:
    prefix = f"{key}:"
    for line in stdout.splitlines():
        if line.startswith(prefix):
            return line.split(":", 1)[1].strip()
    return None


def relpath(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT_DIR.parent))
    except Exception:
        return str(path)


def run_scope(scope: dict[str, Path | str], run_dir: Path) -> dict[str, Any]:
    name = str(scope["name"])
    script = Path(scope["script"])
    rules = Path(scope["rules"])
    outdir = Path(scope["outdir"])

    cmd = [
        sys.executable,
        str(script),
        "--rules",
        str(rules),
        "--outdir",
        str(outdir),
    ]

    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    log_path = run_dir / f"{name}.log"
    log_path.write_text(proc.stdout + ("\nSTDERR:\n" + proc.stderr if proc.stderr else ""))

    # Keep original scope output visible in terminal.
    if proc.stdout:
        print(proc.stdout, end="" if proc.stdout.endswith("\n") else "\n")
    if proc.stderr:
        print(proc.stderr, file=sys.stderr, end="" if proc.stderr.endswith("\n") else "\n")

    if proc.returncode != 0:
        raise RuntimeError(f"Scope '{name}' script failed with exit code {proc.returncode}. See {log_path}")

    report_json_s = parse_stdout_value(proc.stdout, "REPORT_JSON")
    run_dir_s = parse_stdout_value(proc.stdout, "RUN_DIR")
    fail_s = parse_stdout_value(proc.stdout, "FAIL_COUNT")
    warn_s = parse_stdout_value(proc.stdout, "WARN_COUNT")

    if not report_json_s:
        raise RuntimeError(f"Scope '{name}' did not print REPORT_JSON. See {log_path}")

    report_json = Path(report_json_s)
    if not report_json.exists():
        raise RuntimeError(f"Scope '{name}' report does not exist: {report_json}")

    report = json.loads(report_json.read_text())
    summary = report.get("summary", {})
    fail_count = int(summary.get("fail_count", int(fail_s or 0)))
    warning_count = int(summary.get("warning_count", int(warn_s or 0)))

    return {
        "scope": name,
        "run_dir": run_dir_s or str(report_json.parent),
        "run_id": Path(run_dir_s).name if run_dir_s else report_json.parent.name,
        "report_json": str(report_json),
        "report_md": str(report_json.parent / "audit_summary.md"),
        "issues_csv": str(report_json.parent / "audit_issues.csv"),
        "fail_count": fail_count,
        "warning_count": warning_count,
        "fail_by_check": summary.get("fail_by_check", {}),
        "warn_by_check": summary.get("warn_by_check", {}),
        "rules_version": summary.get("rules_version"),
        "scope_vehicle_codes": summary.get("scope_vehicle_codes", []),
        "log_path": str(log_path),
    }


def build_markdown(payload: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("# Global Audit Summary")
    lines.append("")
    lines.append(f"- Generated at: `{payload['generated_at_utc']}`")
    lines.append(f"- Run folder: `{payload['run_folder']}`")
    lines.append(f"- Total fails: `{payload['total_fail_count']}`")
    lines.append(f"- Total warnings: `{payload['total_warning_count']}`")
    lines.append(f"- All scopes pass: `{str(payload['all_scopes_pass']).lower()}`")
    lines.append("")
    lines.append("| Scope | Fails | Warnings | Run ID | Report |")
    lines.append("|---|---:|---:|---|---|")
    for row in payload["scopes"]:
        lines.append(
            f"| `{row['scope']}` | {row['fail_count']} | {row['warning_count']} | "
            f"`{row['run_id']}` | `{row['report_json']}` |"
        )

    lines.append("")
    lines.append("## Warning Breakdown")
    lines.append("")
    for row in payload["scopes"]:
        lines.append(f"### `{row['scope']}`")
        warn = row.get("warn_by_check", {})
        if not warn:
            lines.append("- none")
        else:
            for check, count in sorted(warn.items()):
                lines.append(f"- `{check}`: {count}")
        lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Run all scope audits and aggregate results.")
    parser.add_argument(
        "--global-outdir",
        type=Path,
        default=DEFAULT_GLOBAL_OUTDIR,
        help="Directory where global run artifacts are saved",
    )
    parser.add_argument(
        "--strict",
        action="store_true",
        help="Return non-zero if any scope has failures",
    )
    args = parser.parse_args()

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    run_dir = args.global_outdir / f"run_{stamp}"
    run_dir.mkdir(parents=True, exist_ok=False)

    scope_results = [run_scope(scope, run_dir) for scope in SCOPES]

    total_fail = sum(int(r["fail_count"]) for r in scope_results)
    total_warn = sum(int(r["warning_count"]) for r in scope_results)
    payload = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "run_folder": str(run_dir),
        "total_fail_count": total_fail,
        "total_warning_count": total_warn,
        "all_scopes_pass": all(int(r["fail_count"]) == 0 for r in scope_results),
        "scopes": scope_results,
    }

    json_path = run_dir / "global_audit_report.json"
    md_path = run_dir / "global_audit_summary.md"
    json_path.write_text(json.dumps(payload, indent=2))
    payload_for_md = dict(payload)
    payload_for_md["run_folder"] = relpath(run_dir)
    for row in payload_for_md["scopes"]:
        row["report_json"] = relpath(Path(row["report_json"]))
    md_path.write_text(build_markdown(payload_for_md))

    print(f"GLOBAL_RUN_DIR: {run_dir}")
    print(f"GLOBAL_REPORT_JSON: {json_path}")
    print(f"GLOBAL_REPORT_MD: {md_path}")
    print(f"TOTAL_FAIL_COUNT: {total_fail}")
    print(f"TOTAL_WARN_COUNT: {total_warn}")

    if args.strict and total_fail > 0:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
