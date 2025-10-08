-- Database Migration 021: Migrate Existing Documents to Folder Structure
-- Description: Organizes existing documents into vehicle-based folder hierarchy
-- Dependencies: Migration 019, 020 (document management system)
-- Date: 2025-01-22

-- ============================================================================
-- 1) CREATE VEHICLE ROOT AND CATEGORY FOLDERS FOR ALL VEHICLES
-- ============================================================================

DO $$
DECLARE
  v_vehicle RECORD;
  v_staff_user_id uuid;
BEGIN
  -- Get a staff user ID for created_by (use first staff admin)
  SELECT id INTO v_staff_user_id 
  FROM profiles 
  WHERE role = 'staff_admin' 
  LIMIT 1;

  -- If no staff admin, use any staff user
  IF v_staff_user_id IS NULL THEN
    SELECT id INTO v_staff_user_id 
    FROM profiles 
    WHERE role::text LIKE 'staff_%' 
    LIMIT 1;
  END IF;

  -- If still no staff user, create a system user
  IF v_staff_user_id IS NULL THEN
    RAISE NOTICE 'No staff user found, folders will have NULL created_by';
  END IF;

  -- Loop through all vehicles
  FOR v_vehicle IN SELECT id, name FROM vehicles LOOP
    -- Skip if vehicle root already exists
    IF NOT EXISTS (
      SELECT 1 FROM document_folders 
      WHERE vehicle_id = v_vehicle.id 
      AND folder_type = 'vehicle_root'
    ) THEN
      -- Create folder structure for this vehicle
      PERFORM create_default_vehicle_folders(v_vehicle.id, v_staff_user_id);
      RAISE NOTICE 'Created folder structure for vehicle: %', v_vehicle.name;
    ELSE
      RAISE NOTICE 'Folder structure already exists for vehicle: %', v_vehicle.name;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 2) ASSIGN EXISTING DOCUMENTS TO APPROPRIATE FOLDERS
-- ============================================================================

DO $$
DECLARE
  v_doc RECORD;
  v_folder_id uuid;
  v_category_name text;
  v_updated_count int := 0;
BEGIN
  -- Loop through all documents that have a vehicle_id but no folder_id
  FOR v_doc IN 
    SELECT id, vehicle_id, type, name, file_key
    FROM documents
    WHERE vehicle_id IS NOT NULL
    AND folder_id IS NULL
    AND deal_id IS NULL  -- Only holdings documents
  LOOP
    -- Determine category folder based on document type
    v_category_name := CASE 
      WHEN v_doc.type IN ('Subscription', 'Agreement', 'subscription', 'agreement') THEN 'Agreements'
      WHEN v_doc.type IN ('KYC', 'kyc') THEN 'KYC Documents'
      WHEN v_doc.type IN ('Statement', 'statement', 'capital_call') THEN 'Position Statements'
      WHEN v_doc.type IN ('NDA', 'nda') THEN 'NDAs'
      WHEN v_doc.type IN ('Report', 'report', 'Tax', 'tax', 'memo') THEN 'Reports'
      ELSE 'Reports'  -- Default to Reports folder
    END;

    -- Find the category folder for this vehicle
    SELECT id INTO v_folder_id
    FROM document_folders
    WHERE vehicle_id = v_doc.vehicle_id
    AND folder_type = 'category'
    AND name = v_category_name;

    -- Update document with folder_id
    IF v_folder_id IS NOT NULL THEN
      UPDATE documents
      SET folder_id = v_folder_id
      WHERE id = v_doc.id;
      
      v_updated_count := v_updated_count + 1;
    ELSE
      RAISE NOTICE 'Could not find folder % for vehicle_id %', v_category_name, v_doc.vehicle_id;
    END IF;
  END LOOP;

  RAISE NOTICE 'Updated % documents with folder assignments', v_updated_count;
END $$;

-- ============================================================================
-- 3) SET ALL EXISTING DOCUMENTS TO PUBLISHED STATUS
-- ============================================================================

-- Update all documents without explicit status to be published
UPDATE documents
SET 
  status = 'published',
  is_published = true,
  published_at = COALESCE(published_at, created_at)
WHERE is_published IS NULL OR status IS NULL;

-- ============================================================================
-- 4) ENSURE ALL DOCUMENTS HAVE NAMES
-- ============================================================================

-- Extract filename from file_key for documents without names
UPDATE documents
SET name = 
  CASE 
    WHEN name IS NULL OR name = '' THEN
      regexp_replace(
        substring(file_key from '[^/]+$'),
        '\.[^.]+$',
        ''
      )
    ELSE name
  END
WHERE name IS NULL OR name = '';

-- ============================================================================
-- 5) CREATE INITIAL VERSION RECORDS FOR DOCUMENTS WITHOUT VERSIONS
-- ============================================================================

INSERT INTO document_versions (document_id, version_number, file_key, file_size_bytes, mime_type, created_by, created_at)
SELECT 
  d.id,
  1,
  d.file_key,
  d.file_size_bytes,
  d.mime_type,
  d.created_by,
  d.created_at
FROM documents d
WHERE NOT EXISTS (
  SELECT 1 FROM document_versions dv 
  WHERE dv.document_id = d.id
);

-- ============================================================================
-- 6) SUMMARY AND VERIFICATION
-- ============================================================================

DO $$
DECLARE
  v_total_folders int;
  v_total_docs int;
  v_docs_with_folders int;
  v_published_docs int;
  v_docs_with_versions int;
BEGIN
  SELECT COUNT(*) INTO v_total_folders FROM document_folders;
  SELECT COUNT(*) INTO v_total_docs FROM documents;
  SELECT COUNT(*) INTO v_docs_with_folders FROM documents WHERE folder_id IS NOT NULL;
  SELECT COUNT(*) INTO v_published_docs FROM documents WHERE is_published = true;
  SELECT COUNT(DISTINCT document_id) INTO v_docs_with_versions FROM document_versions;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total folders created: %', v_total_folders;
  RAISE NOTICE 'Total documents: %', v_total_docs;
  RAISE NOTICE 'Documents assigned to folders: %', v_docs_with_folders;
  RAISE NOTICE 'Published documents: %', v_published_docs;
  RAISE NOTICE 'Documents with version history: %', v_docs_with_versions;
  RAISE NOTICE '==============================================';
  
  -- Warnings
  IF v_docs_with_folders < v_total_docs THEN
    RAISE WARNING '% documents still without folder assignments', (v_total_docs - v_docs_with_folders);
  END IF;
  
  IF v_docs_with_versions < v_total_docs THEN
    RAISE WARNING '% documents without version records', (v_total_docs - v_docs_with_versions);
  END IF;
END $$;

-- ============================================================================
-- 7) VERIFICATION QUERIES (for manual checking)
-- ============================================================================

-- Show folder structure
/*
SELECT 
  v.name as vehicle_name,
  df.name as folder_name,
  df.folder_type,
  df.path,
  COUNT(d.id) as document_count
FROM document_folders df
JOIN vehicles v ON v.id = df.vehicle_id
LEFT JOIN documents d ON d.folder_id = df.id
GROUP BY v.name, df.name, df.folder_type, df.path
ORDER BY v.name, df.path;
*/

-- Show documents without folders
/*
SELECT 
  d.id,
  d.name,
  d.type,
  v.name as vehicle_name,
  d.folder_id
FROM documents d
LEFT JOIN vehicles v ON v.id = d.vehicle_id
WHERE d.vehicle_id IS NOT NULL
AND d.folder_id IS NULL
AND d.deal_id IS NULL;
*/

-- Show unpublished documents
/*
SELECT 
  d.id,
  d.name,
  d.status,
  d.is_published,
  v.name as vehicle_name
FROM documents d
LEFT JOIN vehicles v ON v.id = d.vehicle_id
WHERE d.is_published = false OR d.is_published IS NULL;
*/

