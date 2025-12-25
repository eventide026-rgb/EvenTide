import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuestAnalyticsPage } from '@/components/analytics/guest-analytics-page';
import { SalesAnalyticsPage } from '@/components/analytics/sales-analytics-page';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Event Analytics</h1>
        <p className="text-muted-foreground">
          Gain insights into your event's performance and guest engagement.
        </p>
      </div>
      <Tabs defaultValue="guests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="guests">Guest Analytics</TabsTrigger>
          <TabsTrigger value="sales">Ticket Sales</TabsTrigger>
        </TabsList>
        <TabsContent value="guests">
          <GuestAnalyticsPage />
        </TabsContent>
        <TabsContent value="sales">
          <SalesAnalyticsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
