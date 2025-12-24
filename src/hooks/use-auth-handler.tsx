
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Auth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, Firestore } from 'firebase/firestore';

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  Owner: '/dashboard',
  Planner: '/dashboard',
  Hotelier: '/hotelier-dashboard',
  'Hall Owner': '/hall-owner-dashboard',
  // Add other roles and their corresponding dashboards here
  // e.g., 'Security': '/security-dashboard',
  'Super Admin': '/admin/super',
  'User Admin': '/admin/users',
  'Content Admin': '/admin/content',
};

export function useAuthHandler(auth: Auth, firestore: Firestore) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const isNewLogin = sessionStorage.getItem('isNewLogin') === 'true';

      if (user && isNewLogin) {
        // Clear the flag immediately to prevent re-redirection on refresh
        sessionStorage.removeItem('isNewLogin');

        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;
            const destination = ROLE_DASHBOARD_MAP[role] || '/dashboard'; // Default to a general dashboard
            router.push(destination);
          } else {
            // Handle case where user document doesn't exist, maybe redirect to a profile setup page
            console.warn("User document not found for new login. Redirecting to default dashboard.");
            router.push('/dashboard');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Handle error, e.g., by redirecting to a generic error page or default dashboard
          router.push('/dashboard');
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore, router]);
}
