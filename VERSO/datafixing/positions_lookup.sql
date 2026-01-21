with target_pairs (investor_id, vehicle_id) as (
  values
    ('35af0245-05fb-4d6c-b17e-64d0d6b180f0', 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'),
    ('9cb830ec-9a56-49bc-a6ef-3732b8e354d4', 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'),
    ('8618f750-f156-4c86-a554-5905443e08fb', 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'),
    ('971d7d29-fed0-43b0-960b-6f30e70cf086', 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'),
    ('5ee17648-dd9d-4351-a450-f57119440739', 'ba584abd-ea2b-4a3f-893a-c7e0999f4039'),
    ('53b54fb5-b965-4bcd-888a-8bfb98791ba5', 'ccc0bfd0-2c76-4b80-bcb9-12702cfb60bd'),
    ('30dcc335-6e6e-4644-8bc8-c04e386eef1e', '8d4db38a-0119-4eef-bb1a-d9f266aef1e7'),
    ('53b54fb5-b965-4bcd-888a-8bfb98791ba5', '8d4db38a-0119-4eef-bb1a-d9f266aef1e7'),
    ('02e7a81c-d5bf-4839-9776-f89ae320b586', '8d4db38a-0119-4eef-bb1a-d9f266aef1e7'),
    ('a7a6b0b9-538c-44d6-b8c6-3df69b5a5212', '060cf007-0671-4854-9eea-88d2b1497c53'),
    ('7ef0fd55-1269-4bbb-b72e-0405a64e18bc', '060cf007-0671-4854-9eea-88d2b1497c53'),
    ('43b6a41c-ef4c-4de0-ae3b-d70d0d9e4b43', '060cf007-0671-4854-9eea-88d2b1497c53'),
    ('938db8aa-ce0c-47e9-b0f7-23ba9c20e7a1', '060cf007-0671-4854-9eea-88d2b1497c53'),
    ('c433f598-149f-4748-9cc9-60b756a6f159', '060cf007-0671-4854-9eea-88d2b1497c53'),
    ('5ee17648-dd9d-4351-a450-f57119440739', '060cf007-0671-4854-9eea-88d2b1497c53'),
    ('69075b7c-5dfd-4bd5-b8f7-e0757fe28d64', '060cf007-0671-4854-9eea-88d2b1497c53'),
    ('a4fd57c5-202c-44d5-b5c9-c970fe97f66a', '060cf007-0671-4854-9eea-88d2b1497c53')
)
select tp.investor_id,
       tp.vehicle_id,
       v.entity_code,
       i.type as investor_type,
       i.display_name,
       i.legal_name,
       i.first_name,
       i.last_name,
       p.units
from target_pairs tp
join investors i on i.id = tp.investor_id
join vehicles v on v.id = tp.vehicle_id
left join positions p on p.investor_id = tp.investor_id and p.vehicle_id = tp.vehicle_id
order by v.entity_code, i.display_name, i.legal_name, i.last_name;