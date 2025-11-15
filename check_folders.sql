-- Check folder breakdown
SELECT 
  folder_type,
  COUNT(*) as count
FROM document_folders
GROUP BY folder_type
ORDER BY count DESC;

-- Check folders per vehicle
SELECT 
  COUNT(DISTINCT vehicle_id) as total_vehicles,
  COUNT(*) as total_folders,
  ROUND(COUNT(*)::numeric / COUNT(DISTINCT vehicle_id)::numeric, 2) as avg_folders_per_vehicle
FROM document_folders
WHERE vehicle_id IS NOT NULL;

-- Sample vehicle folder structure
WITH vehicle_sample AS (
  SELECT vehicle_id, name 
  FROM document_folders 
  WHERE folder_type = 'vehicle_root' 
  LIMIT 1
)
SELECT 
  df.name as folder_name,
  df.folder_type,
  df.path
FROM document_folders df
JOIN vehicle_sample vs ON df.vehicle_id = vs.vehicle_id
ORDER BY df.path;
