import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";

export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Defensive initialization to prevent crashes if environment variables are missing 
 * during SSR or the build phase.
 */
const app = (() => {
  if (typeof window === 'undefined') return null;
  
  if (getApps().length > 0) {
    return getApp();
  }
  
  // Only attempt initialization if a valid-looking API key exists
  // We check for 'undefined' string because Next.js sometimes passes 
  // literal 'undefined' if the env var is missing during build.
  const isConfigValid = 
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== 'undefined' && 
    firebaseConfig.apiKey !== '';

  if (isConfigValid) {
    return initializeApp(firebaseConfig);
  }
  
  return null;
})();

export default app;
