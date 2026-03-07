'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PartyPopper, Eye, DollarSign, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic imports for heavy chart components
const EventCreationChart = dynamic(() => import('@/components/admin/event-creation-chart').then(mod => mod.EventCreationChart), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[300px]" /> 
});

const EventTypeChart = dynamic(() => import('@/components/admin/event-type-chart').then(mod => mod.EventTypeChart), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[300px]" /> 
});

export default function SuperAdminDashboardPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => firestore ? collection(firestore, "users") : null, [firestore]);
  const eventsQuery = useMemoFirebase(() => firestore ? collection(firestore, "events") : null, [firestore]);
  const publicEventsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, "shows")) : null, [firestore]);
  const plansQuery = useMemoFirebase(() => firestore ? collection(firestore, "price_plans") : null, [firestore]);

  const { data: users, isLoading: loadingUsers } = useCollection(usersQuery);
  const { data: events, isLoading: loadingEvents } = useCollection(eventsQuery);
  const { data: publicEvents, isLoading: loadingPublicEvents } = useCollection(publicEventsQuery);
  const { data: plans, isLoading: loadingPlans } = useCollection(plansQuery);

  const isLoading = loadingUsers || loadingEvents || loadingPublicEvents || loadingPlans;

  const kpiData = useMemo(() => ({
    totalUsers: users?.length ?? 0,
    totalEvents: events?.length ?? 0,
    publicEvents: publicEvents?.length ?? 0,
    activePlans: plans?.length ?? 0,
  }), [users, events, publicEvents, plans]);

  const KPICard = ({ title, value, icon: Icon, description }: { title: string; value: number; icon: React.ElementType, description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform-wide analytics and overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Users" value={kpiData.totalUsers} icon={Users} description="+15.2% from last month" />
        <KPICard title="Total Events" value={kpiData.totalEvents} icon={PartyPopper} description="+12.1% from last month" />
        <KPICard title="Public Events" value={kpiData.publicEvents} icon={Eye} description="Content for magazine" />
        <KPICard title="Active Price Plans" value={kpiData.activePlans} icon={DollarSign} description="Monetization tiers" />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin hidden" />
                Event Creation Trends
            </CardTitle>
            <CardDescription>New events created in the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="w-full h-[300px]" /> : <EventCreationChart />}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                Event Type Distribution
             </CardTitle>
            <CardDescription>Breakdown of all events by category.</CardDescription>
          </CardHeader>
          <CardContent>
             {isLoading ? <Skeleton className="w-full h-[300px]" /> : <EventTypeChart events={events || []} />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
