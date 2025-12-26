'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 * This component now safely waits for the Firebase context to be ready.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  
  // Safely get the firebase context. This hook will throw if used outside the provider.
  // We can use this to ensure our listener is only active when firebase is ready.
  const firebaseContext = useFirebase();

  useEffect(() => {
    // Only set up the listener if the firebase services are actually available.
    if (firebaseContext.areServicesAvailable) {
      const handleError = (error: FirestorePermissionError) => {
        // Set error in state to trigger a re-render, which will then throw the error.
        setError(error);
      };

      // Subscribe to the global error event
      errorEmitter.on('permission-error', handleError);

      // Clean up the subscription when the component unmounts
      return () => {
        errorEmitter.off('permission-error', handleError);
      };
    }
  }, [firebaseContext.areServicesAvailable]); // Re-run the effect if Firebase services become available.

  // If an error has been caught and set in state, throw it.
  // Next.js error boundaries will catch this.
  if (error) {
    throw error;
  }

  // This component renders nothing to the DOM.
  return null;
}
