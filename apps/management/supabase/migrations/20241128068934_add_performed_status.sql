-- First add the new status to member_status
ALTER TYPE member_status ADD VALUE IF NOT EXISTS 'performed';

-- Drop the column that depends on the type
ALTER TABLE shows 
  DROP COLUMN status;

-- Drop and recreate the type
DROP TYPE IF EXISTS show_status;
CREATE TYPE show_status AS ENUM ('scheduled', 'cancelled', 'performed', 'completed');

-- Recreate the column with the new type
ALTER TABLE shows 
  ADD COLUMN status show_status NOT NULL DEFAULT 'scheduled';

-- Add a comment to explain the status meanings
COMMENT ON COLUMN shows.status IS 'Show status: scheduled (upcoming), cancelled (won''t happen), performed (happened), completed (administrative tasks done)';