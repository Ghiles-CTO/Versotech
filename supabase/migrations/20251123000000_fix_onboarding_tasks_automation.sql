-- Migration: Fix Onboarding Tasks Automation
-- Description: Add triggers to automatically create onboarding tasks when users are invited
-- Date: 2025-11-23
-- Status: Fixes incomplete Phase 5 implementation

BEGIN;

-- ========================================
-- TRIGGER 1: Auto-create tasks when user is added to investor
-- ========================================
-- This is the primary trigger that fires when a user is linked to an investor
-- It handles both new invitations and existing users being added

CREATE OR REPLACE FUNCTION trigger_investor_user_onboarding_tasks()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_task_count int;
BEGIN
  -- Create onboarding tasks for the newly linked user
  -- This uses the existing create_tasks_from_templates function

  -- Call the task creation function
  SELECT COUNT(*) INTO v_task_count
  FROM create_tasks_from_templates(
    NEW.user_id,
    NEW.investor_id,
    'investor_created'
  );

  -- Log the action for debugging
  RAISE NOTICE 'Created % onboarding tasks for user % linked to investor %',
    v_task_count, NEW.user_id, NEW.investor_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user linking operation
    RAISE WARNING 'Failed to create onboarding tasks: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS investor_users_create_onboarding_tasks ON investor_users;

CREATE TRIGGER investor_users_create_onboarding_tasks
  AFTER INSERT ON investor_users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_investor_user_onboarding_tasks();

-- ========================================
-- Add helpful comments
-- ========================================

COMMENT ON FUNCTION trigger_investor_user_onboarding_tasks IS
  'Automatically creates onboarding tasks when a user is linked to an investor entity. '
  'Fires on investor_users INSERT and calls create_tasks_from_templates with trigger_event=investor_created.';

COMMENT ON TRIGGER investor_users_create_onboarding_tasks ON investor_users IS
  'Auto-generates onboarding tasks (KYC, profile completion, banking details, etc.) for newly invited or linked investor users.';

-- ========================================
-- Verify task templates exist
-- ========================================
-- Check if we have templates with trigger_event='investor_created'

DO $$
DECLARE
  v_template_count int;
BEGIN
  SELECT COUNT(*) INTO v_template_count
  FROM task_templates
  WHERE trigger_event = 'investor_created';

  IF v_template_count = 0 THEN
    RAISE WARNING 'No task templates found with trigger_event=investor_created. Tasks will not be created automatically.';
  ELSE
    RAISE NOTICE 'Found % task templates for investor_created event', v_template_count;
  END IF;
END $$;

-- ========================================
-- Grant necessary permissions
-- ========================================
-- Ensure the trigger function can execute with elevated privileges

GRANT EXECUTE ON FUNCTION trigger_investor_user_onboarding_tasks() TO authenticated;
GRANT EXECUTE ON FUNCTION create_tasks_from_templates(uuid, uuid, text) TO authenticated;

COMMIT;

-- ========================================
-- Testing Instructions
-- ========================================
-- To test this migration:
-- 1. Invite a new user from staff portal -> Investors -> Add User
-- 2. Check tasks table: SELECT * FROM tasks WHERE owner_user_id = '<new_user_id>';
-- 3. Should see 4-6 onboarding tasks created automatically
-- 4. Verify logs: Look for NOTICE messages about task creation

-- To manually trigger for existing users:
-- SELECT create_tasks_from_templates(
--   '<user_id>'::uuid,
--   '<investor_id>'::uuid,
--   'investor_created'
-- );
