
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Safe Firebase Admin SDK Initialization.
 * Verifies environment variables before initialization to prevent runtime crashes.
 */

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

function getAdminApp() {
  if (getApps().length > 0) return getApp();
  
  if (projectId && clientEmail && privateKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        } as any),
      });
    } catch (e) {
      console.error("Firebase Admin initialization error:", e);
      return null;
    }
  }
  
  console.warn("Firebase Admin SDK not initialized: Missing required environment variables (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY).");
  return null;
}

const adminApp = getAdminApp();

// Export adminDb as a proxy or null-safe object if possible
export const adminDb = adminApp ? getFirestore(adminApp) : null as any;
