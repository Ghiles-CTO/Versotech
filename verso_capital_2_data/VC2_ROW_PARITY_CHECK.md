# VC2 Row Parity Check (Client File vs Dashboard)

## Scope and Method
- Client file: `verso_capital_2_data/VERSO Capital 2 SCSp Emails and Contacts.xlsx`
- Dashboard: `verso_capital_2_data/VERSO DASHBOARD_V1.0.xlsx`
- Included vehicles: `VC201, VC202, VC203, VC206, VC207, VC209, VC210, VC211, VC215`
- `VCL001` and `VCL002` are mapped into `VC203`.
- Red rows in client file excluded.
- Dashboard subscription row definition:
  - investor name present (entity or person fields), and
  - `Amount invested` present
  - blank/footer rows excluded

## Counts
| VC | Client rows | Client unique investors | Dashboard subscription rows | Dashboard unique investors |
|---|---:|---:|---:|---:|
| VC201 | 1 | 1 | 1 | 1 |
| VC202 | 2 | 2 | 2 | 2 |
| VC203 | 23 | 16 | 19 | 17 |
| VC206 | 18 | 14 | 16 | 14 |
| VC207 | 25 | 24 | 25 | 24 |
| VC209 | 27 | 22 | 25 | 22 |
| VC210 | 2 | 2 | 2 | 2 |
| VC211 | 1 | 1 | 1 | 1 |
| VC215 | 24 | 15 | 19 | 15 |

## Interpretation
- Raw row counts are **not** expected to be equal for all vehicles.
- The client file is a contact/relationship matrix, so one investor can appear multiple times with different role/introducer rows.
- For migration safety, unique-investor parity is the useful signal.

## Name Diffs Found
- VC203:
  - client-only: `Robert VOGT IV`
  - dashboard-only: `Robert C VOGT IV`
  - dashboard-only: `Infinitas Capital SPV VII a series of Infinitas Capital Master LLC`
- VC207:
  - same people, wording order differs for 2 joint-investor names
- VC215:
  - same person wording differs: `George Guoying CHEN` vs `Georges CHEN`

## Practical Next Rule
- Proceed vehicle-by-vehicle using row-level dashboard data as source of truth.
- Use client file to enrich contacts/introducer mappings.
- For VC203, explicitly confirm whether `Infinitas Capital SPV VII...` is intentionally omitted from client contacts.

