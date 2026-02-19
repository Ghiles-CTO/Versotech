# Missing Emails - Client Files Review (No DB Changes)

This note summarizes what is inside the **two client-provided spreadsheets** currently in `verso_capital_2_data/`, focusing on **cell colors** and **strikethrough**, and what they imply we need to change in our missing-emails report logic.  
No database updates were performed as part of this review.

## Files Reviewed

1. `verso_capital_2_data/Missing_Emails_Report_VFD.xlsx`
   - Sheet: `Missing Emails`
   - Size: 31 rows x 6 cols (row 1 is header)
   - Fill colors detected: **Red** (`FFFF0000`), **Green** (`FF00B050`)
   - Strikethrough detected by openpyxl: **none**

2. `verso_capital_2_data/Investors emails missing for Julien_V2.xlsx`
   - Sheet: `Sheet1`
   - Size: 100 rows x 12 cols
   - Fill colors detected: **Red** (`FFFF0000`), **Green** (`FF00B050`), **Blue header** (`FF4472C4`), plus some **theme-based** fills (Excel theme index 0 with tint, not RGB).
   - Strikethrough detected by openpyxl: **1 cell** (`G33`) but the cell value is blank (likely a leftover style, not a meaningful “strike this text” instruction).

## 1) `Missing_Emails_Report_VFD.xlsx` - Color Meaning + Red Rows

Client instruction: **“Rows in red cannot be included.”**  
In this file, the red fill is not applied to the entire row, but to some cells within it. We treat the row as red/excluded if **any cell** in the row has the red fill.

### Red (Excluded) Rows

- Row 3:
  - Type: `introducer`
  - Legal name: `Altras+Andrew Stewart Altras Capital Financing Broker`
  - Email: `rick@altrascapital.com`
  - Entity codes: `IN103`
  - Comment: `should be Altras Capital Financing Broker - same as Rick`

- Row 4:
  - Type: `introducer`
  - Legal name: `Andrew Stewart`
  - Email: `andrewstewart12@me.com`
  - Entity codes: `IN103`

Interpretation (from the comments + red flag):
- These entries should **not** be introduced as separate missing-email items.
- The intended canonical record is **Altras Capital Financing Broker (Rick)**, not “Altras+Andrew …” and not “Andrew Stewart” as an introducer entry.

### Green Cells

Green fill in this file appears only on **column B (Legal Name)** for a block of rows (mostly investor names + VERSO BI/PARTNER).  
The file doesn’t explicitly define green semantics; it likely indicates “still missing / needs attention”, but it is not an exclusion marker.

## 2) `Investors emails missing for Julien_V2.xlsx` - Color Meaning

This sheet is a broader contact list with columns:
- `Legal Name`, `Type`, `Email Status`, `Email`, `Comments`, `Role`, plus additional contact columns.

### Red Rows

15 rows contain red fill (`FFFF0000`). They are all **Role = Introducer** rows with missing email (`N/A` or blank).  
Example red rows (not exhaustive):
- Bernard DUFAURE (VC6) – Introducer – Email `N/A`
- Dario SCIMONE – Introducer – Email `N/A`
- SWISS TRUSTEES … LUTEPIN TRUST (VC6) – Introducer – Email `N/A`
- Tartrifuge SA (VC111) – Introducer – Email blank
- TEKAPO Group Limited (VC113) – Introducer – Email blank

If we follow the same “red = cannot be included” rule here, then these are **explicitly excluded** from any missing-email report intended for actioning.

### Green Rows

Green fill (`FF00B050`) appears on a handful of rows where `Role = Asset Manager` and email is blank.  
Again, no explicit legend is present; green does not appear to mean “exclude”.

### Strikethrough

Only `G33` (column “Name”) is struck through and blank. Nothing else in the file is struck through at the cell-font level.

## What’s Wrong With Our Previously-Sent Report (Observed Deltas)

Comparing `Missing_Emails_Report.xlsx` (our older export) to `Missing_Emails_Report_VFD.xlsx` (client’s correction):

- Our file contains 14 entries that do **not** appear in the VFD list, including:
  - `introducer Simone` (client wants **Manna Capital** instead)
  - `introducer Julien Machot` (not present in VFD)
  - Several VC106 investors not present in VFD: `Aaron RIKHYE`, `Ekta DATT`, `Lakin HARIA`, `Mohamad BIN MOHAMED`, `Nidhi GANERIWALA`, `Rajesh SUD`, `Rajiv KAPOOR`, `Rasika KULKARNI`, `Sheetal HARIA`, `Tapan SHAH`

- VFD provides specific replacements and/or richer legal names:
  - `Alpha Gaia` should be `Alpha Gaia ALPHA GAIA CAPITAL FZE`
  - `Setcap+Daniel Baumslag` row is actually **Set Cap (Anand)** + a note that “Daniel details are above”
  - `Manna Capital` should be used instead of `Simone`

- VFD supplies emails we didn’t fill:
  - Daniel Baumslag → `dbaumslag@versoholdings.com`
  - FINSA → `alesantero@gmail.com`
  - Manna Capital → `simone@mannacapa.com`
  - Pierre Paumier → `pierre_paumier@yahoo.fr`
  - Set Cap (+Daniel row) → `anand@set-cap.com`
  - Alpha Gaia ALPHA GAIA CAPITAL FZE → `amc@alphagaiacap.com`

## Next Step (When You Say “Go”)

1. Treat `Missing_Emails_Report_VFD.xlsx` as the authoritative correction list:
   - Exclude the **red** rows.
   - Apply the replacement semantics from the Comments.
2. Rebuild the missing-email report from production with:
   - “has data” filter (subscriptions for investors; commissions/introductions for introducers),
   - name normalization + client replacement rules (e.g., Manna Capital replaces Simone),
   - optional: include a separate “unknown email” section vs “email provided by client” section (to reduce noise).

