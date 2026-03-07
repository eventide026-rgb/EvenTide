'use client';

import { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '@/firebase/provider';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  
  // Use raw context to safely check for service availability without throwing
  const context = useContext(FirebaseContext);

  useEffect(() => {
    if (context?.areServicesAvailable) {
      const handleError = (error: FirestorePermissionError) => {
        setError(error);
      };

      errorEmitter.on('permission-error', handleError);

      return () => {
        errorEmitter.off('permission-error', handleError);
      };
    }
  }, [context?.areServicesAvailable]);

  if (error) {
    throw error;
  }

  return null;
}
