# Supabase Schema Migration Instructions

## ⚠️ CRITICAL: Backup Your Data First

Before running any migration, **BACKUP YOUR SUPABASE DATA**:

1. Go to your Supabase project dashboard
2. Navigate to Settings → Database
3. Click "Download Backup" to export your current data
4. Save the backup file in a secure location

## Migration Process

### Step 1: Apply the New Schema

1. Open your **Supabase SQL Editor**
2. Copy the **entire contents** of `/database/schema.sql`
3. Paste it into the SQL Editor
4. **Run the script** - this will create the production-ready schema

### Step 2: Verify Schema Creation

After running the script, verify these key improvements:

- ✅ **Proper ENUMs** instead of text+CHECK constraints
- ✅ **citext for email fields** (case-insensitive)
- ✅ **Complete relationships** and foreign keys
- ✅ **Performance indexes** on all critical paths
- ✅ **All 50+ tables** created successfully

### Step 3: Test Your Application

1. Start your Next.js application: `npm run dev`
2. Test key functionality:
   - User login/authentication
   - Data loading on dashboard
   - Deal creation/editing
   - All investor portal features

### Step 4: Enable RLS (Row Level Security)

Once the schema is working, enable RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables

-- Add your RLS policies here
-- (Based on your existing RLS requirements)
```

## What Changed in the New Schema

### Major Improvements

1. **PostgreSQL ENUMs**:
   - `user_role`, `deal_type_enum`, `deal_status_enum`, etc.
   - Better performance and type safety

2. **citext Email Fields**:
   - Case-insensitive email handling
   - Prevents duplicate email issues

3. **Complete Relationships**:
   - All foreign keys properly defined
   - Cascade deletes where appropriate

4. **Performance Indexes**:
   - Optimized indexes on all query paths
   - Better database performance

5. **Data Type Precision**:
   - `numeric(18,2)` for money
   - `numeric(28,8)` for units
   - `numeric(18,6)` for prices

### Database Size
- **50+ tables** covering the full investment management lifecycle
- **15+ ENUMs** for type safety
- **30+ indexes** for performance
- **Complete audit trails** and compliance features

## Rollback Plan

If you need to rollback:
1. Use your backup file from Step 1
2. Restore via Supabase dashboard
3. Your original schema will be restored

## Troubleshooting

### If Tables Already Exist
The script handles existing tables by dropping and recreating them. Your data will be preserved in temp tables during migration.

### If ENUMs Conflict
Drop existing ENUMs first:
```sql
DROP TYPE IF EXISTS user_role CASCADE;
-- ... etc
```

### If Performance Issues
The new schema includes comprehensive indexes. If you experience issues, check the query execution plans.

## Support

- Schema documentation: `/DATABASE_SCHEMA.md`
- Migration details: `/database/migrate_to_production_schema.sql`
- Original backup: `/database/schema_original_backup.sql`

This migration transforms your database from a basic schema to a **production-ready, enterprise-grade** system with proper PostgreSQL best practices.