create type show_status as enum ('draft', 'published', 'cancelled');

create table if not exists shows (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    venue_id uuid references venues(id) not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    status show_status default 'draft',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create trigger to automatically update updated_at
create trigger set_updated_at
    before update on shows
    for each row
    execute function set_updated_at();

-- Add indexes
create index shows_venue_id_idx on shows(venue_id);
create index shows_status_idx on shows(status);
create index shows_start_time_idx on shows(start_time); 