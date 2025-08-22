-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for availability status
CREATE TYPE availability_status AS ENUM ('available', 'maybe', 'unavailable', 'unknown');

-- Create availability table
CREATE TABLE availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    morning_availability availability_status NOT NULL DEFAULT 'unknown',
    evening_availability availability_status NOT NULL DEFAULT 'unknown',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, date)
);

-- Create availability requests table
CREATE TABLE availability_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quarter_start DATE NOT NULL,
    quarter_end DATE NOT NULL,
    due_date DATE NOT NULL,
    created_by UUID REFERENCES members(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create responses tracking table
CREATE TABLE availability_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES availability_requests(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(request_id, member_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_availability_updated_at
    BEFORE UPDATE ON availability
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_requests_updated_at
    BEFORE UPDATE ON availability_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_responses_updated_at
    BEFORE UPDATE ON availability_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability
CREATE POLICY "Users can view all availability"
    ON availability FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own availability"
    ON availability FOR ALL
    TO authenticated
    USING (
        member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage all availability"
    ON availability FOR ALL
    TO authenticated
    USING (is_staff());

-- RLS Policies for availability requests
CREATE POLICY "Users can view availability requests"
    ON availability_requests FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Staff can manage availability requests"
    ON availability_requests FOR ALL
    TO authenticated
    USING (is_staff());

-- RLS Policies for availability responses
CREATE POLICY "Users can view all responses"
    ON availability_responses FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own responses"
    ON availability_responses FOR UPDATE
    TO authenticated
    USING (
        member_id IN (
            SELECT id FROM members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Staff can manage all responses"
    ON availability_responses FOR ALL
    TO authenticated
    USING (is_staff());

-- Create indexes
CREATE INDEX idx_availability_member_date ON availability(member_id, date);
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_availability_responses_request ON availability_responses(request_id);
CREATE INDEX idx_availability_responses_member ON availability_responses(member_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated;