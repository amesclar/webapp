# Walkthrough - User Dashboard Events Button

Added an "Events" management option to the user dashboard, allowing users to update specific event details while maintaining restricted access compared to administrators.

## Changes

### Frontend
- **New Component**: `frontend/src/app/events/user-event-form.component.ts`
    - Implements the event update page for users.
    - Fields: Event Locator (Read-only), Description, Date, Tax ID, and Contact fields (First Name, Last Name, Email, Phone).
    - Includes Save, Delete, and Back functionality.
    - Visibility/Updateability strictly follows the requirements (ID hidden, Locator read-only, others editable).
- **Routing**: `frontend/src/app/app.routes.ts`
    - Added `/event-update` route pointing to `UserEventFormComponent`.
- **User Dashboard**: `frontend/src/app/user-dashboard.component.ts`
    - Added an "Events" card to the main grid that links to the update page with the current event's locator.

## Verification Results

### UI/UX
- "Events" button appears alongside "Bidders", "Items", and "Winning Bids" on the user dashboard.
- Clicking "Events" opens a focused update form for the current event.
- Changes made in the user event form are correctly persisted via the API.
- Back button correctly returns the user to the event dashboard.
