-- Clear existing data
TRUNCATE venues, shows, members, show_members CASCADE;

-- Seed venues
WITH inserted_venues AS (
  INSERT INTO venues (id, name, address, image_url, contact_email) VALUES
    ('123e4567-e89b-12d3-a456-426614174000'::uuid, 'The Comedy Store', '8433 Sunset Blvd, Los Angeles, CA 90069', 'https://example.com/comedy-store.jpg', 'bookings@comedystore.com'),
    ('987fcdeb-51a2-3d4b-8c9e-426614174001'::uuid, 'Laugh Factory', '8001 Sunset Blvd, Los Angeles, CA 90046', 'https://example.com/laugh-factory.jpg', 'events@laughfactory.com')
  RETURNING *
),

-- Seed members
inserted_members AS (
  INSERT INTO members (id, name, email, photo_url) VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'John Smith', 'john@example.com', 'https://example.com/john.jpg'),
    ('6ba7b810-9dad-11d1-80b4-446655440001'::uuid, 'Jane Doe', 'jane@example.com', 'https://example.com/jane.jpg')
  RETURNING *
),

-- Seed shows
inserted_shows AS (
  INSERT INTO shows (id, venue_id, date, name, ticket_link, price, status)
  SELECT 
    id::uuid,
    venue_id::uuid,
    date::timestamp with time zone,
    name,
    ticket_link,
    price,
    status::show_status
  FROM (VALUES
    ('7c9e6679-7425-40de-944b-e07fc1f90ae7', '123e4567-e89b-12d3-a456-426614174000', '2024-04-01 20:00:00+00'::timestamp with time zone, 'Comedy Night Live', 'https://tickets.com/comedy-night', 25.00, 'scheduled'::show_status),
    ('8c9e6679-7425-40de-944b-e07fc1f90ae8', '987fcdeb-51a2-3d4b-8c9e-426614174001', '2024-04-15 19:30:00+00'::timestamp with time zone, 'Laugh Out Loud', 'https://tickets.com/lol-show', 30.00, 'scheduled'::show_status)
  ) AS t(id, venue_id, date, name, ticket_link, price, status)
  RETURNING *
)

-- Seed show_members
INSERT INTO show_members (show_id, member_id, status)
VALUES
  ('7c9e6679-7425-40de-944b-e07fc1f90ae7'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'confirmed'::member_status),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae7'::uuid, '6ba7b810-9dad-11d1-80b4-446655440001'::uuid, 'unconfirmed'::member_status),
  ('8c9e6679-7425-40de-944b-e07fc1f90ae8'::uuid, '550e8400-e29b-41d4-a716-446655440000'::uuid, 'confirmed'::member_status),
  ('8c9e6679-7425-40de-944b-e07fc1f90ae8'::uuid, '6ba7b810-9dad-11d1-80b4-446655440001'::uuid, 'confirmed'::member_status); 