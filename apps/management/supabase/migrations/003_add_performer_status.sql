ALTER TABLE show_performers
ADD COLUMN status TEXT DEFAULT 'pending'
CHECK (status IN ('pending', 'confirmed', 'declined', 'attended', 'no_show'));

-- Update existing records to have 'confirmed' status
UPDATE show_performers
SET status = 'confirmed'
WHERE status IS NULL; 