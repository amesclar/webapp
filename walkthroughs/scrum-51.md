# Walkthrough - Load Demo Data via URL (scrum-51)

Implemented a feature to automatically load a complete set of demo data by navigating to a specific URL.

## Features
- **URL Trigger**: Navigating to `/load_demo_data` in the browser triggers the seeding process.
- **Random Generation**: Uses a new `seed` module in the backend to generate:
    - 1 Random Event (14 days in the future, marked as `is_demo`).
    - 10 Bidders (including the event contact).
    - 15 Items (Live/Not Live mix).
    - 5-10 Winning Bids.
- **Visual Feedback**: A new frontend component shows the progress and statistics of the loaded data.

## Implementation Details

### Backend
- **File**: `backend/src/seed.js`
    - Created a new module containing the library of random names, descriptions, and logic to populate the database.
- **File**: `backend/src/app.js`
    - Added `POST /load_demo_data` route that calls the seed module.

### Frontend
- **File**: `frontend/src/app/api.service.ts`
    - Added `loadDemoData()` method to communicate with the new backend endpoint.
- **File**: `frontend/src/app/load-demo-data.component.ts`
    - Created a standalone component with a loading spinner and success state showing the generated stats.
- **File**: `frontend/src/app/app.routes.ts`
    - Registered the `/load_demo_data` route.

## Verification

### Automated Check
1.  **Backend Route**: Verified via `curl -X POST http://localhost:3000/load_demo_data`.
    - **Result**: `{"event":{...},"biddersCount":10,"itemsCount":15,"winningBidsCount":6}`.

### Manual Verification
1.  Navigate to `http://localhost:4200/load_demo_data`.
2.  Observed the loading state followed by the success screen.
3.  Clicking "Manage This Event" navigated to the new event's dashboard.
4.  Verified the event appears in the Admin Dashboard with the "Demo" badge.
