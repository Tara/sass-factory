-- Add user roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'member');

-- Add user_id to members table first since it's referenced in trigger
ALTER TABLE members 
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Create user_roles table
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    role user_role NOT NULL DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, role)
);

-- Add updated_at trigger for user_roles
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create helper functions
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

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger as $$
DECLARE
    default_photo TEXT := 'https://placeholder.co/300';
BEGIN
    -- Create member record
    INSERT INTO public.members (
        name,
        email,
        photo_url,
        join_date,
        user_id
    )
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''), default_photo),
        CURRENT_DATE,
        NEW.id
    );
    
    -- Create role record
    INSERT INTO user_roles (user_id, role)
    VALUES (NEW.id, 'member');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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

-- Add helpful comments
COMMENT ON TABLE user_roles IS 'Stores user roles (admin, manager, member) for permission management';
COMMENT ON FUNCTION is_staff() IS 'Convenience function to check if user is admin or manager';
COMMENT ON FUNCTION has_role(user_role) IS 'Check if the current user has a specific role';
COMMENT ON COLUMN members.user_id IS 'Links members to their Supabase auth user account';