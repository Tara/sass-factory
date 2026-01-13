-- Clear existing data
TRUNCATE venues, shows, members, show_members CASCADE;

-- Seed venues
WITH inserted_venues AS (
  INSERT INTO venues (id, name, address, venue_url, image_url, contact_email) VALUES
    ('123e4567-e89b-12d3-a456-426614174000'::uuid, 'Endgames', '2965 Mission St, San Francisco, CA', 'https://endgamesimprov.com', 'https://picsum.photos/seed/endgames/800/600', 'info@endgamesimprov.com'),
    ('987fcdeb-51a2-3d4b-8c9e-426614174001'::uuid, 'Leela', '901 Mission Street, San Francisco, CA 94103', 'https://leelasf.com', 'https://picsum.photos/seed/leela/800/600', 'info@leelasf.com'),
    ('a1b2c3d4-e5f6-4a5b-8c9d-426614174002'::uuid, 'All Out Comedy', '2036 Broadway, Oakland, CA 94612', 'https://alloutcomedy.com', 'https://picsum.photos/seed/allout/800/600', 'contact@alloutcomedy.com'),
    ('b2c3d4e5-f6a7-5b6c-9d0e-426614174003'::uuid, 'Jokeland', '2727 California Street, Berkeley, CA 94703', 'https://jokeland.com', 'https://picsum.photos/seed/jokeland/800/600', 'info@jokeland.com'),
    ('c3d4e5f6-a7b8-6c7d-0e1f-426614174004'::uuid, 'The Marsh', '1062 Valencia St, San Francisco, CA 94110', 'https://themarsh.org', 'https://picsum.photos/seed/marsh/800/600', 'info@themarsh.org'),
    ('d4e5f6a7-b8c9-7d8e-1f2f-426614174005'::uuid, 'Eclectic Box', '446 Valencia Street, San Francisco, CA 94103', 'https://eclecticbox.com', 'https://picsum.photos/seed/eclectic/800/600', 'info@eclecticbox.com'),
    ('e5f6a7b8-c9d0-8e9f-2f3f-426614174006'::uuid, 'Media and Immersive eXperience', 'Mesa, AZ', 'https://savifest.com', 'https://picsum.photos/seed/savifest/800/600', 'info@savifest.com')
  RETURNING *
),

-- Seed members (keeping the same member data as before)
inserted_members AS (
  INSERT INTO members (id, name, email, photo_url, join_date, member_status) VALUES
    ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'Tiffany Cheung', 'tacheung@gmail.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=tiffany-cheung', '2024-01-01', 'inactive'),
    ('6ba7b810-9dad-11d1-80b4-446655440001'::uuid, 'Ben Easton', 'ben.m.easton@gmail.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=ben-easton', '2024-01-01', 'active'),
    ('7cb7b810-9dad-11d1-80b4-446655440002'::uuid, 'Brittany Nielsen', 'bnnielse@gmail.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=brittany-nielsen', '2024-01-01', 'active'),
    ('8dc7b810-9dad-11d1-80b4-446655440003'::uuid, 'Snigdha Rao', 'snigdharao8@gmail.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=snigdha-rao', '2024-01-01', 'active'),
    ('9ed7b810-9dad-11d1-80b4-446655440004'::uuid, 'Shawn Reimer', 'shawnreimer@mac.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=shawn-reimer', '2024-01-01', 'active'),
    ('af07b810-9dad-11d1-80b4-446655440005'::uuid, 'Emily Shenfield', 'emily.shenfield@gmail.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=emily-shenfield', '2024-01-01', 'active'),
    ('bf17b810-9dad-11d1-80b4-446655440006'::uuid, 'Tara Teich', 'tara.teich@gmail.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=tara-teich', '2024-01-01', 'active'),
    ('cf27b810-9dad-11d1-80b4-446655440007'::uuid, 'Luna Wu', 'lunawu310023@gmail.com', 'https://api.dicebear.com/9.x/bottts/svg?seed=luna-wu', '2024-01-01', 'active')
  RETURNING *
),

-- Seed shows with actual show data
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
    -- Past shows
    ('7c9e6679-7425-40de-944b-e07fc1f90ae1', 'c3d4e5f6-a7b8-6c7d-0e1f-426614174004', '2024-01-21 15:00:00+00', 'Sketchfest 2024', NULL, NULL, 'performed'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae2', '123e4567-e89b-12d3-a456-426614174000', '2024-09-21 21:00:00+00', 'Endgames Comedy Festival', NULL, NULL, 'performed'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae3', '123e4567-e89b-12d3-a456-426614174000', '2024-10-12 19:00:00+00', 'Required Taste', NULL, NULL, 'performed'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae4', 'a1b2c3d4-e5f6-4a5b-8c9d-426614174002', '2024-10-13 19:00:00+00', 'Vagabonds', NULL, NULL, 'performed'),
    
    -- Upcoming shows
    ('7c9e6679-7425-40de-944b-e07fc1f90ae5', 'b2c3d4e5-f6a7-5b6c-9d0e-426614174003', '2024-11-09 19:30:00+00', 'Jokeland', 'https://www.eventbrite.com/e/jokeland-variety-show-tickets-1022823642047', 0.00, 'scheduled'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae6', '987fcdeb-51a2-3d4b-8c9e-426614174001', '2024-11-23 19:30:00+00', 'Leela Winter Show', 'https://www.eventbrite.com/e/leela-improv-show-sat-112324-sanfrancisco-ca-tickets-1027970255707', 22.58, 'scheduled'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae7', '123e4567-e89b-12d3-a456-426614174000', '2025-01-16 19:00:00+00', 'Spoonful of Sass', NULL, NULL, 'scheduled'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae8', 'd4e5f6a7-b8c9-7d8e-1f2f-426614174005', '2025-01-17 21:00:00+00', 'SF Sketchfest 2025', 'https://www.eventbrite.com/e/sketch-improv-showcase-tickets-1082876676289', NULL, 'scheduled'),
    ('7c9e6679-7425-40de-944b-e07fc1f90ae9', 'e5f6a7b8-c9d0-8e9f-2f3f-426614174006', '2025-02-16 14:15:00+00', 'Savifest', 'https://savifest.com/troupes/sass-factory', NULL, 'scheduled')
  ) AS t(id, venue_id, date, name, ticket_link, price, status)
  RETURNING *
)

-- Seed show_members (keeping similar distribution of performers but with actual shows)
INSERT INTO show_members (show_id, member_id, status)
VALUES
  -- Past shows
  -- Sketchfest 2024
  ('7c9e6679-7425-40de-944b-e07fc1f90ae1', '6ba7b810-9dad-11d1-80b4-446655440001', 'performed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae1', '7cb7b810-9dad-11d1-80b4-446655440002', 'performed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae1', '8dc7b810-9dad-11d1-80b4-446655440003', 'performed'),
  
  -- Endgames Comedy Festival
  ('7c9e6679-7425-40de-944b-e07fc1f90ae2', '9ed7b810-9dad-11d1-80b4-446655440004', 'performed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae2', 'af07b810-9dad-11d1-80b4-446655440005', 'performed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae2', 'bf17b810-9dad-11d1-80b4-446655440006', 'performed'),
  
  -- Required Taste
  ('7c9e6679-7425-40de-944b-e07fc1f90ae3', '7cb7b810-9dad-11d1-80b4-446655440002', 'performed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae3', '8dc7b810-9dad-11d1-80b4-446655440003', 'performed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae3', 'cf27b810-9dad-11d1-80b4-446655440007', 'performed'),
  
  -- Upcoming shows
  -- Jokeland
  ('7c9e6679-7425-40de-944b-e07fc1f90ae5', '6ba7b810-9dad-11d1-80b4-446655440001', 'confirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae5', '9ed7b810-9dad-11d1-80b4-446655440004', 'confirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae5', 'bf17b810-9dad-11d1-80b4-446655440006', 'confirmed'),
  
  -- Leela Winter Show
  ('7c9e6679-7425-40de-944b-e07fc1f90ae6', '7cb7b810-9dad-11d1-80b4-446655440002', 'confirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae6', '8dc7b810-9dad-11d1-80b4-446655440003', 'confirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae6', 'cf27b810-9dad-11d1-80b4-446655440007', 'confirmed'),
  
  -- Future shows (2025)
  -- Spoonful of Sass
  ('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'af07b810-9dad-11d1-80b4-446655440005', 'unconfirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae7', 'bf17b810-9dad-11d1-80b4-446655440006', 'unconfirmed'),
  
  -- SF Sketchfest 2025
  ('7c9e6679-7425-40de-944b-e07fc1f90ae8', '6ba7b810-9dad-11d1-80b4-446655440001', 'unconfirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae8', '7cb7b810-9dad-11d1-80b4-446655440002', 'unconfirmed'),
  
  -- Savifest
  ('7c9e6679-7425-40de-944b-e07fc1f90ae9', '8dc7b810-9dad-11d1-80b4-446655440003', 'unconfirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae9', '9ed7b810-9dad-11d1-80b4-446655440004', 'unconfirmed'),
  ('7c9e6679-7425-40de-944b-e07fc1f90ae9', 'cf27b810-9dad-11d1-80b4-446655440007', 'unconfirmed');