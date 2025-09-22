-- Create Test Users for VERSO Holdings Portal
-- Run this AFTER creating accounts via the authentication system

-- Step 1: Create accounts via the auth system first
-- Go to http://localhost:3000/versoholdings/login
-- Sign up with: investor@verso.com
-- Go to http://localhost:3000/versotech/login  
-- Sign up with: staff@verso.com

-- Step 2: Then run this script, replacing the UUIDs with actual auth.users IDs

-- Update profiles for test users (replace UUIDs with actual auth.users.id values)
-- You can find these in your Supabase auth.users table after signup

/*
-- Example - replace these UUIDs with real ones from auth.users table:

-- Update investor profile
UPDATE profiles 
SET 
  role = 'investor',
  display_name = 'Test Investor',
  title = null
WHERE id = 'REPLACE-WITH-ACTUAL-AUTH-USER-ID-FOR-INVESTOR';

-- Update staff profile  
UPDATE profiles
SET 
  role = 'staff_admin',
  display_name = 'Test Staff Admin',
  title = 'admin'
WHERE id = 'REPLACE-WITH-ACTUAL-AUTH-USER-ID-FOR-STAFF';

-- Link test investor to sample investor entity
INSERT INTO investor_users (investor_id, user_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'REPLACE-WITH-ACTUAL-AUTH-USER-ID-FOR-INVESTOR');

*/

-- Instructions:
-- 1. Sign up for accounts at the login pages
-- 2. Check auth.users table in Supabase dashboard  
-- 3. Copy the user IDs and replace the UUIDs above
-- 4. Run the UPDATE and INSERT statements with real IDs
-- 5. Test login with both accounts

-- Check if setup worked correctly:
SELECT 
  p.email,
  p.role,
  p.display_name,
  p.title,
  CASE 
    WHEN iu.investor_id IS NOT NULL THEN 'Linked to investor'
    ELSE 'No investor link'
  END as investor_status
FROM profiles p
LEFT JOIN investor_users iu ON p.id = iu.user_id
WHERE p.email IN ('investor@verso.com', 'staff@verso.com');

