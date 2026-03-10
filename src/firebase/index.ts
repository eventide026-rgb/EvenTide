'use client';

import app from '@/firebase/config';
import { getApps, getApp, FirebaseApp } from 'firebase/app';
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
    // The default export from config.ts handles the singleton initialization
    firebaseApp = app;
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
