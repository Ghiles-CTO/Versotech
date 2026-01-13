-- Fix subscription_number race condition by using a PostgreSQL sequence
-- Previously: API used SELECT max(subscription_number) + 1 which caused duplicates on concurrent requests

-- Step 1: Create a sequence for subscription numbers
-- Start from max existing + 1, or 100001 if no subscriptions exist
DO $$
DECLARE
  max_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(subscription_number), 100000) INTO max_num FROM subscriptions;
  EXECUTE format('CREATE SEQUENCE IF NOT EXISTS subscription_number_seq START WITH %s INCREMENT BY 1', max_num + 1);
END $$;

-- Step 2: Set the default value to use the sequence
ALTER TABLE subscriptions
ALTER COLUMN subscription_number SET DEFAULT nextval('subscription_number_seq');

-- Step 3: Add UNIQUE constraint to prevent duplicates (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscriptions_subscription_number_unique'
  ) THEN
    ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_subscription_number_unique UNIQUE (subscription_number);
  END IF;
END $$;

-- Step 4: Grant usage on sequence to authenticated users
GRANT USAGE, SELECT ON SEQUENCE subscription_number_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE subscription_number_seq TO service_role;
