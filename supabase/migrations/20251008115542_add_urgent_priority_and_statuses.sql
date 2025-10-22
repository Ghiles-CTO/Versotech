-- Add 'urgent' to request_priority_enum
ALTER TYPE request_priority_enum ADD VALUE IF NOT EXISTS 'urgent';

-- Add 'awaiting_info' to request_status_enum
ALTER TYPE request_status_enum ADD VALUE IF NOT EXISTS 'awaiting_info';

-- Add 'cancelled' to request_status_enum
ALTER TYPE request_status_enum ADD VALUE IF NOT EXISTS 'cancelled';;
