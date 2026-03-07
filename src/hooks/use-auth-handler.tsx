
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ROLE_DASHBOARD_MAP } from '@/constants/role-dashboard-map';

const AUTH_PATHS = [
  '/login',
  '/signup',
  '/guest-login',
  '/security-login',
  '/Super-Admin-login',
  '/User-Admin-login',
  '/Content-Admin-login',
  '/editorial-admin-login',
  '/forgot-password',
];

/**
 * Global Auth Handler Hook.
 * Manages post-login redirection and synchronizes user role with cookies for Middleware.
 */
export function useAuthHandler(auth: Auth, firestore: Firestore) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (!user) {
        // User signed out: Clear session storage and cookies
        sessionStorage.removeItem('userRole');
        sessionStorage.removeItem('userName');
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        return;
      }

      const isNewLogin = sessionStorage.getItem('isNewLogin') === 'true';
      const isOnAuthPage = AUTH_PATHS.some(path => pathname.startsWith(path));

      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // If the doc doesn't exist yet (e.g. signup in progress), we wait.
          if (!user.isAnonymous) {
             console.warn('User document not found for non-anonymous UID:', user.uid);
          }
          return;
        }

        const userData = userDoc.data();
        const role = userData.role;
        const firstName = userData.firstName || '';

        // Synchronize with Client Session Storage
        sessionStorage.setItem('userRole', role);
        sessionStorage.setItem('userName', firstName);

        // Synchronize with Cookies for Middleware (Edge)
        // Use a simple cookie for middleware visibility
        document.cookie = `userRole=${role}; path=/; max-age=604800; SameSite=Lax`;

        // 1. Handle new logins from an auth page
        if (isNewLogin && isOnAuthPage) {
          sessionStorage.removeItem('isNewLogin');
          toast({
            title: "Login Successful!",
            description: `Welcome back, ${firstName}! Redirecting...`,
          });
          const destination = ROLE_DASHBOARD_MAP[role] || '/';
          router.replace(destination);
          return;
        }

        // 2. If an authenticated user lands on an auth page, redirect them away to their dashboard.
        const correctDashboard = ROLE_DASHBOARD_MAP[role];
        if (isOnAuthPage && correctDashboard) {
            router.replace(correctDashboard);
            return;
        }
        
      } catch (error) {
        console.error('Error in auth handler:', error);
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'Could not verify user data. Please try logging in again.',
        });
        await auth.signOut();
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router, pathname, toast]);
}
