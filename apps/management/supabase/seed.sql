DO $$
BEGIN
  -- Insert sample venues
  INSERT INTO venues (id, name, address, contact_email) VALUES
    ('c731d3a9-f6c7-4c10-9485-00115d5a01a1', 'Endgames', '2727 California Street, Berkeley, CA 94703', 'contact@endgames.com'),
    ('d4f6c8e2-a159-4f3b-b1d9-6b5c8d7e9f0a', 'Leela', '901 Mission Street, San Francisco, CA 94103', 'info@leela.com'),
    ('b3e2c1d8-9a7b-4f5e-8d6c-4b3a2c1d8e9f', 'The Marsh', '1062 Valencia St, San Francisco, CA 94110', NULL);

  -- Insert sample members
  INSERT INTO members (id, name, email, phone) VALUES
    ('a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a', 'John Doe', 'john@example.com', '555-0100'),
    ('b2c3d4e5-f6a7-4b6c-8d1e-8f7a6d5e4f3b', 'Jane Smith', 'jane@example.com', '555-0101'),
    ('c3d4e5f6-a7b8-4c7d-9e2f-9a8b7c6d5e4f', 'Bob Wilson', 'bob@example.com', '555-0102');

  -- Insert sample shows
  INSERT INTO shows (id, title, date, venue_id, ticket_link, price) VALUES
    ('d4e5f6a7-b8c9-4d8e-af3a-0a9b8c7d6e5f', 'Friday Night Improv', '2024-04-15 20:00:00+00', 'c731d3a9-f6c7-4c10-9485-00115d5a01a1', 'https://tickets.example.com/1', '$15'),
    ('e5f6a7b8-c9d0-4e9f-bf4a-1b0c9d8e7f6a', 'Comedy Showcase', '2024-04-22 19:30:00+00', 'd4f6c8e2-a159-4f3b-b1d9-6b5c8d7e9f0a', 'https://tickets.example.com/2', '$20');

  -- Insert sample show performers
  INSERT INTO show_performers (show_id, member_id) VALUES
    ('d4e5f6a7-b8c9-4d8e-af3a-0a9b8c7d6e5f', 'a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a'),
    ('d4e5f6a7-b8c9-4d8e-af3a-0a9b8c7d6e5f', 'b2c3d4e5-f6a7-4b6c-8d1e-8f7a6d5e4f3b'),
    ('e5f6a7b8-c9d0-4e9f-bf4a-1b0c9d8e7f6a', 'b2c3d4e5-f6a7-4b6c-8d1e-8f7a6d5e4f3b'),
    ('e5f6a7b8-c9d0-4e9f-bf4a-1b0c9d8e7f6a', 'c3d4e5f6-a7b8-4c7d-9e2f-9a8b7c6d5e4f');

  -- Insert sample rehearsals
  INSERT INTO rehearsals (id, date, location, notes) VALUES
    ('f6a7b8c9-d0e1-4f0a-ab5c-2d1e0f9a8b7c', '2024-04-10 18:00:00+00', 'Practice Room A', 'Character work focus'),
    ('a7b8c9d0-e1f2-4a1b-bc6d-3e2f1a0b9c8d', '2024-04-17 18:00:00+00', 'Practice Room B', 'Show prep');

  -- Insert sample availability
  INSERT INTO availability (member_id, date, status, notes) VALUES
    ('a1b2c3d4-e5f6-4a5b-9c8d-7e6f5d4c3b2a', '2024-04-10', 'available', NULL),
    ('b2c3d4e5-f6a7-4b6c-8d1e-8f7a6d5e4f3b', '2024-04-10', 'maybe', 'Might be late'),
    ('c3d4e5f6-a7b8-4c7d-9e2f-9a8b7c6d5e4f', '2024-04-10', 'unavailable', 'Out of town');
END
$$;