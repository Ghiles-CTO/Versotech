# VC106 VFD vs DB diff (no DB changes applied)

Source file: `dashboardreconciliations/06_Full_Subscription_Data_VFD.xlsx`
Scope: VC106 only. Partner/BI are introducers (no new roles created). This is **analysis only**.

## Summary of differences found

**1) Funded Amount mismatches (DB has 0, VFD has commitment)**
- Bank SYZ AG rows 61–68: DB funded_amount = 0 for all listed subscriptions, VFD funded_amount = commitment.
  - These are the rows flagged by the client for “funded amount should not be 0”.
  - Action if approved: set `funded_amount = commitment` for those Bank SYZ subscriptions.

**2) Investor name mismatch (VFD still shows group / entity, DB already split into individuals)**
- **LEE RAND GROUP** rows 158–164: VFD investor_name = “LEE RAND GROUP”, DB has individual investors:
  - Ekta DATT (sub `b587c756-0e1b-4167-be71-5723a1371d8e`)
  - Rasika KULKARNI (sub `54a1e954-b373-434c-9525-9da4feb16f0c`)
  - Nidhi GANERIWALA (sub `620c6086-6150-44d7-ae23-9d4d89c71a66`)
  - Rajiv KAPOOR (sub `28d58594-1451-4f06-90ad-de41a9e8eaac`)
  - Atima HARALALKA (sub `756b3528-4cca-4a55-8d33-05deaa2dbbd8`)
  - Mohamad BIN MOHAMED (sub `c41fba0a-d819-4d13-9784-5355fa2c350d`)
- **Hedgebay Securities LLC** rows 120–123: VFD investor_name = Hedgebay Securities LLC, DB has individuals:
  - Sheetal HARIA (sub `d55172f3-92a3-4484-8f32-c58e9732936b`)
  - Lakin HARIA (sub `7aeec746-b471-420a-a644-3397dc85a022`)
  - Aaron RIKHYE (sub `7af9e289-52d2-4a71-af1e-e99ec7076978`)

**Interpretation:** DB is already split into individuals (per your rule). VFD still has group/entity labels. Either update VFD to the individual names or confirm that DB must be collapsed back to the group (not recommended per your rule).

**3) VERSO GROUP row zeroed in VFD but non‑zero in DB**
- VFD row 228: commitment/shares/current_position all **0**.
- DB has **commitment=90,940**, shares **4,547**, current_position **4,547** for `VERSO GROUP` (sub `bc327950-a90b-40be-adab-e6e3bf184623`).
- If VFD is source of truth and zeroed rows must be removed, this subscription + position should be deleted (commissions stay).

**4) Current Position mismatches**
- Many rows show `current_position` mismatch because positions are stored **per investor** (aggregated across multiple subscriptions), while VFD lists per‑subscription current positions.
- Examples: Blaine ROLLINS, Damien Krauser, Eric LE SEIGNEUR, Julien MACHOT, Laurence CHANG, Murat Cem/Mehmet Can GOKER, INNOSIGHT, Scott FLETCHER.
- These are not necessarily errors unless you require per‑subscription positions (which the DB schema does not support).

## LEE RAND GROUP fees (subscription data, not commissions)
Sum of **DB spread_fee_amount** for the six individual subscriptions:
- 13,155 + 6,575 + 9,210 + 13,155 + 6,575 + 52,630 = **101,300**

VFD “LEE RAND GROUP” spread fees (rows 158–164):
- 6,575 + 6,575 + 9,210 + 13,155 + 13,155 + 13,155 + 52,630 = **114,455**

**Reason for gap:** VFD includes **duplicate rows with funded_amount = 0** (rows 159, 161, 163) that appear to represent the second individual in each pair. Once the group is split into individuals, the totals align with DB.

## Items excluded by instruction (no DB change)
- Bank SYZ AG should be **excluded from launch** only, but remains in DB (no deletion requested).

---

If you want, I can:
1) Produce exact SQL updates for funded_amount fixes (Bank SYZ),
2) Delete the VERSO GROUP subscription+position (if confirmed),
3) Generate a corrected VFD file with individual names for LEE RAND GROUP and Hedgebay Securities (no DB change),
4) Or update DB display_name to match VFD (not recommended per your rule).
