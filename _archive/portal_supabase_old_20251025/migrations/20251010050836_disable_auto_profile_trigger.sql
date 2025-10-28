-- Disable the trigger that auto-creates profiles
-- This was causing issues with role assignment and display names
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Keep the function in case we need it later, but don't use it automatically
-- Profiles will be created by the /auth/callback page after email verification;
