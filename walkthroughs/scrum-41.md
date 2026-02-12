# Scrum-41 Walkthrough: Disable Delete Button on User Event Edit Page

## Overview
This task involved disabling the "Delete" button on the event edit page accessed via the user dashboard (`/event-update`). This prevents non-admin users from accidentally or intentionally deleting an event.

## Changes

### 1. User Event Form Component
**File:** `frontend/src/app/events/user-event-form.component.ts`

-   Modified the "Delete" button in the template to be permanently `disabled`.
-   Added a `title` attribute to provide a tooltip explaining that deletion is disabled for users.

```html
<form (submit)="confirmDelete($event)" style="display: inline;">
  <button type="submit" class="btn-danger" disabled title="Delete disabled for users">Delete</button>
</form>
```

## Verifiable Output
Navigate to an event's user dashboard and click on the "Events" card to go to the "Event Details" page. The "Delete" button should now be greyed out and unclickable.
