-- Migration: Automatic vehicle folder creation trigger (FIXED)
-- This ensures every vehicle automatically gets a proper folder structure when created

-- Function to create vehicle folders automatically
CREATE OR REPLACE FUNCTION auto_create_vehicle_folders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_name text;
  v_root_folder_id uuid;
  v_default_categories text[] := ARRAY['Agreements', 'KYC Documents', 'Legal', 'Investor Documents', 'Position Statements', 'Reports', 'NDAs'];
  v_category text;
BEGIN
  -- Get vehicle name
  v_vehicle_name := NEW.name;

  -- Check if root folder already exists (prevent duplicates)
  SELECT id INTO v_root_folder_id
  FROM document_folders
  WHERE vehicle_id = NEW.id
    AND folder_type = 'vehicle_root'
  LIMIT 1;

  -- If folder already exists, exit early
  IF v_root_folder_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Create root folder for vehicle
  -- NOTE: created_by is NULL because vehicles table doesn't track created_by
  INSERT INTO document_folders (
    id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_vehicle_name,
    '/' || v_vehicle_name,
    NEW.id,
    'vehicle_root',
    NULL,  -- vehicles table has no created_by column
    NOW(),
    NOW()
  )
  RETURNING id INTO v_root_folder_id;

  -- Create default category folders
  FOREACH v_category IN ARRAY v_default_categories
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
      v_root_folder_id,
      v_category,
      '/' || v_vehicle_name || '/' || v_category,
      NEW.id,
      'category',
      NULL,  -- vehicles table has no created_by column
      NOW(),
      NOW()
    );
  END LOOP;

  -- Create "Deals" subfolder under root (for deal-specific documents)
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
    v_root_folder_id,
    'Deals',
    '/' || v_vehicle_name || '/Deals',
    NEW.id,
    'category',  -- Deals folder is a category folder
    NULL,  -- vehicles table has no created_by column
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$;

-- Create trigger that fires AFTER INSERT on vehicles table
DROP TRIGGER IF EXISTS trigger_auto_create_vehicle_folders ON vehicles;
CREATE TRIGGER trigger_auto_create_vehicle_folders
  AFTER INSERT ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_vehicle_folders();

-- Helper function to backfill folders for existing vehicles (can be called manually)
CREATE OR REPLACE FUNCTION auto_create_vehicle_folders_for_existing(
  p_vehicle_id uuid,
  p_created_by uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_name text;
  v_root_folder_id uuid;
  v_default_categories text[] := ARRAY['Agreements', 'KYC Documents', 'Legal', 'Investor Documents', 'Position Statements', 'Reports', 'NDAs'];
  v_category text;
BEGIN
  -- Get vehicle name (no created_by in vehicles table)
  SELECT name INTO v_vehicle_name
  FROM vehicles
  WHERE id = p_vehicle_id;

  IF v_vehicle_name IS NULL THEN
    RAISE EXCEPTION 'Vehicle not found: %', p_vehicle_id;
  END IF;

  -- Check if root folder already exists
  SELECT id INTO v_root_folder_id
  FROM document_folders
  WHERE vehicle_id = p_vehicle_id
    AND folder_type = 'vehicle_root'
  LIMIT 1;

  IF v_root_folder_id IS NOT NULL THEN
    RAISE NOTICE 'Folders already exist for vehicle: %', v_vehicle_name;
    RETURN;
  END IF;

  -- Create root folder (created_by will be NULL or provided value)
  INSERT INTO document_folders (
    id,
    name,
    path,
    vehicle_id,
    folder_type,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    v_vehicle_name,
    '/' || v_vehicle_name,
    p_vehicle_id,
    'vehicle_root',
    p_created_by,  -- Use provided value or NULL
    NOW(),
    NOW()
  )
  RETURNING id INTO v_root_folder_id;

  -- Create category folders
  FOREACH v_category IN ARRAY v_default_categories
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
      v_root_folder_id,
      v_category,
      '/' || v_vehicle_name || '/' || v_category,
      p_vehicle_id,
      'category',
      p_created_by,  -- Use provided value or NULL
      NOW(),
      NOW()
    );
  END LOOP;

  -- Create Deals container folder
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
    v_root_folder_id,
    'Deals',
    '/' || v_vehicle_name || '/Deals',
    p_vehicle_id,
    'category',
    p_created_by,  -- Use provided value or NULL
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Created folders for vehicle: %', v_vehicle_name;
END;
$$;

-- Add comment to explain the trigger
COMMENT ON TRIGGER trigger_auto_create_vehicle_folders ON vehicles IS
'Automatically creates a default folder structure for every new vehicle, including root folder and category folders for documents';

COMMENT ON FUNCTION auto_create_vehicle_folders() IS
'Trigger function that creates default folder structure when a new vehicle is inserted';

COMMENT ON FUNCTION auto_create_vehicle_folders_for_existing(uuid, uuid) IS
'Helper function to manually create folders for existing vehicles that do not have folders yet';
