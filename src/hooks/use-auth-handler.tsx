
'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Auth, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, Firestore } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { ROLE_DASHBOARD_MAP } from '@/constants/role-dashboard-map';

export function useAuthHandler(auth: Auth, firestore: Firestore) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isHandlingAuth = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      // If auth state is being handled, or no user, exit early.
      if (isHandlingAuth.current || !user) {
        return;
      }

      const isNewLogin = sessionStorage.getItem('isNewLogin') === 'true';

      // This is the crucial check: If it's not a new login, we don't need to do anything.
      // The user is just loading a page and is already authenticated.
      if (!isNewLogin) {
        return;
      }

      // We have a new login event, so we start the handling process.
      isHandlingAuth.current = true;
      sessionStorage.removeItem('isNewLogin');
      const loginType = sessionStorage.getItem('loginType');
      sessionStorage.removeItem('loginType');

      try {
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          console.warn('User document not found. Signing out.');
          await auth.signOut();
          isHandlingAuth.current = false;
          return;
        }

        const userData = userDoc.data();
        const role = userData.role;
        const fullName = `${userData.firstName} ${userData.lastName}`;

        sessionStorage.setItem('userName', fullName);

        if (loginType && loginType.includes('Admin') && role !== loginType) {
          console.warn(`Role mismatch: Expected ${loginType}, got ${role}. Signing out.`);
          await auth.signOut();
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'Your account does not have the required admin privileges.',
          });
          isHandlingAuth.current = false;
          return;
        }

        toast({
          title: 'Login Successful!',
          description: `Welcome back, ${fullName}! Redirecting...`,
        });
        
        const destination = ROLE_DASHBOARD_MAP[role] || '/owner-dashboard';

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
      } finally {
        // Ensure we always reset the flag, even if errors occur.
        isHandlingAuth.current = false;
      }
    });

    return () => unsubscribe();
  }, [auth, firestore, router, pathname, toast]);
}
