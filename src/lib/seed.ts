
'use server';
// This is a standalone script to seed the database.
// To run, use: npm run seed

import { adminDb } from '../firebase/firebaseAdmin';

async function seed() {
  console.log('Starting database seeding process...');

  const eventRef = adminDb.collection('events').doc('demo-event');

  await eventRef.set({
    ownerId: 'OWNER_UID',
    name: 'Demo Event',
    createdAt: new Date(),
  });

  await eventRef.collection('guests').doc('GUEST_UID').set({
    rsvpStatus: 'pending',
    invitedAt: new Date(),
  });

  console.log('Seeding complete');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
