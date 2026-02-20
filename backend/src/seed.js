import { query } from './db.js';

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

export async function loadDemoData() {
    console.log('--- Demo Data Generator (SCRUM-51) ---');

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

    const eventResult = await query(
        `INSERT INTO events (event_desc, event_date, event_tax_id, contact_first_name, contact_last_name, contact_email, contact_phone, is_demo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'yes')
         RETURNING *`,
        [desc, eventDateStr, taxId, contactFirst, contactLast, contactEmail, contactPhone]
    );
    const event = eventResult.rows[0];
    const eventId = event.event_id;

    // 2. Generate Bidders (including the contact)
    const bidderIds = [];
    const contactBidderRes = await query(
        `INSERT INTO bidders (event_id, bidder_first_name, bidder_last_name, bidder_email)
         VALUES ($1, $2, $3, $4) RETURNING bidder_id`,
        [eventId, contactFirst, contactLast, contactEmail]
    );
    bidderIds.push(contactBidderRes.rows[0].bidder_id);

    for (let i = 0; i < 9; i++) {
        const f = random(firstNames);
        const l = random(lastNames);
        const res = await query(
            `INSERT INTO bidders (event_id, bidder_first_name, bidder_last_name, bidder_email)
             VALUES ($1, $2, $3, $4) RETURNING bidder_id`,
            [eventId, f, l, `${f.toLowerCase()}.${l.toLowerCase()}${randomInt(1, 999)}@example.com`]
        );
        bidderIds.push(res.rows[0].bidder_id);
    }

    // 3. Generate Items
    const itemIds = [];
    for (let i = 0; i < 15; i++) {
        const type = Math.random() > 0.4 ? 'Not Live' : 'Live';
        const itemDesc = `${random(itemActions)} ${random(itemNouns)}`;
        const itemNotes = random(notesTemplates);

        const res = await query(
            `INSERT INTO items (event_id, item_type, item_desc, item_notes)
             VALUES ($1, $2, $3, $4) RETURNING item_id`,
            [eventId, type, itemDesc, itemNotes]
        );
        itemIds.push(res.rows[0].item_id);
    }

    // 4. Generate Winning Bids
    const winnerCount = randomInt(5, 10);
    const itemsToWin = itemIds.sort(() => 0.5 - Math.random()).slice(0, winnerCount);

    for (const itemId of itemsToWin) {
        const bidderId = random(bidderIds);
        const bid = randomInt(100, 5000);

        await query(
            `INSERT INTO winning_bids (event_id, bidder_id, item_id, winning_bid)
             VALUES ($1, $2, $3, $4)`,
            [eventId, bidderId, itemId, bid]
        );
    }

    return {
        event,
        biddersCount: bidderIds.length,
        itemsCount: itemIds.length,
        winningBidsCount: winnerCount
    };
}
