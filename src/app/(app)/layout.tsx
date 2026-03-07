
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * @fileOverview Legacy App Layout Redirector.
 * This ensures any remaining traffic to /dashboard or /(app) routes
 * is correctly routed to the new role-based dashboard system.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect from the generic app layout to the specific owner dashboard
    // The AuthRedirector in the root layout will handle final refined routing.
    router.replace('/owner');
  }, [router]);

  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center">
      <p className="text-muted-foreground animate-pulse font-headline">Redirecting to your workspace...</p>
    </div>
  );
}
