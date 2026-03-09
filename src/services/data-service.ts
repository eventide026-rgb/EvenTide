
'use server';

/**
 * @fileOverview Centralized data service for server-side fetching.
 * Uses React 'cache' to memoize requests within a single server tick.
 */

import { cache } from 'react';
import { adminDb } from '@/firebase/firebaseAdmin';

export const getVendors = cache(async () => {
  if (!adminDb) return [];
  const snapshot = await adminDb.collection('vendors').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
});

export const getVenues = cache(async () => {
  if (!adminDb) return [];
  const snapshot = await adminDb.collection('venues').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
});

export const getPlannerProfiles = cache(async () => {
  if (!adminDb) return [];
  const snapshot = await adminDb.collection('plannerProfiles').get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
});

export const getEvent = cache(async (eventId: string) => {
  if (!adminDb) return null;
  const docSnap = await adminDb.collection('events').doc(eventId).get();
  if (!docSnap.exists) return null;
  return { id: docSnap.id, ...docSnap.data() };
});

export const getPublicShows = cache(async () => {
  if (!adminDb) return [];
  const snapshot = await adminDb.collection('shows').where('isPublic', '==', true).get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
});
