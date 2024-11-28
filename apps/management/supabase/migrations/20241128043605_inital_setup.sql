-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE show_status AS ENUM ('scheduled', 'performed', 'completed');
CREATE TYPE attendance_status AS ENUM ('unconfirmed', 'confirmed', 'not_attending', 'performed', 'no_show');

-- Create venues table
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    image_url TEXT,
    contact_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create shows table
CREATE TABLE shows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    ticket_link TEXT,
    image_url TEXT,
    price DECIMAL(10,2),
    status show_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create members table
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create show_members table
CREATE TABLE show_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'unconfirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(show_id, member_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_venues_updated_at
    BEFORE UPDATE ON venues
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shows_updated_at
    BEFORE UPDATE ON shows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_show_members_updated_at
    BEFORE UPDATE ON show_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create show_members records
CREATE OR REPLACE FUNCTION create_show_members() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO show_members (show_id, member_id, status)
  SELECT NEW.id, members.id, 'unconfirmed'::attendance_status
  FROM members
  WHERE NOT EXISTS (
    SELECT 1 
    FROM show_members 
    WHERE show_id = NEW.id AND member_id = members.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic show_members creation
CREATE TRIGGER show_created
  AFTER INSERT ON shows
  FOR EACH ROW
  EXECUTE FUNCTION create_show_members();

-- Create indexes
CREATE INDEX idx_shows_venue_id ON shows(venue_id);
CREATE INDEX idx_shows_date ON shows(date);
CREATE INDEX idx_show_members_show_id ON show_members(show_id);
CREATE INDEX idx_show_members_member_id ON show_members(member_id);

-- Add table comments
COMMENT ON TABLE shows IS 'Shows table with optional price and ticket link';
COMMENT ON FUNCTION create_show_members() IS 'Automatically creates show_members records for all members when a new show is created';