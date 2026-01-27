-- Normalize/merge introducers per dashboard + renaming rules
-- Stableton+Terra -> Terra Financial & Management Services SA
-- Denis Matthey duplicate -> delete unused
-- GEMERA duplicate -> merge into canonical id

begin;

-- Stableton+Terra -> Terra (move references, then delete)
update introducer_commissions
set introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
where introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed';

update introductions
set introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
where introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed';

update subscriptions
set introducer_id = '1e9af1ef-f4c5-4e73-b895-fe271ab6dc3d'
where introducer_id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed';

delete from introducers
where id = 'cca3a4b2-5a53-464a-8387-1ad326a168ed';

-- Denis Matthey duplicate (unused) -> delete
delete from introducers
where id = 'd02fa991-187d-4a20-b050-e88c28d40f29';

-- GEMERA Consulting Pte Ltd duplicate -> merge into canonical id (87571ef2...)
-- Remove duplicate introduction with deal_id NULL to avoid duplicates
delete from introductions
where id = 'd423b369-f80f-47ae-a51d-875384f0d586';

update introducer_commissions
set introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
where introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63';

update introductions
set introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
where introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63';

update subscriptions
set introducer_id = '87571ef2-b05d-4d7d-8095-2992d43b9aa8'
where introducer_id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63';

delete from introducers
where id = '61e01a81-0663-4d4a-9626-fc3a6acb4d63';

commit;
