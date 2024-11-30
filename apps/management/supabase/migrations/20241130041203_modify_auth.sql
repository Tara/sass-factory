-- Allow users to update their own metadata
CREATE POLICY "Users can update their own metadata"
    ON auth.users
    FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Create function to sync member data with auth user metadata
CREATE OR REPLACE FUNCTION sync_member_with_auth_metadata()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the update attempt
    RAISE LOG 'Syncing member data for user %, old metadata: %, new metadata: %', 
        NEW.id, 
        OLD.raw_user_meta_data,
        NEW.raw_user_meta_data;

    -- Update the corresponding member record
    UPDATE public.members
    SET 
        name = COALESCE(NEW.raw_user_meta_data->>'full_name', members.name),
        photo_url = COALESCE(NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''), members.photo_url),
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = NEW.id
    AND (
        COALESCE(NEW.raw_user_meta_data->>'full_name', members.name) != members.name
        OR COALESCE(NULLIF(NEW.raw_user_meta_data->>'avatar_url', ''), members.photo_url) != members.photo_url
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync member data when auth metadata changes
CREATE TRIGGER sync_member_with_auth_metadata
    AFTER UPDATE OF raw_user_meta_data ON auth.users
    FOR EACH ROW
    WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION sync_member_with_auth_metadata();

-- Grant necessary permissions
GRANT UPDATE ON auth.users TO authenticated; 