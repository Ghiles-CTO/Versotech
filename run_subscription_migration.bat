@echo off
REM Run full subscription migration
REM Replace DATABASE_URL with your actual connection string

set DATABASE_URL=postgresql://postgres.ipguxdssecfexudnvtia:7mBmSaLYPw0It8NQ@aws-1-eu-central-2.pooler.supabase.com:5432/postgres

echo Running FULL migration (no dry-run)...
echo This will import all data into the database.
echo.
set /p confirm=Are you sure you want to continue? (yes/no): 

if /i "%confirm%" neq "yes" (
    echo Migration cancelled.
    pause
    exit /b 1
)

python -m subscription_migration.main ^
  --workbook "docs\VERSO DASHBOARD_V1.0.xlsx" ^
  --config subscription_migration\config.dev.json ^
  --database-url "%DATABASE_URL%" ^
  --executed-by "%USERNAME%" 

pause
