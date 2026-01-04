
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { ROLE_DASHBOARD_MAP } from '@/constants/role-dashboard-map';
import { Loader2 } from 'lucide-react';

type DashboardRedirectorProps = {
  expectedRole: string;
};

/**
 * A client component that enforces role-based access for a specific dashboard layout.
 * It redirects users to their correct dashboard if a role mismatch is detected.
 */
export function DashboardRedirector({ expectedRole }: DashboardRedirectorProps) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't run logic until auth state is resolved
    if (isUserLoading) {
      return;
    }

    // If there's no user, they shouldn't be in a dashboard. Send to login.
    if (!user) {
      router.replace('/login');
      return;
    }

    // Get role from session storage for immediate feedback
    const sessionRole = sessionStorage.getItem('userRole');

    if (sessionRole && sessionRole !== expectedRole) {
      console.warn(`Role mismatch detected. Expected: ${expectedRole}, Found: ${sessionRole}. Redirecting...`);
      const correctDashboard = ROLE_DASHBOARD_MAP[sessionRole] || '/';
      router.replace(correctDashboard);
    }
  }, [user, isUserLoading, expectedRole, router, pathname]);

  // While loading, or if the role matches, render nothing (or a loader)
  // allowing the actual page content to be displayed.
  if (isUserLoading) {
      return (
         <div className="flex h-full min-h-[400px] w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )
  }

  // If role matches, render children (implicitly via layout)
  return null;
}
