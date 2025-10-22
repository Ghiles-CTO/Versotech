# Excel Workbook → Existing Vehicle Mapping (Initial Pass)

The table below compares each workbook “Compartments / Opportunity” entry with the current `public.vehicles` records in Supabase. A status of **MAPPED** means the workbook opportunity string exactly matches an existing `investment_name`. **REVIEW** indicates a likely match (based on `entity_code` patterns such as `VC1xx`) but needs confirmation. **UNMAPPED** requires guidance before we can wire the loader.

| Workbook Code | Workbook Opportunity | Status | Vehicle Name | Entity Code | Vehicle ID |
|---------------|----------------------|--------|--------------|-------------|------------|
| VC1 | CRANS | MAPPED | VERSO Capital 1 SCSP Series 101 | VC101 | 471ce5a0-4f02-479b-9050-b0360f9667b2 |
| VC2 | ISDC | REVIEW | VERSO Capital 1 SCSP Series 102 | VC102 | 2f2267e2-13a2-4927-a20f-0c5c369db608 |
| VC3 | NITRO COFFEE EXCHANGE LLC | REVIEW | VERSO Capital 1 SCSP Series 103 | VC103 | 6fdabfaf-9c40-40ab-a558-11e9f8d0c44f |
| VC4 | JUST WARRANTS | REVIEW | VERSO Capital 1 SCSP Series 104 | VC104 | 65909db2-d2c7-4edb-8dee-200666649595 |
| VC5 | TORONTO REAL ESTATE | MAPPED | Toronto Real Estate | VC5 | 02a2e6d0-5831-4730-826d-bd32346992ee |
| VC6 | VEGINVEST | REVIEW | VERSO Capital 1 SCSP Series 106 | VC106 | ba584abd-ea2b-4a3f-893a-c7e0999f4039 |
| VC7 | DISCOVERY | REVIEW | VERSO Capital 1 SCSP Series 107 | VC107 | 42d15ea6-577d-4cc6-9b4b-00ce7e1d1ede |
| VC8 | ETHOS | MAPPED | VERSO Capital 1 SCSP Series 108 | VC108 | 364d4350-4231-4392-b083-18809d36f01e |
| VC9 | STABLETON | REVIEW | VERSO Capital 1 SCSP Series 109 | VC109 | 80a6d019-4f6e-46b6-a451-5f659e0440fd |
| VC10 | MHA CAPITAL | MAPPED | MHA CAPITAL | VC10 | 6a6d5e13-b414-4705-aae3-0540c6fb0448 |
| VC11 | SNOWPLUS | MAPPED | VERSO Capital 1 SCSP Series 111 | VC111 | ccc0bfd0-2c76-4b80-bcb9-12702cfb60bd |
| VC12 | BETTER BRAND | MAPPED | VERSO Capital 1 SCSP Series 112 | VC112 | a76af65f-d0cb-45e7-927d-5f61791d86db |
| VC13 | TTL | REVIEW | VERSO Capital 1 SCSP Series 113 | VC113 | 8d4db38a-0119-4eef-bb1a-d9f266aef1e7 |
| VC14 | GOOD MEAT | MAPPED | VERSO Capital 1 SCSP Series 114 | VC114 | e8a7e695-129f-4b99-a7eb-3d92fcf7fc80 |
| VC15 | GOOD GAME 1 | MAPPED | Good Game 1 | VC15 | bb688299-b442-49af-9b53-373a87dfd277 |
| VC16 | MODUMATE | MAPPED | VERSO Capital 1 SCSP Series 116 | VC116 | c231310b-09e6-4730-9160-ecf712c2fb22 |
| VC17 | CONCLUDER | MAPPED | Concluder | VC17 | c693f77f-b89e-4b52-b93e-46223d9595c7 |
| VC18 | IMPOSSIBLE FOODS | MAPPED | VERSO Capital 1 SCSP Series 118 | VC118 | 47250a24-66cb-45f2-b99e-05c7db3b0b08 |
| VC19 | CARBONCLICK | MAPPED | CarbonClick | VC19 | 4024f119-20b0-4099-8f42-de2a787a92d9 |
| VC20 | JUST PRE-IPO | MAPPED | Just Pre-IPO | VC20 | 386ac333-ddac-4a0d-a16a-bcb97e6c2d35 |
| VC21 | GOODWALL | MAPPED | Goodwall | VC21 | 48e86517-6b0b-4e40-bd07-5c7d6e4e3321 |
| VC22 | MOSH | MAPPED | VERSO Capital 1 SCSP Series 122 | VC122 | 58e852f7-ed8f-40b1-9052-e0fa53ae7839 |
| VC23 | FERVERET | MAPPED | Ferveret | VC23 | 57487736-debe-441b-aaa7-ff07a70f492b |
| VC24 | DEADHAPPY | MAPPED | VERSO Capital 1 SCSP Series 124 | VC124 | 0f964c92-7941-4b78-9cad-e6831e9fbdca |
| VC25 | UMIAMI | MAPPED | VERSO Capital 1 SCSP Series 125 | VC125 | 606a4626-6397-40e4-9178-8ba187524589 |
| VC26 | SPACEX | MAPPED | VERSO Capital LLC Series 004 | VCL004 | b2ab3d22-2513-4716-9c42-2ac3410cae1d |
| VC27 | RE1 | MAPPED | RE1 Legacy | VC27 | 52ce11ea-f96e-4193-80c3-fa191e5b0ae8 |
| VC28 | SVEN | REVIEW | VERSO Capital 1 SCSP Series 128 | VC128 | 2df9e790-9e6e-4764-8fe2-b0c846f7ca21 |
| VC29 | REVOLUT | MAPPED | VERSO Capital 2 SCSP Series 202 | VC202 | ece390ff-c52d-4b5c-83a8-95d89c79a6dc |
| VC30 | SUPERWORLD | MAPPED | VERSO Capital 1 SCSP Series 130 | VC130 | 8140c262-6e0f-4120-a3ed-f451af2c85f3 |
| VC31 | ONUU | REVIEW | VERSO Capital 1 SCSP Series 131 | VC131 | 4045c54c-7b68-44c1-810d-676d6a07862d |
| VC32 | AIRSPEEDER | MAPPED | Airspeeder | VC32 | 89b57c64-b0f8-441e-98e6-6d6dc8876099 |
| VC33 | EPIC GAMES | MAPPED | VERSO Capital 1 SCSP Series 133 | VC133 | 3baefb31-5712-4b0c-9b46-beec2a37f9e4 |
| VC34 | MEYRIN REAL ESTATE | MAPPED | VERSO Capital 1 SCSP Series 134 | VC134 | 9ad6af44-cf68-4127-9120-a0f17fbb33a9 |
| VC35 | MEYRIN ACQUISITION | MAPPED | VERSO Capital 1 SCSP Series 135 | VC135 | 6d1c3992-1dd9-4a79-acf3-7c609fb99247 |
| VC36 | MINDELL | MAPPED | VERSO Capital 1 SCSP Series IN105 | IN105 | 997204a1-41f7-4a44-b32e-c6039a8cb6fd |
| VC37 | THRILLING FOODS | MAPPED | Thrilling Foods | VC37 | 864b46b5-5740-4e9f-acd5-0d4bf89558fd |
| VC38 | LA RESERVE | MAPPED | La Reserve | VC38 | 37eb3030-b5e1-4556-8f49-8f8b148c1b00 |
| VC39 | TBC | MAPPED | TBC Legacy | VC39 | 166f0e97-b086-411c-852e-67d049b28d37 |
| VC40 | VERSO X | MAPPED | VERSO Capital 2 SCSP Series 204 | VC204 | fc2d3cbf-d998-4337-b89f-e9adb8116fd9 |
| VC41 | LOUVIERE | MAPPED | VERSO Capital 1 SCSP Series 141 | VC141 | c62c3fe6-e992-4e05-99f5-0db3261ecab4 |
| VC42 | MIDSTAY | MAPPED | Midstay | VC42 | 3b300bc4-9e09-49d3-b6f8-16b95f6bd361 |
| VC43 | GETBEE | MAPPED | VERSO Capital 1 SCSP Series 143 | VC143 | 9c9bed79-a7bf-4efb-858d-3fffe0668525 |
| VC44 | - | UNMAPPED | - | - | - |

**Next Steps**
- Confirm or correct the **REVIEW** rows and provide target `vehicle_id`s.
- For **UNMAPPED** rows, let us know the canonical vehicle (or if the workbook record should be skipped).
- Once the mapping is finalized we’ll lock it into the ETL config (no auto-creation) and re-run the staging analysis before touching live subscriptions again.
