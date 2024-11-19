-- Clear existing data
TRUNCATE venues, shows, members, show_members CASCADE;

-- Seed venues
WITH inserted_venues AS (
  INSERT INTO venues (name, address, image_url, contact_email) VALUES
    ('The Comedy Store', '123 Laugh Street, City', 'https://example.com/comedy-store.jpg', 'booking@comedystore.com'),
    ('Improv Theater', '456 Jest Avenue, Town', 'https://example.com/improv-theater.jpg', 'contact@improvtheater.com'),
    ('The Funny Factory', '789 Humor Lane, Village', 'https://example.com/funny-factory.jpg', 'info@funnyfactory.com')
  RETURNING *
),

-- Seed members
inserted_members AS (
  INSERT INTO members (name, email, photo_url) VALUES
    ('Alice Smith', 'alice@example.com', 'https://example.com/alice.jpg'),
    ('Bob Johnson', 'bob@example.com', 'https://example.com/bob.jpg'),
    ('Charlie Brown', 'charlie@example.com', 'https://example.com/charlie.jpg'),
    ('Diana Ross', 'diana@example.com', 'https://example.com/diana.jpg')
  RETURNING *
),

-- Seed shows
inserted_shows AS (
  INSERT INTO shows (venue_id, date, ticket_link, image_url, price, status)
  SELECT 
    venue_id,
    date_value,
    ticket_link,
    image_url,
    price,
    status
  FROM (VALUES
    ((SELECT id FROM inserted_venues OFFSET 0 LIMIT 1), NOW() - INTERVAL '2 weeks', 'https://tickets.com/past-show', 'https://example.com/show1.jpg', 15.00, 'completed'::show_status),
    ((SELECT id FROM inserted_venues OFFSET 1 LIMIT 1), NOW() - INTERVAL '2 days', 'https://tickets.com/recent-show', NULL, 20.00, 'performed'::show_status),
    ((SELECT id FROM inserted_venues OFFSET 2 LIMIT 1), NOW() + INTERVAL '2 weeks', 'https://tickets.com/future-show', 'https://example.com/show3.jpg', 25.00, 'scheduled'::show_status),
    ((SELECT id FROM inserted_venues OFFSET 0 LIMIT 1), NOW() + INTERVAL '1 month', 'https://tickets.com/far-future-show', NULL, 30.00, 'scheduled'::show_status)
  ) AS t(venue_id, date_value, ticket_link, image_url, price, status)
  RETURNING *
)

-- Seed show_members
INSERT INTO show_members (show_id, member_id, status)
SELECT 
  s.id,
  m.id,
  status
FROM (VALUES
  (0, 0, 'performed'::member_status),
  (0, 1, 'performed'::member_status),
  (0, 2, 'no_show'::member_status),
  (0, 3, 'performed'::member_status),
  (1, 0, 'performed'::member_status),
  (1, 1, 'no_show'::member_status),
  (1, 2, 'performed'::member_status),
  (1, 3, 'performed'::member_status),
  (2, 0, 'confirmed'::member_status),
  (2, 1, 'not_attending'::member_status),
  (2, 2, 'confirmed'::member_status),
  (2, 3, 'unconfirmed'::member_status),
  (3, 0, 'unconfirmed'::member_status),
  (3, 1, 'unconfirmed'::member_status),
  (3, 2, 'unconfirmed'::member_status),
  (3, 3, 'unconfirmed'::member_status)
) AS t(show_offset, member_offset, status)
CROSS JOIN LATERAL (
  SELECT id FROM inserted_shows OFFSET t.show_offset LIMIT 1
) s
CROSS JOIN LATERAL (
  SELECT id FROM inserted_members OFFSET t.member_offset LIMIT 1
) m; 