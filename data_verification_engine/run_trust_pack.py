#!/usr/bin/env python3
from __future__ import annotations

import argparse
import csv
import json
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from core.governance_checks import evaluate_warning_governance

ROOT_DIR = Path(__file__).resolve().parent
DEFAULT_POLICY = ROOT_DIR / "trust_pack" / "trust_policy.json"
DEFAULT_GLOBAL_RUNNER = ROOT_DIR / "run_all_scopes.py"
DEFAULT_GLOBAL_OUTDIR = ROOT_DIR / "output" / "global"
DEFAULT_TRUST_OUTDIR = ROOT_DIR / "output" / "trust"


def parse_stdout_value(stdout: str, key: str) -> str | None:
    prefix = f"{key}:"
    for line in stdout.splitlines():
        if line.startswith(prefix):
            return line.split(":", 1)[1].strip()
    return None


def run_global(global_runner: Path, global_outdir: Path) -> Path:
    cmd = [sys.executable, str(global_runner), "--global-outdir", str(global_outdir)]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.stdout:
        print(proc.stdout, end="" if proc.stdout.endswith("\n") else "\n")
    if proc.stderr:
        print(proc.stderr, file=sys.stderr, end="" if proc.stderr.endswith("\n") else "\n")
    if proc.returncode != 0:
        raise RuntimeError(f"Global runner failed with exit code {proc.returncode}")
    report_json = parse_stdout_value(proc.stdout, "GLOBAL_REPORT_JSON")
    if not report_json:
        raise RuntimeError("Global runner did not print GLOBAL_REPORT_JSON")
    p = Path(report_json)
    if not p.exists():
        raise RuntimeError(f"Global report does not exist: {p}")
    return p


def latest_global_report(global_outdir: Path) -> Path:
    runs = sorted(global_outdir.glob("run_*/global_audit_report.json"))
    if not runs:
        raise RuntimeError(f"No global reports found in {global_outdir}")
    return runs[-1]


def read_issues_csv(path: Path) -> tuple[list[dict[str, str]], Counter, Counter]:
    if not path.exists():
        raise RuntimeError(f"Missing issues CSV: {path}")
    rows: list[dict[str, str]] = []
    sev_counts: Counter[str] = Counter()
    check_counts: Counter[tuple[str, str]] = Counter()
    with path.open(newline="") as f:
        reader = csv.DictReader(f)
        expected = {"severity", "check", "vehicle", "row_ref", "details"}
        actual = set(reader.fieldnames or [])
        if expected - actual:
            raise RuntimeError(f"Issues CSV schema mismatch at {path}: missing {sorted(expected - actual)}")
        for row in reader:
            rows.append(row)
            sev = (row.get("severity") or "").strip()
            check = (row.get("check") or "").strip()
            sev_counts[sev] += 1
            check_counts[(sev, check)] += 1
    return rows, sev_counts, check_counts


def normalize_count_map(raw: Any) -> Counter[str]:
    c: Counter[str] = Counter()
    if isinstance(raw, dict):
        for k, v in raw.items():
            c[str(k)] = int(v)
    return c


def rel(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT_DIR.parent))
    except Exception:
        return str(path)


def build_md(report: dict[str, Any]) -> str:
    lines: list[str] = []
    lines.append("# Trust Pack Report")
    lines.append("")
    lines.append(f"- Generated at: `{report['generated_at_utc']}`")
    lines.append(f"- Global report: `{report['global_report_json']}`")
    lines.append(f"- Status: `{report['status']}`")
    lines.append(f"- Findings: `{len(report['findings'])}`")
    lines.append("")
    lines.append("| Scope | Fail | Warn | CSV Rows | Warning Governance | Verdict |")
    lines.append("|---|---:|---:|---:|---|---|")
    for row in report["scopes"]:
        lines.append(
            f"| `{row['scope']}` | {row['summary_fail_count']} | {row['summary_warn_count']} | "
            f"{row['issues_csv_rows']} | `{row.get('warning_governance_status', 'PASS')}` | `{row['verdict']}` |"
        )

    if report["findings"]:
        lines.append("")
        lines.append("## Findings")
        lines.append("")
        for f in report["findings"]:
            scope = f.get("scope", "global")
            lines.append(f"- `{scope}` `{f['code']}`: {f['message']}")
    else:
        lines.append("")
        lines.append("## Findings")
        lines.append("")
        lines.append("- none")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Trust pack validator for audit engine outputs.")
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY, help="Path to trust policy JSON")
    parser.add_argument(
        "--global-runner",
        type=Path,
        default=DEFAULT_GLOBAL_RUNNER,
        help="Path to global runner script",
    )
    parser.add_argument(
        "--global-outdir",
        type=Path,
        default=DEFAULT_GLOBAL_OUTDIR,
        help="Path to global output folder",
    )
    parser.add_argument(
        "--trust-outdir",
        type=Path,
        default=DEFAULT_TRUST_OUTDIR,
        help="Path to trust output folder",
    )
    parser.add_argument(
        "--no-run-global",
        action="store_true",
        help="Use latest existing global report instead of running fresh",
    )
    args = parser.parse_args()

    policy = json.loads(args.policy.read_text())
    if args.no_run_global:
        global_report_json = latest_global_report(args.global_outdir)
    else:
        global_report_json = run_global(args.global_runner, args.global_outdir)
    global_report = json.loads(global_report_json.read_text())

    allowed_warn_by_scope = policy.get("allowed_warning_checks_by_scope", {})
    forbidden_substrings = [str(x).lower() for x in policy.get("forbidden_check_substrings", [])]
    require_rows_equal = bool(policy.get("require_dashboard_rows_equal_db_subscriptions", False))

    findings: list[dict[str, str]] = []
    scope_out: list[dict[str, Any]] = []

    for scope in global_report.get("scopes", []):
        scope_name = str(scope.get("scope"))
        report_json_path = Path(str(scope.get("report_json")))
        report = json.loads(report_json_path.read_text())
        summary = report.get("summary", {})

        issues_csv = Path(str(scope.get("issues_csv")))
        rows, sev_counts, check_counts = read_issues_csv(issues_csv)

        summary_fail = int(summary.get("fail_count", 0))
        summary_warn = int(summary.get("warning_count", 0))
        if summary_fail != sev_counts.get("fail", 0):
            findings.append(
                {
                    "scope": scope_name,
                    "code": "summary_fail_count_mismatch",
                    "message": f"summary={summary_fail} csv={sev_counts.get('fail', 0)}",
                }
            )
        if summary_warn != sev_counts.get("warn", 0):
            findings.append(
                {
                    "scope": scope_name,
                    "code": "summary_warn_count_mismatch",
                    "message": f"summary={summary_warn} csv={sev_counts.get('warn', 0)}",
                }
            )

        summary_fail_by = normalize_count_map(summary.get("fail_by_check"))
        summary_warn_by = normalize_count_map(summary.get("warn_by_check"))
        csv_fail_by: Counter[str] = Counter()
        csv_warn_by: Counter[str] = Counter()
        for (sev, check), count in check_counts.items():
            if sev == "fail":
                csv_fail_by[check] += count
            elif sev == "warn":
                csv_warn_by[check] += count

        if summary_fail_by != csv_fail_by:
            findings.append(
                {
                    "scope": scope_name,
                    "code": "fail_by_check_mismatch",
                    "message": f"summary={dict(summary_fail_by)} csv={dict(csv_fail_by)}",
                }
            )
        if summary_warn_by != csv_warn_by:
            findings.append(
                {
                    "scope": scope_name,
                    "code": "warn_by_check_mismatch",
                    "message": f"summary={dict(summary_warn_by)} csv={dict(csv_warn_by)}",
                }
            )

        if summary_fail > 0:
            findings.append(
                {
                    "scope": scope_name,
                    "code": "scope_has_failures",
                    "message": f"fail_count={summary_fail}",
                }
            )

        allowed_warn = set(str(x) for x in allowed_warn_by_scope.get(scope_name, []))
        for check, count in sorted(csv_warn_by.items()):
            if check not in allowed_warn:
                findings.append(
                    {
                        "scope": scope_name,
                        "code": "unexpected_warning_check",
                        "message": f"{check} (count={count}) not in allow-list",
                    }
                )

        findings.extend(evaluate_warning_governance(scope_name, dict(csv_warn_by), policy))

        for row in rows:
            check = str(row.get("check") or "").lower()
            for bad in forbidden_substrings:
                if bad in check:
                    findings.append(
                        {
                            "scope": scope_name,
                            "code": "forbidden_check_pattern",
                            "message": f"check='{row.get('check','')}' contains '{bad}'",
                        }
                    )
                    break

        if require_rows_equal:
            dash_rows = summary.get("dashboard_active_rows")
            db_subs = summary.get("db_subscriptions")
            if isinstance(dash_rows, (int, float)) and isinstance(db_subs, (int, float)):
                if int(dash_rows) != int(db_subs):
                    findings.append(
                        {
                            "scope": scope_name,
                            "code": "dashboard_vs_subscriptions_count_mismatch",
                            "message": f"dashboard_active_rows={int(dash_rows)} db_subscriptions={int(db_subs)}",
                        }
                    )

        scope_has_findings = any(f["scope"] == scope_name for f in findings)
        scope_out.append(
            {
                "scope": scope_name,
                "summary_fail_count": summary_fail,
                "summary_warn_count": summary_warn,
                "issues_csv_rows": len(rows),
                "verdict": "FAIL" if scope_has_findings else "PASS",
                "report_json": str(report_json_path),
                "issues_csv": str(issues_csv),
                "warning_governance_status": "FAIL"
                if any(
                    f["scope"] == scope_name and str(f.get("code", "")).startswith("warning_")
                    for f in findings
                )
                else "PASS",
            }
        )

    status = "PASS" if not findings else "FAIL"
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    out_dir = args.trust_outdir / f"run_{stamp}"
    out_dir.mkdir(parents=True, exist_ok=False)

    final = {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "policy_version": policy.get("version"),
        "global_report_json": str(global_report_json),
        "scopes": scope_out,
        "findings": findings,
    }
    json_path = out_dir / "trust_pack_report.json"
    md_path = out_dir / "trust_pack_summary.md"
    json_path.write_text(json.dumps(final, indent=2))

    final_md = dict(final)
    final_md["global_report_json"] = rel(Path(final["global_report_json"]))
    for row in final_md["scopes"]:
        row["report_json"] = rel(Path(row["report_json"]))
        row["issues_csv"] = rel(Path(row["issues_csv"]))
    md_path.write_text(build_md(final_md))

    print(f"TRUST_RUN_DIR: {out_dir}")
    print(f"TRUST_REPORT_JSON: {json_path}")
    print(f"TRUST_REPORT_MD: {md_path}")
    print(f"TRUST_STATUS: {status}")
    print(f"FINDINGS_COUNT: {len(findings)}")

    return 0 if status == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
