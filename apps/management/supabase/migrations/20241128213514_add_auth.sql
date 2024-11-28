-- Add user_id to members table and link to auth.users
ALTER TABLE members 
ADD COLUMN user_id UUID REFERENCES auth.users(id),
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- Create admin users table
CREATE TABLE admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_members ENABLE ROW LEVEL SECURITY;

-- Policies for members table
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
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can delete members"
    ON members FOR DELETE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can insert members"
    ON members FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Policies for venues
CREATE POLICY "Anyone authenticated can view venues"
    ON venues FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anyone authenticated can insert venues"
    ON venues FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update venues"
    ON venues FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Anyone authenticated can delete venues"
    ON venues FOR DELETE
    TO authenticated
    USING (true);

-- Policies for shows
CREATE POLICY "Anyone authenticated can view shows"
    ON shows FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anyone authenticated can insert shows"
    ON shows FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone authenticated can update shows"
    ON shows FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Anyone authenticated can delete shows"
    ON shows FOR DELETE
    TO authenticated
    USING (true);

-- Policies for show_members
CREATE POLICY "Anyone authenticated can view show_members"
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

CREATE POLICY "Admins can update any show_members"
    ON show_members FOR UPDATE
    TO authenticated
    USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.members (name, email, photo_url, join_date, user_id)
    VALUES (
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        CURRENT_DATE,
        NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add comment explaining the auth setup
COMMENT ON TABLE admin_users IS 'Stores admin user IDs for elevated permissions';
COMMENT ON COLUMN members.user_id IS 'Links members to their Supabase auth user account';
