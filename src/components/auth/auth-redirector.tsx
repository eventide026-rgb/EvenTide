
'use client';

import { useAuth, useFirestore } from '@/firebase';
import { useAuthHandler } from '@/hooks/use-auth-handler';

/**
 * This is a client-side only component that handles the initial authentication check and redirection.
 * It's designed to be used once in the root layout.
 */
export function AuthRedirector() {
  const auth = useAuth();
  const firestore = useFirestore();

  // The useAuthHandler hook contains the logic for redirecting after login.
  useAuthHandler(auth, firestore);

  // This component renders nothing to the DOM.
  return null;
}
