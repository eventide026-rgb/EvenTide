
'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDocs, collection, serverTimestamp, writeBatch, query, where, limit } from 'firebase/firestore';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

const adminUsers = [
    { email: 'super@eventide.app', role: 'Super Admin', firstName: 'Super', lastName: 'Admin' },
    { email: 'user.admin@eventide.app', role: 'User Admin', firstName: 'User', lastName: 'Admin' },
    { email: 'content.admin@eventide.app', role: 'Content Admin', firstName: 'Content', lastName: 'Admin' },
    { email: 'editorial.admin@eventide.app', role: 'Editorial Admin', firstName: 'Editorial', lastName: 'Admin' },
];

const sampleMagazineIssues = [
    {
        title: "The Art of the Gathering",
        introduction: "Welcome to our October issue, where we explore the intricate beauty of human connection and the spaces we create to foster it.",
        eventSummaries: [
            { eventName: "Lagos Fashion Week Gala", summary: "A night of glamour and cutting-edge design, the gala set a new standard for style in the city." },
            { eventName: "Abuja Tech Innovators Meetup", summary: "The brightest minds in Nigerian tech came together to share ideas that will shape the future." }
        ],
        advertisement: {
            concept: "A seamless transition from a planner's digital mood board to a stunning real-life event.",
            product: "AI-Powered Mood Board"
        },
        status: "published" as const,
        publishedAt: new Date('2024-10-01T10:00:00Z'),
    },
    {
        title: "Aso-Ebi & Allegiance",
        introduction: "This issue delves into the cultural threads that bind us, celebrating the color, tradition, and community spirit of Nigerian ceremonies.",
        eventSummaries: [
            { eventName: "The Adeleke-Johnson Wedding", summary: "A breathtaking union of two prominent families, showcasing the best of Yoruba tradition." },
            { eventName: "The Rivers Cultural Festival", summary: "A vibrant display of dance, music, and artistry from the heart of the Niger Delta." }
        ],
        advertisement: {
            concept: "Finding the perfect designer for your big day should be a joy, not a hassle.",
            product: "EvenTide Fashion Hub"
        },
        status: "published" as const,
        publishedAt: new Date('2024-09-01T10:00:00Z'),
    }
];

async function seedAdminUsers(auth: any, firestore: any) {
  const defaultPassword = 'password123';
  const usersCollection = collection(firestore, 'users');

  for (const admin of adminUsers) {
    // Check if user already exists in Firestore
    const userQuery = query(usersCollection, where('email', '==', admin.email), limit(1));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      // User does not exist, so create them
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, admin.email, defaultPassword);
        const user = userCredential.user;
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
        // This catch block is for createUserWithEmailAndPassword errors, though less likely now
        console.error(`Error seeding admin user ${admin.email}:`, error);
      }
    } else {
      console.log(`Admin user ${admin.email} already exists. Skipping creation.`);
    }
  }
}

async function seedMagazineIssues(firestore: any) {
    const issuesCollection = collection(firestore, 'magazineIssues');
    const snapshot = await getDocs(query(issuesCollection));
    
    if (snapshot.empty) {
        console.log("No magazine issues found. Seeding database...");
        const batch = writeBatch(firestore);
        sampleMagazineIssues.forEach(issue => {
            const docRef = doc(issuesCollection);
            batch.set(docRef, { ...issue, createdAt: serverTimestamp() });
        });
        await batch.commit();
        console.log("Magazine issues seeded successfully.");
    } else {
        console.log("Magazine issues already exist. Skipping seed.");
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
            await seedMagazineIssues(firestore);
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
