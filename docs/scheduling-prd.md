# Member Availability Management Feature PRD

## Overview
A system to collect, manage, and utilize member availability information for an improv team, facilitating the scheduling of shows, rehearsals, and other events.

## Business Goals
- Streamline the scheduling process for improv team activities
- Reduce scheduling conflicts and last-minute availability issues
- Improve attendance rates for rehearsals and shows
- Enable better advance planning for quarterly schedules

## User Stories

### Primary User: Team Members
- As a team member, I want to set my availability separately for morning rehearsals and evening shows
- As a team member, I want to set priority levels for my available time slots
- As a team member, I want to update my availability for an entire quarter at once
- As a team member, I want to modify my availability if circumstances change
- As a team member, I want to see other team members' availability
- As a team member, I want to see my current availability settings

### Secondary Users: Team Managers and Admins
- As a manager/admin, I want to see all team members' availability in one view
- As a manager/admin, I want to send availability update requests to team members
- As a manager/admin, I want to track who has/hasn't submitted their availability
- As a manager/admin, I want to export availability data for planning purposes

## Functional Requirements

### Availability Input Interface
1. Calendar Selection
   - Quarter-based calendar view
   - Separate morning (rehearsal) and evening (show) availability toggles for each day
   - Priority level selection for each available time slot
   - Visual distinction between morning and evening slots

2. Availability States
For each time slot (morning and evening):
   - Available (with priority levels: High, Medium, Low)
   - Unavailable

3. Bulk Selection Tools
   - Select/deselect multiple days
   - Apply morning/evening availability separately
   - Clear all selections
   - Set priority level for multiple selected time slots

### Data Management
1. Storage Requirements
   - Member ID
   - Date
   - Morning availability status and priority
   - Evening availability status and priority
   - Last updated timestamp
   - Notes (optional)

2. Updates and Modifications
   - Ability to modify individual time slots
   - Batch update capability
   - Change history logging

### Manager/Admin Features
1. Availability Collection
   - Quarterly availability request automation
   - Weekly email notifications for pending updates
   - Reminder system for non-respondents

2. Reporting
   - Team availability overview
   - Individual member availability views
   - Export functionality (CSV/PDF)
   - Conflict identification

## Authorization Levels
1. Admin
   - Full system access
   - System configuration
   - User management

2. Manager
   - All availability management features
   - Send availability requests
   - View all member availability
   - Generate reports
   - Export data

3. Member
   - Input personal availability
   - View other members' availability
   - Update own availability
   - Receive notifications

## Technical Requirements

### Performance
- Calendar interface must load within 2 seconds
- Bulk selection operations must complete within 1 second
- Support for at least 50 concurrent users

### Security
- Role-based access control (Admin, Manager, Member)
- Data encryption at rest
- Secure authentication

### Integration Requirements
- Email notification system
- Calendar export functionality (iCal format)
- API endpoints for external system integration

## UI/UX Requirements

### Calendar Interface
1. Visual Design
   - Simple toggle for full day availability
   - Priority level indicators (color coding)
   - Responsive design for mobile/desktop
   - Quick bulk selection tools

2. User Feedback
   - Clear success/error messages
   - Progress indication for bulk operations
   - Unsaved changes warnings

## Success Metrics
- 90% of members submitting availability within one week of request
- 50% reduction in scheduling conflicts
- 80% user satisfaction rate with the interface
- 95% system uptime

## Future Considerations
- Integration with popular calendar applications
- Automatic schedule generation based on availability
- Mobile app development

## Implementation Details

### Authentication & Authorization
- Using existing Supabase Auth setup with role-based access control
- Roles: admin, manager, member (already implemented)
- All authenticated users have corresponding member records

### Calendar Interface
Selected Solution: react-big-calendar
- Reasons for selection:
  - Built-in support for month/week views
  - Customizable event rendering for morning/evening slots
  - Good balance of features vs complexity
  - Strong TypeScript support
- Customizations needed:
  - Custom event rendering for morning/evening availability
  - Priority level indicators (color coding)
  - Hover states for quick actions
  - Responsive design adaptations

### Data Model Clarification
1. Availability Data (`availability` table)
   - Represents actual member availability
   - Stores morning/evening preferences with priority levels
   - Links to individual member records

2. Availability Requests (`availability_requests` table)
   - Manages quarterly availability collection process
   - Tracks who has/hasn't submitted availability
   - Does not store actual availability data

### Routing Structure
Following existing app patterns:
```
/availability
├── page.tsx                 # Personal availability view/edit
├── requests
│   ├── page.tsx            # List all requests (admin/manager)
│   └── [id]
│       └── page.tsx        # Individual request details
└── team
    └── page.tsx            # Team-wide availability view
```

### Implementation Phases

#### Phase 1: Core Availability Management
1. Personal Availability
   - Calendar interface for viewing/editing
   - Morning/evening slot management
   - Priority level selection
   
2. Admin Features
   - Create quarterly availability requests
   - View submission status
   - Basic team availability overview

3. Team View
   - Calendar view of all member availability
   - Filtering options
   - Basic conflict detection

#### Phase 2: Advanced Features
1. Notification System
   - Email notifications for new requests
   - Reminders for pending submissions
   - Updates for changes affecting team

2. Enhanced Editing
   - Bulk editing capabilities
   - Pattern-based availability setting
   - Copy previous availability

3. Reporting & Analytics
   - Availability trends
   - Conflict reports
   - Export functionality

#### Phase 3: Integration & Optimization
1. Show Planning Integration
   - Link availability to show scheduling
   - Automatic conflict detection
   - Suggested cast recommendations

2. Performance Optimization
   - Calendar view optimization
   - Data caching strategy
   - Bulk operation improvements

### Success Metrics
- 90% of members submitting availability within one week of request
- 50% reduction in scheduling conflicts
- 80% user satisfaction rate with the interface
- 95% system uptime