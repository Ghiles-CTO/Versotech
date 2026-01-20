-- Aboud -> Aboud Khaddam
update introducers
set display_name = 'Aboud Khaddam',
    legal_name = 'Aboud Khaddam',
    email = coalesce(nullif('akhaddam@ymail.com', ''), email),
    contact_name = coalesce(nullif('', ''), contact_name)
where lower(display_name) = lower('Aboud')
   or lower(legal_name) = lower('Aboud')
   or lower(display_name) = lower('Aboud Khaddam')
   or lower(legal_name) = lower('Aboud Khaddam');

-- Andrew -> Andrew Stewart
update introducers
set display_name = 'Andrew Stewart',
    legal_name = 'Andrew Stewart',
    email = coalesce(nullif('andrewstewart12@me.com', ''), email),
    contact_name = coalesce(nullif('', ''), contact_name)
where lower(display_name) = lower('Andrew')
   or lower(legal_name) = lower('Andrew')
   or lower(display_name) = lower('Andrew Stewart')
   or lower(legal_name) = lower('Andrew Stewart');

-- AUX -> AUX Business Support Ltd
update introducers
set display_name = 'AUX Business Support Ltd',
    legal_name = 'AUX Business Support Ltd',
    email = coalesce(nullif('dbaumslag@versoholdings.com', ''), email),
    contact_name = coalesce(nullif('Daniel Baumslag', ''), contact_name)
where lower(display_name) = lower('AUX')
   or lower(legal_name) = lower('AUX')
   or lower(display_name) = lower('AUX Business Support Ltd')
   or lower(legal_name) = lower('AUX Business Support Ltd');

-- Elevation -> Elevation Securities
update introducers
set display_name = 'Elevation Securities',
    legal_name = 'Elevation Securities',
    email = coalesce(nullif('scarter@elevationsecurities.com', ''), email),
    contact_name = coalesce(nullif('Smoot Carter', ''), contact_name)
where lower(display_name) = lower('Elevation')
   or lower(legal_name) = lower('Elevation')
   or lower(display_name) = lower('Elevation Securities')
   or lower(legal_name) = lower('Elevation Securities');

-- Elevation+Rick -> Altras Capital Financing Broker
update introducers
set display_name = 'Altras Capital Financing Broker',
    legal_name = 'Altras Capital Financing Broker',
    email = coalesce(nullif('rick@altraswealth.com', ''), email),
    contact_name = coalesce(nullif('Raminder Singh', ''), contact_name)
where lower(display_name) = lower('Elevation+Rick')
   or lower(legal_name) = lower('Elevation+Rick')
   or lower(display_name) = lower('Altras Capital Financing Broker')
   or lower(legal_name) = lower('Altras Capital Financing Broker');

-- Enguerrand -> Enguerrand Elbaz
update introducers
set display_name = 'Enguerrand Elbaz',
    legal_name = 'Enguerrand Elbaz',
    email = coalesce(nullif('e.edp@hotmail.com', ''), email),
    contact_name = coalesce(nullif('', ''), contact_name)
where lower(display_name) = lower('Enguerrand')
   or lower(legal_name) = lower('Enguerrand')
   or lower(display_name) = lower('Enguerrand Elbaz')
   or lower(legal_name) = lower('Enguerrand Elbaz');

-- Gary -> Game Venture Management LLC
update introducers
set display_name = 'Game Venture Management LLC',
    legal_name = 'Game Venture Management LLC',
    email = coalesce(nullif('gary@groupequality.com', ''), email),
    contact_name = coalesce(nullif('Gary Lisiewski', ''), contact_name)
where lower(display_name) = lower('Gary')
   or lower(legal_name) = lower('Gary')
   or lower(display_name) = lower('Game Venture Management LLC')
   or lower(legal_name) = lower('Game Venture Management LLC');

-- Gemera -> GEMERA Consulting Pte Ltd
update introducers
set display_name = 'GEMERA Consulting Pte Ltd',
    legal_name = 'GEMERA Consulting Pte Ltd',
    email = coalesce(nullif('gemeraconsulting@outlook.com', ''), email),
    contact_name = coalesce(nullif('Sandro Lang', ''), contact_name)
where lower(display_name) = lower('Gemera')
   or lower(legal_name) = lower('Gemera')
   or lower(display_name) = lower('GEMERA Consulting Pte Ltd')
   or lower(legal_name) = lower('GEMERA Consulting Pte Ltd');

-- Gio -> Giovanni SALADINO
update introducers
set display_name = 'Giovanni SALADINO',
    legal_name = 'Giovanni SALADINO',
    email = coalesce(nullif('ga@lurracapital.com', ''), email),
    contact_name = coalesce(nullif('', ''), contact_name)
where lower(display_name) = lower('Gio')
   or lower(legal_name) = lower('Gio')
   or lower(display_name) = lower('Giovanni SALADINO')
   or lower(legal_name) = lower('Giovanni SALADINO');

-- John -> Moore & Moore Investments Ltd
update introducers
set display_name = 'Moore & Moore Investments Ltd',
    legal_name = 'Moore & Moore Investments Ltd',
    email = coalesce(nullif('john@mooreandmooreinvestments.com', ''), email),
    contact_name = coalesce(nullif('John Moore', ''), contact_name)
where lower(display_name) = lower('John')
   or lower(legal_name) = lower('John')
   or lower(display_name) = lower('Moore & Moore Investments Ltd')
   or lower(legal_name) = lower('Moore & Moore Investments Ltd');

-- Omar -> Omar ADI
update introducers
set display_name = 'Omar ADI',
    legal_name = 'Omar ADI',
    email = coalesce(nullif('omar.adi3432@gmail.com', ''), email),
    contact_name = coalesce(nullif('', ''), contact_name)
where lower(display_name) = lower('Omar')
   or lower(legal_name) = lower('Omar')
   or lower(display_name) = lower('Omar ADI')
   or lower(legal_name) = lower('Omar ADI');

-- Rick -> Altras Capital Financing Broker
update introducers
set display_name = 'Altras Capital Financing Broker',
    legal_name = 'Altras Capital Financing Broker',
    email = coalesce(nullif('rick@altraswealth.com', ''), email),
    contact_name = coalesce(nullif('Raminder Singh', ''), contact_name)
where lower(display_name) = lower('Rick')
   or lower(legal_name) = lower('Rick')
   or lower(display_name) = lower('Altras Capital Financing Broker')
   or lower(legal_name) = lower('Altras Capital Financing Broker');

-- Sandro-Gemera -> GEMERA Consulting Pte Ltd
update introducers
set display_name = 'GEMERA Consulting Pte Ltd',
    legal_name = 'GEMERA Consulting Pte Ltd',
    email = coalesce(nullif('gemeraconsulting@outlook.com', ''), email),
    contact_name = coalesce(nullif('Sandro Lang', ''), contact_name)
where lower(display_name) = lower('Sandro-Gemera')
   or lower(legal_name) = lower('Sandro-Gemera')
   or lower(display_name) = lower('GEMERA Consulting Pte Ltd')
   or lower(legal_name) = lower('GEMERA Consulting Pte Ltd');

-- Stableton -> Stableton Financial AG
update introducers
set display_name = 'Stableton Financial AG',
    legal_name = 'Stableton Financial AG',
    email = coalesce(nullif('heiermann@stableton.com', ''), email),
    contact_name = coalesce(nullif('Konstantin Heiermann', ''), contact_name)
where lower(display_name) = lower('Stableton')
   or lower(legal_name) = lower('Stableton')
   or lower(display_name) = lower('Stableton Financial AG')
   or lower(legal_name) = lower('Stableton Financial AG');

-- Terra -> Terra Financial & Management Services SA
update introducers
set display_name = 'Terra Financial & Management Services SA',
    legal_name = 'Terra Financial & Management Services SA',
    email = coalesce(nullif('cabian.marc@terrafinancial.ch', ''), email),
    contact_name = coalesce(nullif('Marc Cabian', ''), contact_name)
where lower(display_name) = lower('Terra')
   or lower(legal_name) = lower('Terra')
   or lower(display_name) = lower('Terra Financial & Management Services SA')
   or lower(legal_name) = lower('Terra Financial & Management Services SA');

