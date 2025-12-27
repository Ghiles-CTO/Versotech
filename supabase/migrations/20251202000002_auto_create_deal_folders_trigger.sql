-- Migration: Automatic deal folder creation trigger
-- This ensures every deal automatically gets a folder structure within its vehicle's Deals folder

-- Function to create deal folders automatically
CREATE OR REPLACE FUNCTION auto_create_deal_folder()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_name text;
  v_vehicle_root_folder_id uuid;
  v_deals_folder_id uuid;
  v_deal_root_folder_id uuid;
  v_deal_subfolders text[] := ARRAY['Term Sheets', 'Data Room', 'Subscription Documents', 'Legal Documents', 'Financial Reports', 'Due Diligence'];
  v_subfolder text;
BEGIN
  -- Only proceed if deal has a vehicle_id
  IF NEW.vehicle_id IS NULL THEN
    RAISE NOTICE 'Deal % has no vehicle_id, skipping folder creation', NEW.id;
    RETURN NEW;
  END IF;

  -- Get vehicle name
  SELECT name INTO v_vehicle_name
  FROM vehicles
  WHERE id = NEW.vehicle_id;

  IF v_vehicle_name IS NULL THEN
    RAISE WARNING 'Vehicle not found for deal %', NEW.id;
    RETURN NEW;
  END IF;

  -- Find the vehicle's root folder
  SELECT id INTO v_vehicle_root_folder_id
  FROM document_folders
  WHERE vehicle_id = NEW.vehicle_id
    AND folder_type = 'vehicle_root'
  LIMIT 1;

  -- If vehicle doesn't have folders yet, create them first
  IF v_vehicle_root_folder_id IS NULL THEN
    PERFORM auto_create_vehicle_folders_for_existing(NEW.vehicle_id, NEW.created_by);

    -- Get the newly created root folder
    SELECT id INTO v_vehicle_root_folder_id
    FROM document_folders
    WHERE vehicle_id = NEW.vehicle_id
      AND folder_type = 'vehicle_root'
    LIMIT 1;
  END IF;

  -- Find the "Deals" folder for this vehicle
  SELECT id INTO v_deals_folder_id
  FROM document_folders
  WHERE vehicle_id = NEW.vehicle_id
    AND parent_folder_id = v_vehicle_root_folder_id
    AND name = 'Deals'
    AND folder_type = 'category'
  LIMIT 1;

  -- If "Deals" folder doesn't exist, create it
  IF v_deals_folder_id IS NULL THEN
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_vehicle_root_folder_id,
      'Deals',
      '/' || v_vehicle_name || '/Deals',
      NEW.vehicle_id,
      'category',
      NEW.created_by,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_deals_folder_id;
  END IF;

  -- Check if deal folder already exists (prevent duplicates)
  SELECT id INTO v_deal_root_folder_id
  FROM document_folders
  WHERE parent_folder_id = v_deals_folder_id
    AND name = NEW.name
  LIMIT 1;

  IF v_deal_root_folder_id IS NOT NULL THEN
    RAISE NOTICE 'Deal folder already exists for: %', NEW.name;
    RETURN NEW;
  END IF;

  -- Create deal-specific folder under /Deals
  INSERT INTO document_folders (
    id,
    parent_folder_id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_deals_folder_id,
    NEW.name,
    '/' || v_vehicle_name || '/Deals/' || NEW.name,
    NEW.vehicle_id,
    'custom',  -- Deal folders are custom type
    NEW.created_by,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_deal_root_folder_id;

  -- Create deal subfolders
  FOREACH v_subfolder IN ARRAY v_deal_subfolders
  LOOP
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_deal_root_folder_id,
      v_subfolder,
      '/' || v_vehicle_name || '/Deals/' || NEW.name || '/' || v_subfolder,
      NEW.vehicle_id,
      'custom',
      NEW.created_by,
      NOW(),
      NOW()
    );
  END LOOP;

  RAISE NOTICE 'Created folder structure for deal: %', NEW.name;
  RETURN NEW;
END;
$$;

-- Create trigger that fires AFTER INSERT on deals table
DROP TRIGGER IF EXISTS trigger_auto_create_deal_folder ON deals;
CREATE TRIGGER trigger_auto_create_deal_folder
  AFTER INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_deal_folder();

-- Helper function to backfill folders for existing deals
CREATE OR REPLACE FUNCTION auto_create_deal_folder_for_existing(
  p_deal_id uuid,
  p_created_by uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deal_name text;
  v_vehicle_id uuid;
  v_vehicle_name text;
  v_vehicle_root_folder_id uuid;
  v_deals_folder_id uuid;
  v_deal_root_folder_id uuid;
  v_deal_subfolders text[] := ARRAY['Term Sheets', 'Data Room', 'Subscription Documents', 'Legal Documents', 'Financial Reports', 'Due Diligence'];
  v_subfolder text;
  v_creator_id uuid;
BEGIN
  -- Get deal details
  SELECT name, vehicle_id, created_by INTO v_deal_name, v_vehicle_id, v_creator_id
  FROM deals
  WHERE id = p_deal_id;

  IF v_deal_name IS NULL THEN
    RAISE EXCEPTION 'Deal not found: %', p_deal_id;
  END IF;

  IF v_vehicle_id IS NULL THEN
    RAISE NOTICE 'Deal % has no vehicle_id, skipping folder creation', p_deal_id;
    RETURN;
  END IF;

  -- Use provided creator or deal's creator
  v_creator_id := COALESCE(p_created_by, v_creator_id);

  -- Get vehicle name
  SELECT name INTO v_vehicle_name
  FROM vehicles
  WHERE id = v_vehicle_id;

  -- Find the vehicle's root folder
  SELECT id INTO v_vehicle_root_folder_id
  FROM document_folders
  WHERE vehicle_id = v_vehicle_id
    AND folder_type = 'vehicle_root'
  LIMIT 1;

  -- If vehicle doesn't have folders yet, create them first
  IF v_vehicle_root_folder_id IS NULL THEN
    PERFORM auto_create_vehicle_folders_for_existing(v_vehicle_id, v_creator_id);

    -- Get the newly created root folder
    SELECT id INTO v_vehicle_root_folder_id
    FROM document_folders
    WHERE vehicle_id = v_vehicle_id
      AND folder_type = 'vehicle_root'
    LIMIT 1;
  END IF;

  -- Find or create "Deals" container folder
  SELECT id INTO v_deals_folder_id
  FROM document_folders
  WHERE vehicle_id = v_vehicle_id
    AND parent_folder_id = v_vehicle_root_folder_id
    AND name = 'Deals'
    AND folder_type = 'category';

  IF v_deals_folder_id IS NULL THEN
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_vehicle_root_folder_id,
      'Deals',
      '/' || v_vehicle_name || '/Deals',
      v_vehicle_id,
      'category',
      v_creator_id,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_deals_folder_id;
  END IF;

  -- Check if deal folder already exists
  SELECT id INTO v_deal_root_folder_id
  FROM document_folders
  WHERE parent_folder_id = v_deals_folder_id
    AND name = v_deal_name;

  IF v_deal_root_folder_id IS NOT NULL THEN
    RAISE NOTICE 'Deal folder already exists: %', v_deal_name;
    RETURN;
  END IF;

  -- Create deal folder
  INSERT INTO document_folders (
    id,
    parent_folder_id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_deals_folder_id,
    v_deal_name,
    '/' || v_vehicle_name || '/Deals/' || v_deal_name,
    v_vehicle_id,
    'custom',
    v_creator_id,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_deal_root_folder_id;

  -- Create subfolders
  FOREACH v_subfolder IN ARRAY v_deal_subfolders
  LOOP
    INSERT INTO document_folders (
      id,
      parent_folder_id,
      name,
      path,
      vehicle_id,
      folder_type,
      created_by,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_deal_root_folder_id,
      v_subfolder,
      '/' || v_vehicle_name || '/Deals/' || v_deal_name || '/' || v_subfolder,
      v_vehicle_id,
      'custom',
      v_creator_id,
      NOW(),
      NOW()
    );
  END LOOP;

  RAISE NOTICE 'Created deal folder: %', v_deal_name;
END;
$$;

-- Add comments to explain the trigger
COMMENT ON TRIGGER trigger_auto_create_deal_folder ON deals IS
'Automatically creates a folder structure for every new deal within its vehicle Deals folder';

COMMENT ON FUNCTION auto_create_deal_folder() IS
'Trigger function that creates deal-specific folder structure when a new deal is inserted';

COMMENT ON FUNCTION auto_create_deal_folder_for_existing(uuid, uuid) IS
'Helper function to manually create folders for existing deals that do not have folders yet';