
import { Suspense } from 'react';
import { OwnerDashboardClient } from '@/components/dashboard/owner-dashboard-client';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Owner Dashboard (Server Component)
 * Fetches high-level structure and passes control to the optimized client component.
 */
export default async function OwnerDashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-balance">Owner Dashboard</h1>
          <p className="text-muted-foreground">Manage your event portfolio from one command center.</p>
        </div>
      </header>

      <Suspense fallback={<div className="flex h-96 items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
        <OwnerDashboardClient />
      </Suspense>
    </div>
  );
}
