
'use server';

/**
 * @fileOverview Centralized data service for server-side fetching.
 * Uses React 'cache' to memoize requests within a single server tick.
 * Includes defensive error handling to prevent SSR crashes.
 */

import { cache } from 'react';
import { adminDb } from '@/firebase/firebaseAdmin';

export const getVendors = cache(async () => {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('vendors').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error in getVendors data-service:", error);
    return [];
  }
});

export const getVenues = cache(async () => {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('venues').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error in getVenues data-service:", error);
    return [];
  }
});

export const getPlannerProfiles = cache(async () => {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('plannerProfiles').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error in getPlannerProfiles data-service:", error);
    return [];
  }
});

export const getEvent = cache(async (eventId: string) => {
  try {
    if (!adminDb || !eventId) return null;
    const docSnap = await adminDb.collection('events').doc(eventId).get();
    if (!docSnap.exists) return null;
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error("Error in getEvent data-service:", error);
    return null;
  }
});

export const getPublicShows = cache(async () => {
  try {
    if (!adminDb) return [];
    const snapshot = await adminDb.collection('shows').where('isPublic', '==', true).get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error in getPublicShows data-service:", error);
    return [];
  }
});
