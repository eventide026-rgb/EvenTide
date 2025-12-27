
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ROLE_DASHBOARD_MAP } from '@/constants/role-dashboard-map';

export function useAuthHandler(auth: Auth, firestore: Firestore) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      const isNewLogin = sessionStorage.getItem('isNewLogin') === 'true';

      // If there's no user, we don't need to do anything here.
      // Protected routes will handle redirection to the login page.
      if (!user) {
        return;
      }
      
      // If a user is logged in but it's not a new login event, we can skip the logic.
      // This prevents re-running logic on every page refresh for an already authenticated user.
      if(!isNewLogin) {
          return;
      }

      // It's a new login, so clear the flag immediately.
      sessionStorage.removeItem('isNewLogin');
      const loginType = sessionStorage.getItem('loginType');
      sessionStorage.removeItem('loginType');

      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.warn('User document not found. Signing out.');
          await auth.signOut();
          return;
        }

        const userData = userDoc.data();
        const role = userData.role;
        const fullName = `${userData.firstName} ${userData.lastName}`;

        sessionStorage.setItem('userName', fullName);

        // Security check for admin logins
        if (loginType && loginType.includes('Admin') && role !== loginType) {
          console.warn(`Role mismatch: Expected ${loginType}, got ${role}. Signing out.`);
          await auth.signOut();
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'Your account does not have the required admin privileges.',
          });
          return;
        }

        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${fullName}! Redirecting...`,
        });
        
        const destination = ROLE_DASHBOARD_MAP[role] || '/owner-dashboard';

        // Prevent redirect loops
        if (pathname !== destination) {
          router.replace(destination);
        }

      } catch (error) {
        console.error('Error in auth handler:', error);
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'Could not verify user role. Please try logging in again.',
        });
        await auth.signOut();
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router, pathname, toast]);
}
