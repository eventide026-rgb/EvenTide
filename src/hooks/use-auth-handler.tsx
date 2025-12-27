
'use client';

import { useEffect, useRef } from 'react';
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
];


export function useAuthHandler(auth: Auth, firestore: Firestore) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const hasRedirected = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      // If there's no user, we don't need to do anything.
      if (!user) {
        hasRedirected.current = false; // Reset on logout
        return;
      }

      // If we have already redirected in this session, do nothing.
      if (hasRedirected.current) {
        return;
      }
      
      const isOnAuthPage = AUTH_PATHS.some(path =>
        pathname === path || pathname.startsWith(path)
      );

      // Only proceed if the user is on an authentication page.
      if (isOnAuthPage) {
        hasRedirected.current = true; // Set the flag to prevent further redirects

        try {
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            console.warn('User document not found. Signing out.');
            await auth.signOut();
            hasRedirected.current = false; // Reset on error
            return;
          }

          const userData = userDoc.data();
          const role = userData.role;
          const fullName = `${userData.firstName} ${userData.lastName}`;

          sessionStorage.setItem('userName', fullName);
          
          const loginType = sessionStorage.getItem('loginType');
          sessionStorage.removeItem('loginType');

          if (loginType && loginType.includes('Admin') && role !== loginType) {
            console.warn(`Role mismatch: Expected ${loginType}, got ${role}. Signing out.`);
            await auth.signOut();
            toast({
              variant: 'destructive',
              title: 'Access Denied',
              description: 'Your account does not have the required admin privileges.',
            });
            hasRedirected.current = false; // Reset on error
            return;
          }

          toast({
            title: 'Login Successful!',
            description: `Welcome back, ${fullName}! Redirecting...`,
          });
          
          const destination = ROLE_DASHBOARD_MAP[role] || '/owner-dashboard';
          router.replace(destination);

        } catch (error) {
          console.error('Error in auth handler:', error);
          toast({
              variant: 'destructive',
              title: 'Authentication Error',
              description: 'Could not verify user role. Please try logging in again.',
          });
          await auth.signOut();
        }
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router, pathname, toast]);
}
