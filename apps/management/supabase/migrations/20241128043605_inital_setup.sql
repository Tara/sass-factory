-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE show_status AS ENUM ('scheduled', 'performed', 'completed');
CREATE TYPE attendance_status AS ENUM ('unconfirmed', 'confirmed', 'not_attending', 'performed', 'no_show');
CREATE TYPE member_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');

-- Create venues table
CREATE TABLE venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    venue_url TEXT,
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
    member_status member_status NOT NULL DEFAULT 'pending',
    join_date DATE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- Create user_roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role)
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

-- Create helper functions for auth
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
    );
END;
$$ language plpgsql security definer;

CREATE OR REPLACE FUNCTION has_role(role_to_check user_role)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_id = auth.uid()
        AND role = role_to_check
    );
END;
$$ language plpgsql security definer;

-- Create function to handle new user registration with improved error handling
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
DECLARE
    default_photo TEXT := 'https://placeholder.co/300';
    v_count INTEGER;
BEGIN
    -- Add immediate log to see if function is called
    RAISE LOG 'handle_new_user triggered for user: %, email: %', NEW.id, NEW.email;
    
    -- Check if member already exists
    SELECT COUNT(*) INTO v_count FROM public.members WHERE email = NEW.email;
    RAISE LOG 'Found % existing members with email %', v_count, NEW.email;
    
    IF v_count > 0 THEN
        RAISE LOG 'Member already exists, exiting';
        RETURN NEW;
    END IF;

    -- Explicitly log what we're about to insert
    RAISE LOG 'Attempting to insert new member with email % and user_id %', NEW.email, NEW.id;
    
    INSERT INTO public.members (
        name,
        email,
        photo_url,
        join_date,
        user_id,
        member_status
    )
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''), default_photo),
        CURRENT_DATE,
        NEW.id,
        'active'
    );
    RAISE LOG 'Successfully inserted member';
    
    -- Insert role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'member');
    RAISE LOG 'Successfully inserted user_role';

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Add detailed error logging
    RAISE LOG 'Error in handle_new_user: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Create function to automatically create show_members records
CREATE OR REPLACE FUNCTION create_show_members() 
RETURNS TRIGGER AS $$
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

-- Create triggers
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

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER show_created
    AFTER INSERT ON shows
    FOR EACH ROW
    EXECUTE FUNCTION create_show_members();

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create indexes
CREATE INDEX idx_shows_venue_id ON shows(venue_id);
CREATE INDEX idx_shows_date ON shows(date);
CREATE INDEX idx_show_members_show_id ON show_members(show_id);
CREATE INDEX idx_show_members_member_id ON show_members(member_id);

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Members table policies
CREATE POLICY "Members can view all members"
    ON members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Members can update their own profile"
    ON members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can update any member"
    ON members FOR UPDATE
    TO authenticated
    USING (has_role('admin'));

CREATE POLICY "Admins can delete members"
    ON members FOR DELETE
    TO authenticated
    USING (has_role('admin'));

CREATE POLICY "Admins can insert members"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (has_role('admin'));

CREATE POLICY "Managers can update member status"
    ON members FOR UPDATE
    TO authenticated
    USING (
        has_role('manager') AND
        (member_status IS DISTINCT FROM (SELECT member_status FROM members WHERE id = id)) AND
        (email = (SELECT email FROM members WHERE id = id)) AND
        (user_id = (SELECT user_id FROM members WHERE id = id))
    );

-- Venues policies
CREATE POLICY "Anyone can view venues"
    ON venues FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can manage venues"
    ON venues FOR INSERT
    TO authenticated
    WITH CHECK (is_staff());

CREATE POLICY "Staff can update venues"
    ON venues FOR UPDATE
    TO authenticated
    USING (is_staff());

CREATE POLICY "Only admins can delete venues"
    ON venues FOR DELETE
    TO authenticated
    USING (has_role('admin'));

-- Shows policies
CREATE POLICY "Anyone can view shows"
    ON shows FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can manage shows"
    ON shows FOR INSERT
    TO authenticated
    WITH CHECK (is_staff());

CREATE POLICY "Staff can update shows"
    ON shows FOR UPDATE
    TO authenticated
    USING (is_staff());

CREATE POLICY "Only admins can delete shows"
    ON shows FOR DELETE
    TO authenticated
    USING (has_role('admin'));

-- Show members policies
CREATE POLICY "Anyone can view show_members"
    ON show_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Members can update their own show_members entries"
    ON show_members FOR UPDATE
    TO authenticated
    USING (
        member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can update any show_members"
    ON show_members FOR UPDATE
    TO authenticated
    USING (is_staff());

-- User roles policies
CREATE POLICY "Users can view all roles"
    ON user_roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage roles"
    ON user_roles FOR ALL
    TO authenticated
    USING (has_role('admin'));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated;


-- Add helpful comments
COMMENT ON TABLE shows IS 'Shows table with optional price and ticket link';
COMMENT ON TABLE user_roles IS 'Stores user roles (admin, manager, member) for permission management';
COMMENT ON FUNCTION create_show_members() IS 'Automatically creates show_members records for all members when a new show is created';
COMMENT ON FUNCTION is_staff() IS 'Convenience function to check if user is admin or manager';
COMMENT ON FUNCTION has_role(user_role) IS 'Check if the current user has a specific role';
COMMENT ON FUNCTION handle_new_user() IS 'Handles creation of member record and role assignment for new users';
COMMENT ON COLUMN members.user_id IS 'Links members to their Supabase auth user account';