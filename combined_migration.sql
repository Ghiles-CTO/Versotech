-- Combined Migration: Automatic Folder Creation System
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- PART 1: VEHICLE FOLDER TRIGGER
-- ============================================

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
    NEW.created_by,
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
      NEW.created_by,
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
    'category',
    NEW.created_by,
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
  v_creator_id uuid;
BEGIN
  -- Get vehicle name
  SELECT name, created_by INTO v_vehicle_name, v_creator_id
  FROM vehicles
  WHERE id = p_vehicle_id;

  IF v_vehicle_name IS NULL THEN
    RAISE EXCEPTION 'Vehicle not found: %', p_vehicle_id;
  END IF;

  -- Use provided creator or vehicle's creator
  v_creator_id := COALESCE(p_created_by, v_creator_id);

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

  -- Create root folder
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
    v_creator_id,
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
      v_creator_id,
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
    v_creator_id,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Created folders for vehicle: %', v_vehicle_name;
END;
$$;

-- ============================================
-- PART 2: DEAL FOLDER TRIGGER
-- ============================================

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
    'custom',
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

-- ============================================
-- PART 3: BACKFILL EXISTING VEHICLES
-- ============================================

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
      v.created_by,
      v.type
    FROM vehicles v
    LEFT JOIN document_folders df ON df.vehicle_id = v.id AND df.folder_type = 'vehicle_root'
    WHERE df.id IS NULL
    ORDER BY v.created_at ASC
  LOOP
    BEGIN
      -- Call the helper function to create folders
      PERFORM auto_create_vehicle_folders_for_existing(
        v_record.id,
        COALESCE(v_record.created_by, v_admin_user_id)
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

-- ============================================
-- PART 4: BACKFILL EXISTING DEALS
-- ============================================

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

-- ============================================
-- PART 5: CREATE INDEXES AND VIEW
-- ============================================

-- Add indexes for better folder query performance
CREATE INDEX IF NOT EXISTS idx_document_folders_vehicle_id ON document_folders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_parent_folder_id ON document_folders(parent_folder_id);
CREATE INDEX IF NOT EXISTS idx_document_folders_folder_type ON document_folders(folder_type);
CREATE INDEX IF NOT EXISTS idx_document_folders_path ON document_folders(path);

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

-- ============================================
-- PART 6: VERIFICATION QUERIES
-- ============================================

-- Verify the results
DO $$
DECLARE
  v_vehicles_with_folders int;
  v_vehicles_without_folders int;
  v_deals_with_folders int;
  v_deals_without_folders int;
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

  -- Count deals without folders
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

  -- Count total folders
  SELECT COUNT(*) INTO v_total_folders
  FROM document_folders;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '    MIGRATION RESULTS SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Vehicles with folders:    %', v_vehicles_with_folders;
  RAISE NOTICE 'Vehicles without folders: %', v_vehicles_without_folders;
  RAISE NOTICE 'Deals with folders:       %', v_deals_with_folders;
  RAISE NOTICE 'Deals without folders:    %', v_deals_without_folders;
  RAISE NOTICE 'Total folders created:    %', v_total_folders;
  RAISE NOTICE '========================================';
  RAISE NOTICE '';

  IF v_vehicles_without_folders = 0 AND v_deals_without_folders = 0 THEN
    RAISE NOTICE '✅ SUCCESS: All vehicles and deals now have folders!';
  ELSE
    RAISE NOTICE '⚠️  Some entities still need folders. Please investigate.';
  END IF;
END;
$$;

-- Final message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✨ Migration completed successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'What this migration did:';
  RAISE NOTICE '1. Created automatic folder triggers for new vehicles';
  RAISE NOTICE '2. Created automatic folder triggers for new deals';
  RAISE NOTICE '3. Created folders for all existing vehicles';
  RAISE NOTICE '4. Created folders for all existing deals';
  RAISE NOTICE '5. Added indexes for better performance';
  RAISE NOTICE '6. Created folder_hierarchy view for easy browsing';
  RAISE NOTICE '';
  RAISE NOTICE 'From now on:';
  RAISE NOTICE '- New vehicles will automatically get folders';
  RAISE NOTICE '- New deals will automatically get folders within their vehicle';
  RAISE NOTICE '- Users can move documents between folders';
  RAISE NOTICE '';
END;
$$;