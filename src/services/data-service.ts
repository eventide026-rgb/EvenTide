
'use server';

/**
 * @fileOverview Centralized data service for server-side fetching.
 * Uses React 'cache' to memoize requests within a single server tick.
 */

import { cache } from 'react';
import { adminDb } from '@/firebase/firebaseAdmin';

export const getVendors = cache(async () => {
  const snapshot = await adminDb.collection('vendors').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const getVenues = cache(async () => {
  const snapshot = await adminDb.collection('venues').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const getPlannerProfiles = cache(async () => {
  const snapshot = await adminDb.collection('plannerProfiles').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

export const getEvent = cache(async (eventId: string) => {
  const doc = await adminDb.collection('events').doc(eventId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
});

export const getPublicShows = cache(async () => {
  const snapshot = await adminDb.collection('shows').where('isPublic', '==', true).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
