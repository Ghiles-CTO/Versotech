# Missing Emails / Contact Fixes Applied (Prod) - 2026-02-09

Based on the client’s list (Type/Legal Name/Email/Entity Codes/Comments), the following Production DB changes were applied.

## Introducers
### Gaia Capital (was "Alpha Gaia")
- Updated introducer `bc23b7c7-4253-40c2-889b-97a5044c23d5`
  - `legal_name`: `Alpha Gaia` -> `Gaia Capital`
  - `display_name`: `Alpha Gaia` -> `Gaia Capital`
  - `email`: `NULL` -> `amc@alphagaiacap.com`

### Altras Capital Financing Broker (Rick)
- Introducer `Altras+Andrew Stewart` was removed earlier (merged then hard-deleted).
- Confirmed canonical introducer is `55b67690-c83d-4406-a2b4-935032d22739`
  - Updated email: `rick@altraswealth.com` -> `rick@altrascapital.com`

### Andrew Stewart
- Introducer `dc2981a3-e822-4c17-8e62-a07962f9d18c`
  - Email already present: `andrewstewart12@me.com` (no change required)

### Daniel Baumslag
- Introducer `18aecf7f-4793-405d-b7f3-d9add75f8063`
  - `email`: `NULL` -> `dbaumslag@versoholdings.com`

### FINSA (Alessandro SANTERO)
- Introducer `5a765445-bee7-4716-96f6-e2e2ca0329c7`
  - `email`: `NULL` -> `alesantero@gmail.com`

### Manna Capital (use instead of "Simone")
- Introducer `a2a0b0a1-817a-4039-bcbf-160b84f51567`
  - `email`: `NULL` -> `simone@mannacapa.com`
- Removed introducer `Simone` by consolidating its data into `Manna Capital`:
  - Repointed all FK references from `Simone` (`0fb4a241-70c1-4d83-ae1e-fb0c684a18f4`) -> `Manna Capital`
  - Hard-deleted `Simone` introducer row

### Pierre Paumier
- Introducer `41974010-e41d-40a6-9cbf-725618e7e00c`
  - `email`: `NULL` -> `pierre_paumier@yahoo.fr`

### Set Cap + Daniel Baumslag
- This combined introducer was removed earlier:
  - `Setcap+Daniel Baumslag` (`ade750b8-011a-4fd2-a32c-30ba609b5643`) was repointed to `Set Cap` then hard-deleted.

## Verification Notes
- `Simone` introducer no longer exists in `public.introducers`.
- Manna Capital counts increased accordingly after consolidation.

