
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Auth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, Firestore } from 'firebase/firestore';

const ROLE_DASHBOARD_MAP: Record<string, string> = {
  Owner: '/dashboard',
  Planner: '/dashboard',
  Hotelier: '/hotelier-dashboard',
  'Hall Owner': '/hall-owner-dashboard',
  'Car Hire Service': '/car-hire-dashboard',
  'Super Admin': '/admin/super/dashboard',
  'User Admin': '/admin/user/dashboard',
  'Content Admin': '/admin/content/dashboard',
  'Editorial Admin': '/admin/editorial/dashboard',
};

const ADMIN_LOGIN_PATHS: Record<string, string> = {
    'Super Admin': '/super-admin-login',
    'User Admin': '/user-admin-login',
    'Content Admin': '/content-admin-login',
    'Editorial Admin': '/editorial-admin-login',
}

export function useAuthHandler(auth: Auth, firestore: Firestore) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const isNewLogin = sessionStorage.getItem('isNewLogin') === 'true';
      const loginType = sessionStorage.getItem('loginType');

      if (user && isNewLogin) {
        // Clear the flags immediately to prevent re-redirection on refresh
        sessionStorage.removeItem('isNewLogin');
        sessionStorage.removeItem('loginType');

        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;

            // Security check for admin logins
            if (loginType && loginType.includes('Admin')) {
                if (role !== loginType) {
                    // If roles don't match for an admin login attempt, sign out and stay
                    await auth.signOut();
                    console.warn(`Role mismatch: Expected ${loginType}, got ${role}.`);
                    return; // Stop further processing
                }
            }

            const destination = ROLE_DASHBOARD_MAP[role] || '/dashboard'; // Default to a general dashboard
            router.push(destination);
          } else {
            console.warn("User document not found for new login. Redirecting to default dashboard.");
            router.push('/dashboard');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          router.push('/dashboard');
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth, firestore, router]);
}
