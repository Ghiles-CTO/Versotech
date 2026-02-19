# VFD vs DB Sums Comparison

File: 06_Full_Subscription_Data_VFD.xlsx (Subscription Data)

## Per Entity Code + Currency (file sums vs DB sums)

Rows with differences (key columns):

Entity Code Currency  diff_commitment  diff_funded_amount  diff_num_shares  diff_spread_fee_amount  diff_subscription_fee_amount  diff_bd_fee_amount  diff_finra_fee_amount
      VC106      USD             0.00       -1.379919e+06              0.0                    0.00                           0.0           -70602.29          -7.275958e-12
      VC112      USD             0.00       -2.500000e+04              0.0                    0.00                           0.0                0.00           0.000000e+00
        NaN      NaN      -3000000.00       -3.000000e+06         -98348.0                    0.00                           0.0                0.00           0.000000e+00
      VC113      USD       3000000.00       -3.725290e-09          98348.0                    0.00                           0.0                0.00           0.000000e+00
      VC121      CHF        100000.00        1.000000e+05         172413.0                    0.00                           0.0                0.00           0.000000e+00
        NaN      NaN       -100000.00       -1.000000e+05        -172413.0                    0.00                           0.0                0.00           0.000000e+00
      VC122      USD             0.00       -3.250000e+05              0.0                    0.00                           0.0                0.00           0.000000e+00
      VC124      GBP        611772.70        6.117727e+05        2809648.0                    0.00                       12272.0                0.00           0.000000e+00
        NaN      NaN       -611772.70       -6.117727e+05       -2809648.0                    0.00                      -12272.0                0.00           0.000000e+00
      VC125      EUR       2792111.35        2.792111e+06          16652.0                  392.96                       14916.0                0.00           0.000000e+00
        NaN      NaN      -2792111.35       -2.792111e+06         -16652.0                 -392.96                      -14916.0                0.00           0.000000e+00
      VC128      GBP        300000.00        3.000000e+05         428570.0                    0.00                           0.0                0.00           0.000000e+00
        NaN      NaN       -300000.00       -3.000000e+05        -428570.0                    0.00                           0.0                0.00           0.000000e+00


## Positions (Current Position)

Entity codes with position total differences:

Entity Code  Current Position  position_units  diff_position_units
      VC106         1534327.0       1964970.0            -430643.0
      VC111         6300000.0       6750000.0            -450000.0
      VC112          663896.0       1959129.0           -1295233.0
      VC113          595799.0        879091.0            -283292.0
      VC118           70676.0        150000.0             -79324.0
      VC121           43103.0        172413.0            -129310.0
      VC124          678311.0       2809648.0           -2131337.0
      VC125           12654.0         16088.0              -3434.0
      VC126           62578.0         66254.0              -3676.0
      VC128          285714.0        357142.0             -71428.0
      VC130          266252.0        500000.0            -233748.0
      VC132           11505.0         27546.0             -16041.0


## Notes
- Percent columns are summed but not inherently meaningful; inspect per-row if needed.
- Current Position in file is deduped by Entity+Investor to compare against positions table.
