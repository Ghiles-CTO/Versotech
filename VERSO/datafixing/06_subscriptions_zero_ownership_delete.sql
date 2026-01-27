-- Delete subscriptions matched to dashboard rows with ownership = 0
-- Source: VERSO/datafixing/06_missing_positions_dashboard_check.csv
begin;
delete from subscriptions where id in ('0880e531-064f-4e72-b10d-b479d272e4b6','0aea8f0f-0d3d-4370-ab8b-3510fc8afd03','0edc5688-61bb-4f1c-9852-a7521cf7cd60','1525565f-6f8c-4234-acd6-88e8ab8c843c','1c26998c-da6a-4ebe-af30-97866fd8094d','2323a386-79a1-4418-b900-5cca18bc177f','29e570ba-7a17-494f-ae7e-f1a084ea1df8','33df902f-33d6-4458-9dae-cb871d5df498','3fef8a0c-b199-4efc-a0f5-50e697a2b7f6','63191913-5665-4800-ad08-ed6912d587fa','690f199e-2d4c-4d55-9dad-6137582781a6','7da85348-76b0-4d59-bd41-70bb55588dda','9d3ccdc1-2007-462d-b7f0-adcd8fd794e2','9e9c46be-4a2d-45a8-9657-d03225cc2ba8','a71bd875-f2fb-472d-bd31-35b0a7d3e8d2','b0c8c124-fb42-4706-b2d5-f5ffb44fe17a','bb36dcaa-d3eb-4e64-a017-ff7e55be1348','c21bd0b7-d15e-4f01-a6b7-7684c710c68b','cb4e7436-7564-4985-8215-aa0e9ecf245a','e86930f1-e57c-4e91-a88c-5050901a47dc');
commit;
