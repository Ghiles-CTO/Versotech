# Julien V2 Missing Emails - Prod Reconciliation (2026-02-09)

Source spreadsheet: `verso_capital_2_data/Investors emails missing for Julien_V2.xlsx` (sheet `Sheet1`).

## Spreadsheet Formatting (facts)
- Red-highlighted rows: 15 (rows 14, 20, 25, 29, 30, 32, 45, 47, 49, 51, 63, 65, 78, 80, 81).
- Strikethrough text: none detected in cells with values.

Interpretation:
- Column `Legal Name` is the investor label used in the report (often corresponds to `investors.legal_name` or `investors.display_name`).
- Column `Email` is the investor email to set when present; `N/A` / blank means “no email provided”.
- Columns `Role` / `Name` / `Email 1` / `Email 2` are introducer/asset-manager contact references (not always investors).

## Prod DB Changes Applied
These were applied directly in **production** to align with the Julien_V2 spreadsheet.

### 1) Investor email correction
- `public.investors` `31dccf8d-314a-4fa9-80af-9c02732bff31` (`CARTA INVESTMENTS LLC`)
  - Email: `kbhatela@dbdiagnostics.com` -> `kbhathela@dbdiagnostics.com`
  - Note: Spreadsheet row shows `CARTA INVESTMENTS LLC (on behalf of Kavel BATHELA)`; we match that to the canonical investor `CARTA INVESTMENTS LLC`.

### 2) Investor name corrections (typos / expanded name)
- `public.investors` `12932ec5-c9bc-472c-9b8b-2cf4eeae2949`
  - `Hossien JAVID` -> `Hossein JAVID` (legal_name, display_name, first_name)
- `public.investors` `1bb4d74d-50e7-410d-b852-923c4f26d504`
  - `Imrat HAYAT` -> `Imran HAYAT` (legal_name, display_name, first_name)
- `public.investors` `3bcf1a6c-9c51-4a32-89da-33d89e596ccd`
  - `Kevin WILTSHIRE` -> `Kevin FOSTER WILTSHIRE` (legal_name, display_name)
  - first/middle/last already had `Kevin` / `FOSTER` / `WILTSHIRE` so this is a display/legal-name alignment only.
- `public.investors` `6a8571b3-4b3d-49f5-b49a-0357aff40a34`
  - `Luiz FONTES WILLIAMS` -> `Eduardo Luiz FONTES WILLIAMS` (legal_name, display_name)
  - First/middle swapped to match the spreadsheet intent: first_name=`Eduardo`, middle_name=`Luiz`, last_name=`FONTES WILLIAMS`.
  - Email remains missing (spreadsheet provides no email).

## Verification (post-change)
### Email rows with expected values
- Rows with a concrete email in the spreadsheet (not `N/A` / blank): **69**
- Result: **69 / 69 match** the current `public.investors.email` after applying the changes above.

### Investors still missing emails (expected = blank/N/A AND DB email is NULL)
The spreadsheet does not provide emails for these, and they remain missing in Prod:
- Alberto RAVANO
- Alexandre BARBARANELLI
- Antonio PERONACE
- Bernard DUFAURE
- Dario SCIMONE
- Frederic SAMAMA
- Georges CYTRON
- Giovanni ALBERTINI
- Guillaume SAMAMA
- Laurent CUDRE-MAUROUX
- Lubna QUNASH
- Eduardo Luiz FONTES WILLIAMS
- MARSAULT INTERNATIONAL LTD
- Mathieu MARIOTTI
- MONFIN LTD
- Raphael GHESQUIERES
- Rosario RIENZO
- SWISS TRUSTEES OF GENEVA SA as Trustees of the LUTEPIN TRUST
- Tartrifuge SA
- TEKAPO Group Limited

### Notes / Non-investor rows inside the sheet
Rows 88–95 (`Valoris Gestion`, `Stableton`, `Barclays Bank`, `Stanhope Capital`, `SAFE`, `Anyma Capital`, `BTG Pactual`, `UBS`) do **not** match any `public.investors` record by name.
They look like a separate “asset manager / bank / contact list” section, not investor accounts.

