# VC106 Commission Deduplication Log

Date: 2026-01-31T17:55:24.445015Z

Action: Deleted exact duplicate introducer_commissions rows for VC106.

Source list:
- VERSO/datafixing/vc106_commission_duplicates_to_delete.csv (497 ids)
- VERSO/datafixing/vc106_commission_duplicates_delete_01.sql
- VERSO/datafixing/vc106_commission_duplicates_delete_02.sql
- VERSO/datafixing/vc106_commission_duplicates_delete_03.sql

Verification query:
- duplicate_groups = 0, extra_records = null (post-delete)
