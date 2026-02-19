# QA Audit Report — Client Extract Package

**Audit date:** 2026-02-16
**Auditor:** Independent review (Claude)
**Package:** `client_package_2026-02-14_excel/`

---

## VERDICT: DO NOT SEND AS-IS

The package contains real, verified data and the numbers are mathematically correct. But the presentation has serious issues that would undermine client confidence: floating-point garbage in Excel cells, raw SQL and database terms visible, internal file paths exposed, ~825K in commission deltas with no explanation, and a "Business Meaning" column that's essentially fake. These need fixing before delivery.

---

## CRITICAL — Must fix before sending

### C1. Floating-point noise throughout Files 06 and 07

**Impact:** Client sees values like `7.450580596923828e-09` instead of `0.00`, and `3838.9999996` instead of `3839.00`. 43+ affected cells across both files. This will immediately destroy confidence in the audit.

**Files:** `06_Vehicle_Totals_Extract_Dashboard_vs_DB.xlsx` (Vehicle_Totals_Extract sheet), `07_Vehicle_Summary_Extract_Client.xlsx` (all numeric sheets)

**Examples:**
| Vehicle | Column | Displayed | Should Be |
|---------|--------|-----------|-----------|
| VC106 | Delta Commitment | `7.450580596923828e-09` | 0.00 |
| VC106 | Delta Comm Invested | `-0.009999999951105565` | -0.01 |
| VC210 | Dash Comm Invested | `3838.9999996` | 3,839.00 |
| VC113 | Delta Commitment | `-3.725290298461914e-09` | 0.00 |

**Fix:** Round all financial values to 2 decimal places. Format cells as Number with 2 decimals and thousand separators.

---

### C2. Raw SQL statements visible in File 04

**Impact:** A client should never see database commands in a deliverable.

**File:** `04_All_Data_Changes_Consolidated.xlsx`, Change_Detail_By_Section sheet

**Examples:**
- Row 10: `UPDATE subscriptions SET cost_per_share = 35, spread_per_share = 33...WHERE id = '[record id]'`
- Row 16: `UPDATE subscriptions SET bd_fee_percent = NULL`
- Rows 23-24: `DELETE FROM introducer_commissions`

**Fix:** Replace SQL with plain English descriptions of what was changed.

---

### C3. Internal file paths and system references exposed

**Impact:** Reveals internal tooling, directory structure, and system architecture to the client.

**Files:** 04 (Source_Files_Used sheet, Business Context cells), 05 (Latest_Run_Evidence sheet)

**Examples:**
- `data_verification_engine/output/global/run_20260215_133955/global_audit_report.json`
- `data_verification_engine/scopes/vc1/output/run_20260215_144000/audit_report.json`
- `bash data_verification_engine/verify_all_scopes.sh`
- `run_in_audit.py`, `.md`, `.py`, `.sh` file references

**Fix:** Remove all internal paths. Replace with client-friendly references like "Internal validation report" or remove the Latest_Run_Evidence sheet entirely.

---

### C4. ~825K commission gap unexplained

**Impact:** Seven vehicles show large commission differences between dashboard and DB totaling ~825,946. Files 06 and 07 show the numbers but provide zero explanation. A client will immediately ask: "Why is 825K of commission missing from the database?"

**Vehicles affected:**
| Vehicle | Delta |
|---------|-------|
| IN102 | -74,882 |
| IN103 | -269,999 |
| VC203 | -60,674 |
| VC207 | -26,139 |
| VC209 | -252,681 |
| VC215 | -141,572 |

**Fix:** Add an explanation column to the Deltas_To_Review sheet in File 07, and/or add a narrative note in File 05 explaining these are known, ruled differences (commission entries that exist in the dashboard but were validated as not applicable to the DB scope, or broker exclusions, etc.).

---

### C5. File 03 "Business Meaning" column is templated, not real

**Impact:** 85 rules share only 9 generic phrases. Rule R06 ("Introducer cleanup / merge") gets the same business meaning as R58 ("No SELECT * in queries"): "Ensures this documented rule is applied consistently." A client reading this column learns nothing.

**File:** `03_All_Rules_Applied_Full_Register.xlsx`, All_Rules_Detailed sheet, column D

**Fix:** Write a unique, specific business explanation for each rule. E.g., R06: "When two introducer records referred to the same firm, they were merged into one to prevent double-counting of commission payments."

---

### C6. 29% of rules contain raw technical terms

**Impact:** Despite the Read_Me_First tab claiming "technical code references intentionally removed," 25 of 85 rules contain database column names (`rate_bps`, `accrual_amount`, `investor_id`), SQL syntax (`SELECT *`, `NULL`), or shell commands (`set -euo pipefail`).

**File:** `03_All_Rules_Applied_Full_Register.xlsx`, All_Rules_Detailed sheet

**Worst offenders:**
- R58: "No SELECT * in queries" — pure engineering, not a business rule
- E18: "Gate script — verify_all_scopes.sh with set -euo pipefail" — bash scripting
- E07: "fraction_or_percent_strict" — internal engine mode name
- E10: "restrict_to_db_vehicles_with_data" — config parameter

**Fix:** Translate all technical terms to business language. Remove or relabel R58 and E18 as internal controls not visible to client.

---

### C7. Contradictory change totals within File 04

**Impact:** Sheet 3 (Change_Detail_By_Section) Row 2 says "~165 rows updated, 74 deleted, 18 created" but Sheet 4 (Change_Volume_Summary) says "181 updated, 70 deleted, 19 created." These contradict each other in the same file.

**File:** `04_All_Data_Changes_Consolidated.xlsx`

**Fix:** Use a single consistent set of totals. Update the narrative in Sheet 3 to match Sheet 4's actual counts, or add a note explaining the difference (later checkpoints added more changes).

---

## HIGH — Should fix before sending

### H1. No scope legend anywhere

VC1, VC2, and IN are used throughout all files but never defined. A client doesn't know these mean VERSO Capital 1, VERSO Capital 2, and VERSO Income (or whatever the actual fund names are).

**Fix:** Add a scope legend to File 02 or a shared "Legend" sheet: VC1 = [full name, X vehicles], VC2 = [full name, Y vehicles], IN = [full name, Z vehicles].

### H2. Technical database terms throughout File 04

`NULL`, `FK`, `investor_id`, `rate_bps`, `basis_type`, `accrual_amount` appear freely. A business client should see "blank" not "NULL", "reference link" not "FK".

**Fix:** Search-and-replace all technical terms with business equivalents.

### H3. No warning count or breakdown in File 05

File 05 references "warnings" as "documented informational items" but never states how many exist (currently 52) or what categories they fall into. A client who sees "warnings" mentioned elsewhere will want to know what they are.

**Fix:** Add a warnings summary table showing category, count, and one-line explanation.

### H4. File 02 is too high-level

No specific fields listed, no tolerance thresholds explained, no definition of "the dashboard" and "the database" as data sources, no date stamp, no cross-references to other files.

**Fix:** Add field list, define data sources, add date stamp, add step numbers, reference other deliverables.

### H5. Backtick markdown formatting in File 05

Cell values contain backtick-wrapped filenames (e.g., `` `02_Engine_Operation_And_Method.pdf` ``). These render as literal backtick characters in Excel.

**Fix:** Remove all backticks.

### H6. Alarming language in File 04 without context

"3 investor records removed", "REVERSED", "66 similar empty artifacts exist", "Remaining Open Items" — these could alarm a client without sufficient framing.

**Fix:** Add client-friendly context. E.g., "3 duplicate investor records were merged into their correct single records — no investor data was lost."

---

## MEDIUM — Nice to fix

### M1. No old/new value columns in File 04 change log

Most entries say "UPDATE (3 fields)" without specifying which fields or what the old/new values were. A client cannot see exactly what changed.

### M2. 88 position count gap (557 subs vs 469 positions) unexplained

Dashboard shows 557 subscriptions but only 469 DB positions. Likely because zero-value subscriptions don't generate positions, but this is never stated.

### M3. 4 blank Business Context cells in File 04

Rows 31, 32, 39, 43 in Change_Detail_By_Section have empty context.

### M4. 4 blank rate cells in File 03

Specific_Commission_Rules rows 10-13 (IN103/Zandera) have empty "Expected Rate (bps)" values with no explanation.

### M5. No freeze panes or row banding in any file

With 65-85 row tables, frozen headers and alternating row colors would significantly improve readability.

### M6. Duplicate data between Files 06 and 07

File 07's Fees_Commissions_By_Vehicle sheet largely duplicates File 06. Could confuse a client seeing the same numbers in two places.

---

## What's good

- All delta arithmetic is 100% correct across all vehicles and metrics
- All expected vehicles accounted for (31 present + 2 excluded with reason)
- Files 06 and 07 are perfectly consistent with each other
- Scope totals sum correctly from vehicle-level data
- Grand total row matches scope sums
- No UUIDs exposed (redacted to `[record id]`)
- File 07's OK/Review status system is clear and intuitive
- File 03 has all 85 rules present with sequential IDs
- File 04's change volume summary is clear and well-structured
- Introducer and investor mapping tables in File 03 are complete and useful

---

## SEND / NO-SEND RECOMMENDATION

**NO-SEND** until the 7 critical items (C1-C7) are fixed.

**Minimal fix list to make it sendable:**
1. Round all numbers to 2 decimals in Files 06/07
2. Remove SQL, file paths, and bash commands from Files 04/05
3. Add explanation for the ~825K commission delta
4. Write real business meanings for File 03's rules (or at minimum, remove the fake generic column and leave only the "Exact Rule Wording" column)
5. Translate technical terms (NULL, FK, rate_bps) to business language
6. Fix contradictory totals in File 04
7. Add scope legend (VC1/VC2/IN = fund names)

**After these 7 fixes, the package would be ready to send.**
