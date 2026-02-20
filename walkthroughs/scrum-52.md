# Walkthrough - Automatic Demo Data Purge (scrum-52)

Implemented an automated background agent to clean up demo data to keep the database tidy.

## Features
- **Expiration Logic**: Any event marked with `is_demo = 'yes'` is automatically deleted if its `event_date` is more than 5 days in the past.
- **Cascade Cleanup**: The agent correctly handles foreign key relationships by deleting winning bids, bidders, and items associated with the expired event before removing the event itself.
- **Background Scheduling**: 
    - Runs immediately when the API server starts.
    - Runs every 24 hours while the server is active.

## Implementation Details

### Backend
- **File**: `backend/src/seed.js`
    - Added `purgeDemoData()` function that performes the SQL queries for identification and deletion.
- **File**: `backend/src/index.js`
    - Integrated the purge agent into the server lifecycle using `setInterval`.

## Verification

### Automated Check
1.  **Log Monitoring**: Verified via `docker logs webapp-api-1`.
    - **Initial State**: `No expired demo data found.`
2.  **Simulation**:
    - Manually set a demo event's date to `2020-01-01`.
    - Restarted the API.
    - **Result**: 
        ```
        Purging demo event ID 6: Historical Society Benefit 2026
        ✓ Purged event 6
        Total demo events purged: 1
        ```

### Confirmation
- Verified via `psql` that `event_id 6` and all its children were successfully removed from the database.
