
'use client';

import dynamic from 'next/dynamic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const GuestAnalyticsPage = dynamic(() => import('@/components/analytics/guest-analytics-page').then(mod => mod.GuestAnalyticsPage), {
  ssr: false,
  loading: () => <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Event Analytics</h1>
        <p className="text-muted-foreground">
          Gain insights into your event's performance and guest engagement.
        </p>
      </div>
      <GuestAnalyticsPage />
    </div>
  );
}
