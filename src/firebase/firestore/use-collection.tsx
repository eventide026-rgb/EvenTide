'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null;
  isLoading: boolean;
  error: FirestoreError | Error | null;
}

/**
 * Internal Firestore Query shape.
 * NOTE: Not public API, but required to extract path for diagnostics.
 */
interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
    };
  };
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 *
 * IMPORTANT:
 * - The input MUST be memoized (useMemoFirebase / useMemo)
 * - Passing `null` or `undefined` safely disables the subscription
 */
export function useCollection<T = any>(
  memoizedTargetRefOrQuery:
    | ((CollectionReference<DocumentData> | Query<DocumentData>) & {
        __memo?: boolean;
      })
    | null
    | undefined
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;

  const [data, setData] = useState<ResultItemType[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // 🚫 No ref/query → no subscription
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    /**
     * 🔒 CRITICAL FIX
     * Capture the Firestore path synchronously BEFORE onSnapshot.
     * Prevents root-path permission errors during React teardown.
     */
    const path: string =
      'path' in memoizedTargetRefOrQuery
        ? (memoizedTargetRefOrQuery as CollectionReference).path
        : (memoizedTargetRefOrQuery as unknown as InternalQuery)
            ._query.path.canonicalString();

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as T),
          id: doc.id,
        }));

        setData(results);
        setIsLoading(false);
        setError(null);
      },
      (firestoreError: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // Global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [memoizedTargetRefOrQuery]);

  /**
   * 🧨 Enforce memoization contract (development-time safety)
   */
  if (memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(
      'useCollection input was not memoized. Use useMemoFirebase or useMemo.'
    );
  }

  return { data, isLoading, error };
}
