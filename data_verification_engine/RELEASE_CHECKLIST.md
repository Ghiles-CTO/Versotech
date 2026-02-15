# Audit Release Checklist

1. Run strict gate:
   - `bash data_verification_engine/verify_all_scopes.sh`
2. Confirm terminal output contains:
   - `TRUST_STATUS: PASS`
   - `FINDINGS_COUNT: 0`
3. Open latest trust summary:
   - `data_verification_engine/output/trust/run_<timestamp>/trust_pack_summary.md`
4. Verify scope totals in trust summary:
   - `vc1 fail=0`
   - `vc2 fail=0`
   - `in fail=0`
5. Verify warnings are only ruled/allow-listed categories in trust summary.
6. Archive run paths in checkpoint before any export or client delivery.
