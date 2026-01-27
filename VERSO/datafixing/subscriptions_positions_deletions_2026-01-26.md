# Subscriptions/Positions Cleanup (2026-01-26)

## Rule Applied
- **Delete** subscriptions where dashboard ownership/units = 0.
- **Delete** positions where units = 0.
- Keep **introductions/commissions/investors** intact.

## Actions Taken (Prod)
### Subscriptions deleted (4)
- `61d46702-97ba-48d5-ad22-8827168c26e9` (VC111) — commitment 50,000; shares 50,000; contract_date NULL
- `eb1f18e8-042b-4b62-997c-5ee19000b9c8` (IN110) — negative shares transfer row; commitment NULL; funded 0
- `5fb4a18d-5686-4bcb-bd25-d92423c00fce` (VC113) — commitment 2,000,000; contract_date NULL
- `4365f722-76b9-47e0-b6c3-d65b237c0352` (VC122) — commitment 99,999.65; contract_date 2023-08-14

### Positions deleted (0)
- No positions with `units = 0` found for the 29 in-scope vehicles.

## Regenerated Outputs
- `datamigration/05_Introducer_Commissions.xlsx` (1364 rows)
- `datamigration/06_Full_Subscription_Data_REGENERATED.xlsx` (492 rows + TOTALS)

## Notes
- Deletions were performed via Supabase REST (service role key) due to MCP auth error.
- No introducer or commission records were removed as part of this cleanup.
