-- =================================================================
-- CONSOLIDATED FOLDER CREATION MIGRATIONS
-- =================================================================
-- Apply this entire script in Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/ipguxdssecfexudnvtia/sql
--
-- This will:
-- 1. Create trigger to auto-create vehicle folders
-- 2. Create trigger to auto-create deal folders  
-- 3. Backfill folders for all existing vehicles
-- 4. Backfill folders for all existing deals
-- =================================================================

-- =================================================================
-- STEP 1: Auto-create Vehicle Folders Trigger
-- =================================================================

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
  v_vehicle_name := NEW.name;

  -- Check if root folder already exists (prevent duplicates)
  SELECT id INTO v_root_folder_id
  FROM document_folders
  WHERE vehicle_id = NEW.id
    AND folder_type = 'vehicle_root'
  LIMIT 1;

  IF v_root_folder_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Create root folder for vehicle (created_by = NULL since vehicles don't track creator)
  INSERT INTO document_folders (
    id, name, path, vehicle_id, folder_type, created_by, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_vehicle_name, '/' || v_vehicle_name, NEW.id, 'vehicle_root', NULL, NOW(), NOW()
  ) RETURNING id INTO v_root_folder_id;

  -- Create default category folders
  FOREACH v_category IN ARRAY v_default_categories
  LOOP
    INSERT INTO document_folders (
      id, parent_folder_id, name, path, vehicle_id, folder_type, created_by, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_root_folder_id, v_category, '/' || v_vehicle_name || '/' || v_category, 
      NEW.id, 'category', NULL, NOW(), NOW()
    );
  END LOOP;

  -- Create "Deals" subfolder
  INSERT INTO document_folders (
    id, parent_folder_id, name, path, vehicle_id, folder_type, created_by, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_root_folder_id, 'Deals', '/' || v_vehicle_name || '/Deals',
    NEW.id, 'category', NULL, NOW(), NOW()
  );

  RETURN NEW;
END;
$$;

-- Helper function to backfill folders for existing vehicles
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
  SELECT name INTO v_vehicle_name FROM vehicles WHERE id = p_vehicle_id;

  IF v_vehicle_name IS NULL THEN
    RAISE EXCEPTION 'Vehicle not found: %', p_vehicle_id;
  END IF;

  SELECT id INTO v_root_folder_id
  FROM document_folders
  WHERE vehicle_id = p_vehicle_id AND folder_type = 'vehicle_root'
  LIMIT 1;

  IF v_root_folder_id IS NOT NULL THEN
    RAISE NOTICE 'Folders already exist for vehicle: %', v_vehicle_name;
    RETURN;
  END IF;

  -- Create root folder
  INSERT INTO document_folders (
    id, name, path, vehicle_id, folder_type, created_by, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_vehicle_name, '/' || v_vehicle_name, p_vehicle_id, 'vehicle_root', p_created_by, NOW(), NOW()
  ) RETURNING id INTO v_root_folder_id;

  -- Create category folders
  FOREACH v_category IN ARRAY v_default_categories
  LOOP
    INSERT INTO document_folders (
      id, parent_folder_id, name, path, vehicle_id, folder_type, created_by, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_root_folder_id, v_category, '/' || v_vehicle_name || '/' || v_category,
      p_vehicle_id, 'category', p_created_by, NOW(), NOW()
    );
  END LOOP;

  -- Create Deals container folder
  INSERT INTO document_folders (
    id, parent_folder_id, name, path, vehicle_id, folder_type, created_by, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_root_folder_id, 'Deals', '/' || v_vehicle_name || '/Deals',
    p_vehicle_id, 'category', p_created_by, NOW(), NOW()
  );

  RAISE NOTICE 'Created folders for vehicle: %', v_vehicle_name;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_create_vehicle_folders ON vehicles;
CREATE TRIGGER trigger_auto_create_vehicle_folders
  AFTER INSERT ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_vehicle_folders();

COMMENT ON TRIGGER trigger_auto_create_vehicle_folders ON vehicles IS
'Automatically creates a default folder structure for every new vehicle';

COMMENT ON FUNCTION auto_create_vehicle_folders() IS
'Trigger function that creates default folder structure when a new vehicle is inserted';

COMMENT ON FUNCTION auto_create_vehicle_folders_for_existing(uuid, uuid) IS
'Helper function to manually create folders for existing vehicles';

-- =================================================================
-- STEP 2: Backfill Vehicle Folders
-- =================================================================
-- Migration: Backfill folders for existing vehicles (FIXED)
-- This creates folders for all existing vehicles that don't have them yet

-- First, let's check and report which vehicles don't have folders
DO $$
DECLARE
  v_record RECORD;
  v_admin_user_id uuid;
  v_folder_count int := 0;
  v_vehicle_count int := 0;
BEGIN
  -- Find an admin user to attribute folder creation
  SELECT id INTO v_admin_user_id
  FROM profiles
  WHERE role = 'staff_admin'
  ORDER BY created_at ASC
  LIMIT 1;

  -- If no admin found, try any staff user
  IF v_admin_user_id IS NULL THEN
    SELECT id INTO v_admin_user_id
    FROM profiles
    WHERE role LIKE 'staff_%'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- Count vehicles without folders
  SELECT COUNT(*) INTO v_vehicle_count
  FROM vehicles v
  LEFT JOIN document_folders df ON df.vehicle_id = v.id AND df.folder_type = 'vehicle_root'
  WHERE df.id IS NULL;

  RAISE NOTICE 'Found % vehicles without folders', v_vehicle_count;

  -- Loop through vehicles without folders
  FOR v_record IN
    SELECT
      v.id,
      v.name,
      v.type
    FROM vehicles v
    LEFT JOIN document_folders df ON df.vehicle_id = v.id AND df.folder_type = 'vehicle_root'
    WHERE df.id IS NULL
    ORDER BY v.created_at ASC
  LOOP
    BEGIN
      -- Call the helper function to create folders
      -- NOTE: Removed v_record.created_by because vehicles table doesn't have that column
      PERFORM auto_create_vehicle_folders_for_existing(
        v_record.id,
        v_admin_user_id  -- Use admin user ID we found
      );

      v_folder_count := v_folder_count + 1;
      RAISE NOTICE 'Created folders for vehicle: % (%)', v_record.name, v_record.type;

    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create folders for vehicle % (%): %', v_record.name, v_record.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Successfully created folders for % out of % vehicles', v_folder_count, v_vehicle_count;
END;
$$;

-- Verify the results
DO $$
DECLARE
  v_vehicles_with_folders int;
  v_vehicles_without_folders int;
  v_total_folders int;
BEGIN
  -- Count vehicles with folders
  SELECT COUNT(DISTINCT v.id) INTO v_vehicles_with_folders
  FROM vehicles v
  INNER JOIN document_folders df ON df.vehicle_id = v.id AND df.folder_type = 'vehicle_root';

  -- Count vehicles without folders
  SELECT COUNT(*) INTO v_vehicles_without_folders
  FROM vehicles v
  LEFT JOIN document_folders df ON df.vehicle_id = v.id AND df.folder_type = 'vehicle_root'
  WHERE df.id IS NULL;

  -- Count total folders created
  SELECT COUNT(*) INTO v_total_folders
  FROM document_folders;

  RAISE NOTICE '=== Folder Backfill Results ===';
  RAISE NOTICE 'Vehicles with folders: %', v_vehicles_with_folders;
  RAISE NOTICE 'Vehicles without folders: %', v_vehicles_without_folders;
  RAISE NOTICE 'Total folders in system: %', v_total_folders;
  RAISE NOTICE '==============================';
END;
$$;

-- Add indexes for better folder query performance
CREATE INDEX IF NOT EXISTS idx_document_folders_vehicle_id ON document_folders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_parent_folder_id ON document_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_folder_type ON document_folders(folder_type);
CREATE INDEX IF NOT EXISTS idx_document_folders_path ON document_folders(path);

-- Add a comment to track this migration
COMMENT ON SCHEMA public IS
'Backfill migration completed: All existing vehicles now have default folder structures';

-- =================================================================
-- STEP 3: Deal Folder Migrations  
-- =================================================================
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
-- =================================================================
-- STEP 4: Backfill Deal Folders
-- =================================================================
-- Migration: Backfill folders for existing deals
-- This creates folders for all existing deals that don't have them yet

-- First, let's check and report which deals don't have folders
DO $$
DECLARE
  d_record RECORD;
  v_admin_user_id uuid;
  v_folder_count int := 0;
  v_deal_count int := 0;
  v_deals_without_vehicle int := 0;
BEGIN
  -- Find an admin user to attribute folder creation
  SELECT id INTO v_admin_user_id
  FROM profiles
  WHERE role = 'staff_admin'
  ORDER BY created_at ASC
  LIMIT 1;

  -- If no admin found, try any staff user
  IF v_admin_user_id IS NULL THEN
    SELECT id INTO v_admin_user_id
    FROM profiles
    WHERE role LIKE 'staff_%'
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- Count deals without vehicle_id
  SELECT COUNT(*) INTO v_deals_without_vehicle
  FROM deals
  WHERE vehicle_id IS NULL;

  IF v_deals_without_vehicle > 0 THEN
    RAISE NOTICE 'Found % deals without vehicle_id (will be skipped)', v_deals_without_vehicle;
  END IF;

  -- Count deals with vehicle_id that might need folders
  SELECT COUNT(*) INTO v_deal_count
  FROM deals d
  WHERE d.vehicle_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM document_folders df
      WHERE df.vehicle_id = d.vehicle_id
        AND df.name = d.name
        AND df.path LIKE '%/Deals/' || d.name
    );

  RAISE NOTICE 'Found % deals that may need folders', v_deal_count;

  -- Loop through deals that need folders
  FOR d_record IN
    SELECT
      d.id,
      d.name,
      d.vehicle_id,
      d.created_by,
      d.deal_type,
      d.status,
      v.name AS vehicle_name
    FROM deals d
    INNER JOIN vehicles v ON v.id = d.vehicle_id
    WHERE d.vehicle_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM document_folders df
        WHERE df.vehicle_id = d.vehicle_id
          AND df.name = d.name
          AND df.path LIKE '%/Deals/' || d.name
      )
    ORDER BY d.created_at ASC
  LOOP
    BEGIN
      -- Call the helper function to create deal folders
      PERFORM auto_create_deal_folder_for_existing(
        d_record.id,
        COALESCE(d_record.created_by, v_admin_user_id)
      );

      v_folder_count := v_folder_count + 1;
      RAISE NOTICE 'Created folders for deal: % (Vehicle: %, Type: %, Status: %)',
        d_record.name,
        d_record.vehicle_name,
        d_record.deal_type,
        d_record.status;

    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create folders for deal % (%): %', d_record.name, d_record.id, SQLERRM;
    END;
  END LOOP;

  RAISE NOTICE 'Successfully created folders for % out of % deals', v_folder_count, v_deal_count;
END;
$$;

-- Verify the results and show folder structure
DO $$
DECLARE
  v_deals_with_folders int;
  v_deals_without_folders int;
  v_total_deal_folders int;
  v_sample_structure text;
BEGIN
  -- Count deals with folders
  SELECT COUNT(DISTINCT d.id) INTO v_deals_with_folders
  FROM deals d
  WHERE d.vehicle_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM document_folders df
      WHERE df.vehicle_id = d.vehicle_id
        AND df.name = d.name
        AND df.path LIKE '%/Deals/' || d.name
    );

  -- Count deals without folders (excluding those without vehicle_id)
  SELECT COUNT(*) INTO v_deals_without_folders
  FROM deals d
  WHERE d.vehicle_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM document_folders df
      WHERE df.vehicle_id = d.vehicle_id
        AND df.name = d.name
        AND df.path LIKE '%/Deals/' || d.name
    );

  -- Count total deal-related folders
  SELECT COUNT(*) INTO v_total_deal_folders
  FROM document_folders
  WHERE path LIKE '%/Deals/%';

  -- Get a sample folder structure for verification
  SELECT string_agg(
    REPEAT('  ', (LENGTH(path) - LENGTH(REPLACE(path, '/', ''))) - 1) || name,
    E'\n' ORDER BY path
  ) INTO v_sample_structure
  FROM (
    SELECT DISTINCT name, path
    FROM document_folders
    WHERE path LIKE '%/Deals/%'
    ORDER BY path
    LIMIT 20
  ) AS sample;

  RAISE NOTICE '=== Deal Folder Backfill Results ===';
  RAISE NOTICE 'Deals with folders: %', v_deals_with_folders;
  RAISE NOTICE 'Deals without folders (with vehicle): %', v_deals_without_folders;
  RAISE NOTICE 'Total deal-related folders: %', v_total_deal_folders;
  RAISE NOTICE '====================================';

  IF v_sample_structure IS NOT NULL THEN
    RAISE NOTICE E'Sample folder structure:\n%', v_sample_structure;
  END IF;
END;
$$;

-- Migrate orphaned deal documents to their proper folders (if any exist)
DO $$
DECLARE
  v_migrated_count int := 0;
  doc_record RECORD;
  v_target_folder_id uuid;
BEGIN
  -- Find deal documents without folder_id
  FOR doc_record IN
    SELECT
      d.id AS doc_id,
      d.deal_id,
      d.name AS doc_name,
      deals.name AS deal_name,
      deals.vehicle_id
    FROM documents d
    INNER JOIN deals ON deals.id = d.deal_id
    WHERE d.folder_id IS NULL
      AND d.deal_id IS NOT NULL
      AND deals.vehicle_id IS NOT NULL
  LOOP
    -- Try to find the appropriate Data Room folder for this deal
    SELECT df.id INTO v_target_folder_id
    FROM document_folders df
    WHERE df.vehicle_id = doc_record.vehicle_id
      AND df.path = '/' || (SELECT name FROM vehicles WHERE id = doc_record.vehicle_id) || '/Deals/' || doc_record.deal_name || '/Data Room'
    LIMIT 1;

    -- If Data Room folder not found, try to find the deal's root folder
    IF v_target_folder_id IS NULL THEN
      SELECT df.id INTO v_target_folder_id
      FROM document_folders df
      WHERE df.vehicle_id = doc_record.vehicle_id
        AND df.name = doc_record.deal_name
        AND df.path LIKE '%/Deals/' || doc_record.deal_name
      LIMIT 1;
    END IF;

    -- Update document with folder_id if found
    IF v_target_folder_id IS NOT NULL THEN
      UPDATE documents
      SET folder_id = v_target_folder_id,
          updated_at = NOW()
      WHERE id = doc_record.doc_id;

      v_migrated_count := v_migrated_count + 1;
      RAISE NOTICE 'Migrated document % to deal folder', doc_record.doc_name;
    END IF;
  END LOOP;

  IF v_migrated_count > 0 THEN
    RAISE NOTICE 'Migrated % deal documents to their proper folders', v_migrated_count;
  END IF;
END;
$$;

-- Create a view to easily see the folder hierarchy
CREATE OR REPLACE VIEW folder_hierarchy AS
WITH RECURSIVE folder_tree AS (
  -- Base case: root folders
  SELECT
    id,
    name,
    path,
    vehicle_id,
    folder_type,
    parent_folder_id,
    0 AS depth,
    name::text AS full_path
  FROM document_folders
  WHERE parent_folder_id IS NULL

  UNION ALL

  -- Recursive case: child folders
  SELECT
    df.id,
    df.name,
    df.path,
    df.vehicle_id,
    df.folder_type,
    df.parent_folder_id,
    ft.depth + 1,
    ft.full_path || ' > ' || df.name AS full_path
  FROM document_folders df
  JOIN folder_tree ft ON df.parent_folder_id = ft.id
)
SELECT
  id,
  REPEAT('  ', depth) || name AS indented_name,
  path,
  folder_type,
  vehicle_id,
  depth,
  full_path
FROM folder_tree
ORDER BY vehicle_id, path;

-- Grant appropriate permissions
GRANT SELECT ON folder_hierarchy TO authenticated;

COMMENT ON VIEW folder_hierarchy IS 'Hierarchical view of document folders showing indented structure';