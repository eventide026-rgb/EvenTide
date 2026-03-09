
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * @fileOverview Safe Firebase Admin SDK Initialization.
 * Verifies environment variables before initialization to prevent runtime crashes.
 */

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

/**
 * Cleans the private key string, handling escaped newlines and potential wrapping quotes.
 */
function formatPrivateKey(key: string | undefined): string | null {
  if (!key) return null;
  // Handle literal newlines and escaped newlines
  let formattedKey = key.replace(/\\n/g, '\n');
  // Remove wrapping quotes if they exist (common in some env managers)
  if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
    formattedKey = formattedKey.substring(1, formattedKey.length - 1);
  }
  return formattedKey;
}

function getAdminApp() {
  if (getApps().length > 0) return getApp();
  
  const formattedKey = formatPrivateKey(privateKey);

  if (projectId && clientEmail && formattedKey) {
    try {
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey: formattedKey,
        } as any),
      });
    } catch (e) {
      console.error("Firebase Admin initialization error:", e);
      return null;
    }
  }
  
  console.warn("Firebase Admin SDK not initialized: Missing or malformed required environment variables (PROJECT_ID, CLIENT_EMAIL, or PRIVATE_KEY).");
  return null;
}

const adminApp = getAdminApp();

// Export adminDb as a null-safe reference or null. 
// Using 'any' allows consumers to attempt method calls, but we should always check if it's truthy.
export const adminDb = adminApp ? getFirestore(adminApp) : null as any;
