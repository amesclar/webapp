# Demo Data Seeder

This tool generates a complete set of random demo data for testing. 

## Generated Data (per run)
- **1 Event**: Set as `is_demo = 'yes'`, with a date 14 days in the future.
- **10 Bidders**: Including the event contact person as one of the bidders.
- **15 Items**: A random mix of 'Live' and 'Not Live' types.
- **5-10 Winning Bids**: Randomly assigned from the pool of items and bidders.

## Usage

Run the tool using Docker:

```bash
docker run --rm --network webapp_default -v $(pwd):/app -w /app/scripts/seed-demo -e DATABASE_URL=postgres://postgres:postgres@db:5432/webapp node:20-alpine node index.js
```

## Environment Requirements
- The tool reads `.env` but overrides `DATABASE_URL` if passed as an environment variable (recommended for Docker network consistency).
- Assumes the database is accessible at `db:5432` on the `webapp_default` network.
