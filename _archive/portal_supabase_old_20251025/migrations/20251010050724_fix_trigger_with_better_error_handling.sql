-- Replace the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role text;
  user_display_name text;
BEGIN
  -- Extract role from metadata, default to 'investor'
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'investor');
  
  -- Extract display name from metadata
  user_display_name := COALESCE(
    new.raw_user_meta_data->>'display_name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );
  
  -- Insert profile with type cast
  INSERT INTO public.profiles (id, email, role, display_name, created_at)
  VALUES (
    new.id,
    new.email,
    user_role::user_role,
    user_display_name,
    NOW()
  );
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't block user creation
    RAISE WARNING 'Failed to create profile for user %: %', new.email, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;;
