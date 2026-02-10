# Walkthrough - Admin Event Entry Contact Columns

Added contact information columns to the Event Management system to allow administrators to track primary contacts for each event.

## Changes

### Database
- **File**: `db/init.sql`
- Added columns to `events` table:
    - `contact_first_name` (VARCHAR 100)
    - `contact_last_name` (VARCHAR 100)
    - `contact_email` (VARCHAR 100)
    - `contact_phone` (VARCHAR 100)
- Added `chk_events_email_format` constraint to validate `contact_email`.
- Applied via `ALTER TABLE` to the running `webapp-db-1` container.

### Backend
- **File**: `backend/src/validate.js`
    - Updated `EventCreate` and `EventUpdate` Zod schemas to include contact fields.
    - Added email validation for `contact_email`.
- **File**: `backend/src/app.js`
    - Updated `POST /events` and `PUT /events/:id` to include contact fields in SQL queries.

### Frontend
- **File**: `frontend/src/app/api.types.ts`
    - Added contact fields to `EventRow` type.
- **File**: `frontend/src/app/api.service.ts`
    - Updated `createEvent` and `updateEvent` payload types.
- **File**: `frontend/src/app/events/event-form.component.ts`
    - Added form inputs for contact fields.
    - Updated the events table to display contact columns.
    - Enabled sorting for new contact columns.
    - Updated component logic (`save`, `select`, `cancel`) to handle new fields.

## Verification Results

### Automated Tests
- Database schema updated successfully.
- Backend validation ensures contact email format is valid.
- Frontend form correctly captures and sends data to the API.

### Manual Verification
1. Navigate to **Event Management**.
2. Create/Update an event with contact information.
3. Verify contact details appear in the event list.
4. Verify email validation triggers error on invalid formats.
