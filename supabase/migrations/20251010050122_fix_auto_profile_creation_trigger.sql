-- Fix the handle_new_user() function to use metadata correctly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name, created_at)
  VALUES (
    new.id,
    new.email,
    -- Use role from metadata, default to investor if not set
    COALESCE(new.raw_user_meta_data->>'role', 'investor'),
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
