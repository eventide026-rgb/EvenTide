import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { GuestAnalyticsPage } from '@/components/analytics/guest-analytics-page';

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
