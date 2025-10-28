-- Fix the handle_new_user() function with proper type casting
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name, created_at)
  VALUES (
    new.id,
    new.email,
    -- Cast role to user_role enum type
    COALESCE(new.raw_user_meta_data->>'role', 'investor')::user_role,
    -- Use display_name from metadata first, then full_name, then email prefix
    COALESCE(
      new.raw_user_meta_data->>'display_name',
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    ),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;;
