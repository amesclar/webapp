# Scrum-18 Walkthrough: Automatic Bidder Number Population

## Overview
This task implemented automatic population of the `bidder_num` column in the `bidders` table. If a `bidder_num` is not provided (NULL) during an insert or update, it is now automatically populated with the next available integer within that specific event, starting with 1.

## Changes

### 1. Database Schema Update
**File:** `db/init.sql`

Implemented a PostgreSQL trigger and function to handle the auto-population logic:

- **Trigger Function (`set_bidder_num`)**: A PL/pgSQL function that checks if `NEW.bidder_num` is NULL. If it is, it calculates the next number by selecting `MAX(bidder_num) + 1` for the given `event_id`.
- **Trigger (`trg_set_bidder_num`)**: A `BEFORE INSERT OR UPDATE` trigger on the `bidders` table that executes the function for each row.

### 2. Migration for Existing Data
Performed a one-time data migration to populate existing rows where `bidder_num` was NULL. The migration followed the same logic as the trigger, ensuring consistency across the database.

## Verifiable Output

The implementation was verified by querying the database after the migration. 

### Before Migration:
Rows with `bidder_num` NULL as seen in `webapp-db-1`:
- Event 3: 2 NULLs
- Event 1: 4 NULLs
- Event 4: 2 NULLs

### After Migration:
The following population occurred:
- **Event 1**: Continued from the existing highest value (12), filling in 13, 14, 15, and 16.
- **Event 3**: Started from 1, filling in 1 and 2.
- **Event 4**: Started from 1, filling in 1 and 2.

### Sample Data Verification:
```sql
-- Querying updated bidder numbers
SELECT event_id, bidder_id, bidder_num FROM bidders ORDER BY event_id, bidder_num;

 event_id | bidder_id | bidder_num 
----------+-----------+------------
        1 |         1 |         12
        1 |         4 |         13
        1 |         7 |         14
        1 |         8 |         15
        1 |         9 |         16
        3 |         2 |          1
        3 |         3 |          2
        4 |         5 |          1
        4 |         6 |          2
```
