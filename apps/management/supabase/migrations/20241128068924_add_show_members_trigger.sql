-- Create a function to automatically create show_members records
CREATE OR REPLACE FUNCTION create_show_members() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO show_members (show_id, member_id, status)
  SELECT NEW.id, members.id, 'unconfirmed'::member_status
  FROM members
  WHERE NOT EXISTS (
    SELECT 1 
    FROM show_members 
    WHERE show_id = NEW.id AND member_id = members.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS show_created ON shows;

-- Create the trigger
CREATE TRIGGER show_created
  AFTER INSERT ON shows
  FOR EACH ROW
  EXECUTE FUNCTION create_show_members();

-- Add comment explaining the trigger
COMMENT ON FUNCTION create_show_members() IS 'Automatically creates show_members records for all members when a new show is created'; 