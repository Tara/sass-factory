-- Drop the existing trigger and function first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create an improved function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
DECLARE
    default_photo TEXT := 'https://placeholder.co/300';
    v_count INTEGER;
BEGIN
    SET LOCAL search_path TO public, auth;  -- Explicitly set search path
    
    RAISE LOG 'Starting handle_new_user for email: %', NEW.email;
    RAISE LOG 'User metadata: %', NEW.raw_user_meta_data;

    -- Check if member already exists with this email
    SELECT COUNT(*) INTO v_count FROM public.members WHERE email = NEW.email;
    RAISE LOG 'Existing members with this email: %', v_count;
    
    IF v_count > 0 THEN
        RAISE LOG 'Member already exists with email: %', NEW.email;
        RETURN NEW;
    END IF;

    BEGIN
        RAISE LOG 'Attempting to create member record for user_id: %', NEW.id;
        -- Create member record
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
        )
        RETURNING id INTO v_count;
        
        RAISE LOG 'Successfully created member record with id: %', v_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating member record - SQLSTATE: %, ERROR: %', SQLSTATE, SQLERRM;
        RETURN NEW;
    END;

    BEGIN
        RAISE LOG 'Attempting to create user role for user_id: %', NEW.id;
        -- Create role record
        INSERT INTO public.user_roles (
            user_id,
            role
        )
        VALUES (NEW.id, 'member')
        RETURNING id INTO v_count;
        
        RAISE LOG 'Successfully created user role with id: %', v_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating user role - SQLSTATE: %, ERROR: %', SQLSTATE, SQLERRM;
        RETURN NEW;
    END;
    
    RAISE LOG 'Successfully completed handle_new_user for email: %', NEW.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add some helpful comments
COMMENT ON FUNCTION handle_new_user() IS 'Handles creation of member record and role assignment for new users';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated;