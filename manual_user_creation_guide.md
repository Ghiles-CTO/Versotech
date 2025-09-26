# Manual User Creation Guide for VERSO Holdings Portal

## Create these users in Supabase Dashboard → Authentication → Users

### 1. Investor Users

**User 1: John Investor**
- User ID: `inv-001`
- Email: `investor@demo.com`
- Password: `demo123`
- User Metadata: `{"display_name": "John Investor"}`

**User 2: Sarah Wilson**
- User ID: `inv-002`
- Email: `sarah@investor.com`
- Password: `demo123`
- User Metadata: `{"display_name": "Sarah Wilson"}`

**User 3: Wellington Family Office**
- User ID: `inv-003`
- Email: `family.office@demo.com`
- Password: `demo123`
- User Metadata: `{"display_name": "Wellington Family Office"}`

### 2. Staff Users

**User 4: Admin User**
- User ID: `staff-001`
- Email: `admin@demo.com`
- Password: `admin123`
- User Metadata: `{"display_name": "Admin User"}`

**User 5: Portfolio Manager**
- User ID: `staff-002`
- Email: `manager@demo.com`
- Password: `manager123`
- User Metadata: `{"display_name": "Portfolio Manager"}`

**User 6: Operations Team**
- User ID: `staff-003`
- Email: `operations@demo.com`
- Password: `ops123`
- User Metadata: `{"display_name": "Operations Team"}`

## After Creating Users

Once these auth.users exist, you can run the original test data script:

```sql
-- This will now work because the auth.users exist
INSERT INTO profiles (id, role, display_name, email, title) VALUES
  ('inv-001', 'investor', 'John Investor', 'investor@demo.com', NULL),
  ('inv-002', 'investor', 'Sarah Wilson', 'sarah@investor.com', NULL),
  ('inv-003', 'investor', 'Wellington Family Office', 'family.office@demo.com', NULL),
  ('staff-001', 'staff_admin', 'Admin User', 'admin@demo.com', 'Administration'),
  ('staff-002', 'staff_ops', 'Portfolio Manager', 'manager@demo.com', 'Portfolio Management'),
  ('staff-003', 'staff_ops', 'Operations Team', 'operations@demo.com', 'Operations')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;
```

## Verification

After creating users and profiles, verify with:

```sql
SELECT
  au.id,
  au.email,
  p.role,
  p.display_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE au.id IN ('inv-001', 'inv-002', 'inv-003', 'staff-001', 'staff-002', 'staff-003');
```