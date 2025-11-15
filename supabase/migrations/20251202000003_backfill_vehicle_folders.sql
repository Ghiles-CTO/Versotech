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
