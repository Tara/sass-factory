-- Clear existing data
TRUNCATE venues, shows, members, show_members CASCADE;

-- Seed venues
WITH inserted_venues AS (
  INSERT INTO venues (id, name, address, venue_url, image_url, contact_email) VALUES
    ('123e4567-e89b-12d3-a456-426614174000'::uuid, 'The Comedy Store', '8433 Sunset Blvd, Los Angeles, CA 90069', 'https://thecomedystore.com', 'https://picsum.photos/seed/comedy-store/800/600', 'bookings@comedystore.com'),
    ('987fcdeb-51a2-3d4b-8c9e-426614174001'::uuid, 'Laugh Factory', '8001 Sunset Blvd, Los Angeles, CA 90046', 'https://laughfactory.com', 'https://picsum.photos/seed/laugh-factory/800/600', 'events@laughfactory.com'),
    ('a1b2c3d4-e5f6-4a5b-8c9d-426614174002'::uuid, 'UCB Theatre', '5919 Franklin Ave, Los Angeles, CA 90028', 'https://ucbcomedy.com', 'https://picsum.photos/seed/ucb-theatre/800/600', 'franklin@ucbtheatre.com'),
    ('b2c3d4e5-f6a7-5b6c-9d0e-426614174003'::uuid, 'The Second City', '6616 Hollywood Blvd, Los Angeles, CA 90028', 'https://secondcity.com', 'https://picsum.photos/seed/second-city/800/600', 'hollywood@secondcity.com'),
    ('c3d4e5f6-a7b8-6c7d-0e1f-426614174004'::uuid, 'iO West', '6366 Hollywood Blvd, Los Angeles, CA 90028', 'https://ioimprov.com/west', 'https://picsum.photos/seed/io-west/800/600', 'shows@iowest.com')
  RETURNING *
),

-- Seed members (including inactive members)
inserted_members AS (
  INSERT INTO members (id, name, email, photo_url, join_date, member_status) VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'John Smith', 'john@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=john-smith', '2023-03-15', 'active'),
    ('6ba7b810-9dad-11d1-80b4-446655440001'::uuid, 'Jane Doe', 'jane@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=jane-doe', '2023-06-22', 'active'),
    ('7cb7b810-9dad-11d1-80b4-446655440002'::uuid, 'Mike Johnson', 'mike@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=mike-johnson', '2023-09-01', 'active'),
    ('8dc7b810-9dad-11d1-80b4-446655440003'::uuid, 'Sarah Williams', 'sarah@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=sarah-williams', '2023-11-30', 'active'),
    ('9ed7b810-9dad-11d1-80b4-446655440004'::uuid, 'Tom Brown', 'tom@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=tom-brown', '2024-01-15', 'active'),
    ('af07b810-9dad-11d1-80b4-446655440005'::uuid, 'Lisa Garcia', 'lisa@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=lisa-garcia', '2024-03-28', 'active'),
    ('bf17b810-9dad-11d1-80b4-446655440006'::uuid, 'David Lee', 'david@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=david-lee', '2024-07-04', 'active'),
    -- New inactive members
    ('cf27b810-9dad-11d1-80b4-446655440007'::uuid, 'Alex Rivera', 'alex@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=alex-rivera', '2023-04-01', 'inactive'),
    ('df37b810-9dad-11d1-80b4-446655440008'::uuid, 'Emma Wilson', 'emma@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=emma-wilson', '2023-08-15', 'inactive'),
    ('ef47b810-9dad-11d1-80b4-446655440009'::uuid, 'Chris Taylor', 'chris@example.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=chris-taylor', '2024-02-01', 'inactive')
  RETURNING *
),

-- Seed shows with various statuses
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
    -- Past shows (completed and performed)
    ('7c9e6679-7425-40de-944b-e07fc1f90ae1', '123e4567-e89b-12d3-a456-426614174000', '2024-09-15 20:00:00+00', 'Fall Comedy Night', 'https://tickets.com/fall-comedy', 25.00, 'completed'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae2', '987fcdeb-51a2-3d4b-8c9e-426614174001', '2024-10-01 19:30:00+00', 'October Showcase', 'https://tickets.com/oct-show', 30.00, 'performed'),
    
    -- Current/Upcoming shows (scheduled - November/December 2024)
    ('7c9e6679-7425-40de-944b-e07fc1f90ae3', 'a1b2c3d4-e5f6-4a5b-8c9d-426614174002', '2024-11-30 20:00:00+00', 'Thanksgiving Special', 'https://tickets.com/thanksgiving', 35.00, 'scheduled'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae4', 'b2c3d4e5-f6a7-5b6c-9d0e-426614174003', '2024-12-31 22:30:00+00', 'New Years Eve Spectacular', 'https://tickets.com/nye2024', 75.00, 'scheduled'),
    
    -- 2025 Shows
    ('7c9e6679-7425-40de-944b-e07fc1f90ae5', 'c3d4e5f6-a7b8-6c7d-0e1f-426614174004', '2025-02-14 20:00:00+00', 'Valentine''s Day Special', 'https://tickets.com/vday2025', 45.00, 'scheduled'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae6', '123e4567-e89b-12d3-a456-426614174000', '2025-04-01 20:00:00+00', 'April Fools Extravaganza', 'https://tickets.com/april2025', 40.00, 'scheduled'),
    
    -- Far Future Shows (Late 2025)
    ('7c9e6679-7425-40de-944b-e07fc1f90ae7', '987fcdeb-51a2-3d4b-8c9e-426614174001', '2025-07-04 19:00:00+00', 'Independence Day Show', NULL, 50.00, 'scheduled'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae8', 'a1b2c3d4-e5f6-4a5b-8c9d-426614174002', '2025-10-31 21:00:00+00', 'Halloween Spooktacular 2025', NULL, NULL, 'scheduled'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae9', 'b2c3d4e5-f6a7-5b6c-9d0e-426614174003', '2025-12-31 22:30:00+00', 'NYE 2026 Countdown', NULL, 80.00, 'scheduled')
  ) AS t(id, venue_id, date, name, ticket_link, price, status)
  RETURNING *
)

-- Seed show_members with various statuses
INSERT INTO show_members (show_id, member_id, status)
VALUES
  -- Past shows (September/October 2024)
  ('7c9e6679-7425-40de-944b-e07fc1f90ae1', '550e8400-e29b-41d4-a716-446655440000', 'performed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae1', '6ba7b810-9dad-11d1-80b4-446655440001', 'performed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae1', '7cb7b810-9dad-11d1-80b4-446655440002', 'no_show'),
  
  ('7c9e6679-7425-40de-944b-e07fc1f90ae2', '8dc7b810-9dad-11d1-80b4-446655440003', 'performed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae2', '9ed7b810-9dad-11d1-80b4-446655440004', 'performed'),
  
  -- Upcoming shows (November/December 2024)
  ('7c9e6679-7425-40de-944b-e07fc1f90ae3', '550e8400-e29b-41d4-a716-446655440000', 'confirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae3', 'af07b810-9dad-11d1-80b4-446655440005', 'not_attending'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae3', 'bf17b810-9dad-11d1-80b4-446655440006', 'confirmed'),
  
  ('7c9e6679-7425-40de-944b-e07fc1f90ae4', '6ba7b810-9dad-11d1-80b4-446655440001', 'confirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae4', '7cb7b810-9dad-11d1-80b4-446655440002', 'unconfirmed'),
  
  -- 2025 Shows (Early)
  ('7c9e6679-7425-40de-944b-e07fc1f90ae5', '8dc7b810-9dad-11d1-80b4-446655440003', 'confirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae5', '9ed7b810-9dad-11d1-80b4-446655440004', 'unconfirmed'),
  
  ('7c9e6679-7425-40de-944b-e07fc1f90ae6', 'af07b810-9dad-11d1-80b4-446655440005', 'confirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae6', 'bf17b810-9dad-11d1-80b4-446655440006', 'unconfirmed'),
  
  -- Far Future Shows (Late 2025)
  ('7c9e6679-7425-40de-944b-e07fc1f90ae7', '550e8400-e29b-41d4-a716-446655440000', 'unconfirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae7', '6ba7b810-9dad-11d1-80b4-446655440001', 'unconfirmed'),
  
  ('7c9e6679-7425-40de-944b-e07fc1f90ae8', '7cb7b810-9dad-11d1-80b4-446655440002', 'unconfirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae8', '8dc7b810-9dad-11d1-80b4-446655440003', 'confirmed'),
  
  ('7c9e6679-7425-40de-944b-e07fc1f90ae9', '9ed7b810-9dad-11d1-80b4-446655440004', 'unconfirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae9', 'af07b810-9dad-11d1-80b4-446655440005', 'unconfirmed');