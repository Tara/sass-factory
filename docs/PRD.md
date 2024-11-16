# Product Requirements Document: Improv Team Management App

## Overview
An internal management application for improv team members (~10 users) to coordinate scheduling and manage shows/rehearsals, with Supabase as the source of truth.

## Technical Stack
- Frontend: Next.js
- Backend: Next.js API routes
- Database: Supabase
- Deployment: Vercel
- Repository Structure: Monorepo (existing Hugo site + Next.js app)

## Core Features

### 1. Availability Management
- Quarterly availability calendar view
- Members can mark dates as:
  - Available
  - Unavailable
  - Maybe/Notes
- Ability to set recurring availability patterns
- Calendar shows existing rehearsals and shows

### 2. Event Management
#### Venues
- Create/edit venue entries with:
  - Name
  - Address
  - Contact email
- Reusable venues for shows

#### Shows
- Create/edit show entries with:
  - Title
  - Date/Time
  - Venue (selected from venue list)
  - Ticket Link
  - Price
  - Image
  - Confirmed performers
- Automatic sync to Hugo website via Supabase integration

#### Rehearsals
- Create/edit rehearsal entries with:
  - Date/Time
  - Location
  - Confirmed attendees
  - Notes/Focus areas

### 3. Notifications
- Member-configurable notifications via:
  - WhatsApp
  - SMS
  - Email (fallback)
- Notification triggers for:
  - New shows added
  - New rehearsals scheduled
  - Updates to existing events
  - Rehearsal reminders
  - Show call times

## Implementation Details

### Phase 1: Core Infrastructure
1. Set up Next.js app in monorepo
2. Configure Supabase and create database schema
3. Implement basic authentication

### Phase 2: Availability Management
1. Create calendar interface
2. Implement availability marking system
3. Add recurring availability patterns

### Phase 3: Event Management
1. Build show creation/editing interface
2. Implement rehearsal management
3. Create performer/attendee assignment system

### Phase 4: Hugo Integration
1. Create API endpoints for Hugo
2. Implement automatic site updates
3. Set up rebuild triggers

### Phase 5: Notifications
1. Integrate notification services
   - WhatsApp Business API integration
   - Twilio SMS integration
   - Email service as fallback
2. Implement notification triggers
3. Add notification preferences per member
4. Add notification templates for different event types

## Success Metrics
- Reduced time spent on scheduling
- Increased attendance at rehearsals
- Faster show information updates
- Improved communication efficiency

## Future Considerations
- Mobile app version
- Calendar integration (Google Calendar, iCal)
- Performance analytics
- Practice note sharing

## Data Models

### Database Schema

#### Members Table 