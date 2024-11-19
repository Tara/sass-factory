-- Update shows table to add name and make price and ticket_link optional
ALTER TABLE shows
ADD COLUMN name TEXT NOT NULL,
ALTER COLUMN price DROP NOT NULL,
ALTER COLUMN ticket_link DROP NOT NULL;

-- Add a comment to explain the change
COMMENT ON TABLE shows IS 'Shows table with optional price and ticket link'; 