# API Routes

## Shows
- `GET /api/shows` - List all shows
- `POST /api/shows` - Create new show
- `PUT /api/shows/:id` - Update show
- `DELETE /api/shows/:id` - Delete show
- `POST /api/shows/:id/performers` - Update show performers

## Rehearsals
- `GET /api/rehearsals` - List all rehearsals
- `POST /api/rehearsals` - Create new rehearsal
- `PUT /api/rehearsals/:id` - Update rehearsal
- `DELETE /api/rehearsals/:id` - Delete rehearsal
- `POST /api/rehearsals/:id/attendees` - Update rehearsal attendees

## Availability
- `GET /api/availability` - Get availability for all members
- `POST /api/availability` - Set member availability
- `GET /api/availability/:memberId` - Get specific member's availability

## Members
- `GET /api/members` - List all members
- `POST /api/members` - Add new member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

## Venues
- `GET /api/venues` - List all venues
- `POST /api/venues` - Create new venue
- `PUT /api/venues/:id` - Update venue
- `DELETE /api/venues/:id` - Delete venue

## Notifications
- `GET /api/notifications/preferences/:memberId` - Get member notification preferences
- `PUT /api/notifications/preferences/:memberId` - Update notification preferences
- `GET /api/notifications/log/:memberId` - Get notification history
- `POST /api/notifications/test` - Send test notification

## Response Formats

### Venue Object
{
  id: string;
  name: string;
  address?: string;
  contactEmail?: string;
  createdAt: string; // ISO 8601
}

### Show Object
{
  id: string;
  title: string;
  date: string; // ISO 8601
  venueId: string;
  venue: {
    name: string;
    address?: string;
  };
  ticketLink?: string;
  price?: string;
  imagePath?: string;
  performers: {
    id: string;
    name: string;
  }[];
}

### Rehearsal Object
{
  id: string;
  date: string; // ISO 8601
  location: string;
  notes?: string;
  attendees: {
    id: string;
    name: string;
  }[];
}

### Availability Object
{
  id: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  status: 'available' | 'unavailable' | 'maybe';
  notes?: string;
}

### Member Object
{
  id: string;
  name: string;
  email: string;
  phone?: string;
}

### NotificationPreferences Object
{
  memberId: string;
  whatsapp: {
    enabled: boolean;
    phone?: string;
  };
  sms: {
    enabled: boolean;
    phone?: string;
  };
  email: {
    enabled: boolean;
  };
}

### NotificationLog Object
{
  id: string;
  memberId: string;
  type: 'whatsapp' | 'sms' | 'email';
  eventType: 'show_added' | 'rehearsal_added' | 'event_updated' | 'reminder';
  status: 'sent' | 'failed' | 'pending';
  errorMessage?: string;
  createdAt: string; // ISO 8601
}