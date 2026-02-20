import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;
// Use internal docker network host for DB
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/webapp';

const pool = new Pool({
    connectionString,
});

// Random data constants
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas'];
const eventDescs = [
    'Annual Spring Gala', 'Lakeside Charity Auction', 'Winter Wonderland Ball',
    'Community Arts Fundraiser', 'Historical Society Benefit', 'Youth Sports Banquet',
    'Animal Shelter Silent Auction', 'Local Hospital Fundraiser'
];
const itemActions = ['Vintage', 'Signed', 'Rare', 'Luxury', 'Handmade', 'Exclusive', 'Gourmet', 'Limited Edition', 'One-of-a-kind'];
const itemNouns = ['Guitar', 'Watch', 'Painting', 'Bottle of Wine', 'Dinner for Two', 'Vacation Package', 'Sculpture', 'Jewelry Set', 'Gift Basket', 'Classic Car'];
const notesTemplates = [
    'Donated by a local business.', 'Item is in pristine condition.', 'Includes a certificate of authenticity.',
    'Perfect for collectors.', 'Minimum bid required.', 'A highlight of our collection.'
];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
    console.log('--- Demo Data Generator (SCRUM-50) ---');

    try {
        // 1. Generate Event Data
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + 14);
        const eventDateStr = eventDate.toISOString().split('T')[0];

        const contactFirst = random(firstNames);
        const contactLast = random(lastNames);
        const contactEmail = `${contactFirst.toLowerCase()}.${contactLast.toLowerCase()}@example.com`;
        const contactPhone = `555-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
        const taxId = randomInt(10000000, 99999999).toString();
        const desc = `${random(eventDescs)} ${new Date().getFullYear()}`;

        console.log(`Creating Event: ${desc}`);
        const eventResult = await pool.query(
            `INSERT INTO events (event_desc, event_date, event_tax_id, contact_first_name, contact_last_name, contact_email, contact_phone, is_demo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'yes')
             RETURNING event_id`,
            [desc, eventDateStr, taxId, contactFirst, contactLast, contactEmail, contactPhone]
        );
        const eventId = eventResult.rows[0].event_id;
        console.log(`✓ Event created (ID: ${eventId})`);

        // 2. Generate Bidders (including the contact)
        const bidderIds = [];

        // Requirement: contact info random but included in bidders
        console.log(`Adding Contact as Bidder: ${contactFirst} ${contactLast}`);
        const contactBidderRes = await pool.query(
            `INSERT INTO bidders (event_id, bidder_first_name, bidder_last_name, bidder_email)
             VALUES ($1, $2, $3, $4) RETURNING bidder_id`,
            [eventId, contactFirst, contactLast, contactEmail]
        );
        bidderIds.push(contactBidderRes.rows[0].bidder_id);

        for (let i = 0; i < 9; i++) {
            const f = random(firstNames);
            const l = random(lastNames);
            const res = await pool.query(
                `INSERT INTO bidders (event_id, bidder_first_name, bidder_last_name, bidder_email)
                 VALUES ($1, $2, $3, $4) RETURNING bidder_id`,
                [eventId, f, l, `${f.toLowerCase()}.${l.toLowerCase()}${randomInt(1, 999)}@example.com`]
            );
            bidderIds.push(res.rows[0].bidder_id);
        }
        console.log(`✓ ${bidderIds.length} Bidders created`);

        // 3. Generate Items
        const itemIds = [];
        for (let i = 0; i < 15; i++) {
            const type = Math.random() > 0.4 ? 'Not Live' : 'Live';
            const itemDesc = `${random(itemActions)} ${random(itemNouns)}`;
            const itemNotes = random(notesTemplates);

            const res = await pool.query(
                `INSERT INTO items (event_id, item_type, item_desc, item_notes)
                 VALUES ($1, $2, $3, $4) RETURNING item_id`,
                [eventId, type, itemDesc, itemNotes]
            );
            itemIds.push(res.rows[0].item_id);
        }
        console.log(`✓ ${itemIds.length} Items created`);

        // 4. Generate Winning Bids
        // Select a subset of items to have winning bids
        const winnerCount = randomInt(5, 10);
        const itemsToWin = itemIds.sort(() => 0.5 - Math.random()).slice(0, winnerCount);

        for (const itemId of itemsToWin) {
            const bidderId = random(bidderIds);
            const bid = randomInt(100, 5000);

            await pool.query(
                `INSERT INTO winning_bids (event_id, bidder_id, item_id, winning_bid)
                 VALUES ($1, $2, $3, $4)`,
                [eventId, bidderId, itemId, bid]
            );
        }
        console.log(`✓ ${winnerCount} Winning Bids created`);

        console.log('\n--- Seeding Complete Successfully ---');
        console.log(`Event Locator can be found in the UI for Event ID: ${eventId}`);

    } catch (err) {
        console.error('Error during seeding:', err);
    } finally {
        await pool.end();
    }
}

seed();
