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