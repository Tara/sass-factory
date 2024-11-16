# Database Schema

## Tables

### Members
create table members (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null unique,
  phone text
);

### Availability
create table availability (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references members(id),
  date date not null,
  status text check (status in ('available', 'unavailable', 'maybe')),
  notes text
);

### Shows
create table shows (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  date timestamp with time zone not null,
  venue text not null,
  address text,
  ticket_link text,
  price text,
  image_path text,
  created_at timestamp with time zone default now()
);

### Show Performers
create table show_performers (
  show_id uuid references shows(id),
  member_id uuid references members(id),
  primary key (show_id, member_id)
);

### Rehearsals
create table rehearsals (
  id uuid default uuid_generate_v4() primary key,
  date timestamp with time zone not null,
  location text not null,
  notes text,
  created_at timestamp with time zone default now()
);

### Rehearsal Attendees
create table rehearsal_attendees (
  rehearsal_id uuid references rehearsals(id),
  member_id uuid references members(id),
  primary key (rehearsal_id, member_id)
);

### Member Notification Preferences
create table member_notification_preferences (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references members(id),
  notification_type text check (notification_type in ('whatsapp', 'sms', 'email')),
  is_enabled boolean default true,
  phone_whatsapp text,
  phone_sms text,
  created_at timestamp with time zone default now()
);

### Notification Log
create table notification_log (
  id uuid default uuid_generate_v4() primary key,
  member_id uuid references members(id),
  notification_type text check (notification_type in ('whatsapp', 'sms', 'email')),
  event_type text check (event_type in ('show_added', 'rehearsal_added', 'event_updated', 'reminder')),
  status text check (status in ('sent', 'failed', 'pending')),
  error_message text,
  created_at timestamp with time zone default now()
);