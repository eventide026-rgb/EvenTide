'use client';

import app from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Resilient Firebase SDK Initialization.
 * Ensures the app doesn't crash during build time or SSR if config is missing.
 */
export function initializeFirebase() {
  let firebaseApp: FirebaseApp | null = null;

  if (getApps().length > 0) {
    firebaseApp = getApp();
  } else {
    try {
      // Only call initializeApp() without arguments if in an environment that supports it (like Firebase App Hosting)
      // otherwise fallback to our defined config.
      if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        firebaseApp = app;
      }
    } catch (e) {
      console.warn("Firebase app initialization skipped or failed.");
    }
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp | null) {
  // Return null placeholders if the app failed to initialize
  if (!firebaseApp || !firebaseApp.options.apiKey || firebaseApp.options.apiKey === 'undefined') {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }
  
  try {
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (error) {
    console.warn("Firebase SDK attachment failed:", error);
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
