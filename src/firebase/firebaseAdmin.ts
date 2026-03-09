
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Safe Firebase Admin SDK Initialization.
 * Verifies environment variables before initialization to prevent runtime crashes.
 */

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function getAdminApp() {
  if (getApps().length > 0) return getApp();
  
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    try {
      return initializeApp({
        credential: cert(serviceAccount as any),
      });
    } catch (e) {
      console.error("Firebase Admin initialization error:", e);
      return null;
    }
  }
  
  console.warn("Firebase Admin SDK not initialized: Missing required environment variables.");
  return null;
}

const adminApp = getAdminApp();

// Export adminDb as a proxy or null-safe object if possible, but here we export the instance
// Routes using adminDb must check for its existence if they want to be fully resilient.
export const adminDb = adminApp ? getFirestore(adminApp) : null as any;
