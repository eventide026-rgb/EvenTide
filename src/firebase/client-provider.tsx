'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

const adminUsers = [
    { email: 'super@eventide.app', role: 'Super Admin', firstName: 'Super', lastName: 'Admin' },
    { email: 'user.admin@eventide.app', role: 'User Admin', firstName: 'User', lastName: 'Admin' },
    { email: 'content.admin@eventide.app', role: 'Content Admin', firstName: 'Content', lastName: 'Admin' },
    { email: 'editorial.admin@eventide.app', role: 'Editorial Admin', firstName: 'Editorial', lastName: 'Admin' },
];

async function seedAdminUsers(auth: any, firestore: any) {
  const defaultPassword = 'password123'; // Use a secure, known default password

  for (const admin of adminUsers) {
    // We can't directly query users by email on the client-side without admin SDKs.
    // A common workaround for seeding is to attempt creation and catch the 'already-exists' error.
    try {
      // Step 1: Attempt to create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, admin.email, defaultPassword);
      const user = userCredential.user;

      // Step 2: If creation is successful, create the user document in Firestore
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        email: admin.email,
        role: admin.role,
        firstName: admin.firstName,
        lastName: admin.lastName,
        createdAt: serverTimestamp(),
      });
      console.log(`Created admin user: ${admin.email}`);
      
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // This is expected if the user already exists. We can ignore this error.
        console.log(`Admin user ${admin.email} already exists.`);
      } else {
        // Log other unexpected errors
        console.error(`Error seeding admin user ${admin.email}:`, error);
      }
    }
  }
}


export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []); 

  useEffect(() => {
    const seedData = async () => {
        if (process.env.NODE_ENV === 'development') { // Only run seeding in development
            const { auth, firestore } = firebaseServices;
            await seedAdminUsers(auth, firestore);
        }
    };
    seedData();
  }, [firebaseServices]);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
