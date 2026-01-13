-- Add system-level INSERT policy for the trigger
CREATE POLICY "System can create show_members"
    ON show_members FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM shows 
            WHERE id = show_id 
            AND status = 'scheduled'
        )
    );

-- Add staff-level INSERT policy
CREATE POLICY "Staff can create show_members"
    ON show_members FOR INSERT
    TO authenticated
    WITH CHECK (
        is_staff() 
        AND EXISTS (
            SELECT 1 FROM shows 
            WHERE id = show_id 
            AND status = 'scheduled'
        )
    ); 