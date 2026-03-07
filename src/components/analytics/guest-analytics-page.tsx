
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  LineChart,
  PieChart,
  Activity,
  Users,
  Percent,
  CheckCircle,
  MessageSquare,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data - in a real app, this would come from Firestore queries
const mockEvents = [
  { id: 'evt-1', name: "Adebayo & Funke's Wedding" },
  { id: 'evt-2', name: 'Lagos Tech Summit 2024' },
];

const mockAnalytics = {
  'evt-1': {
    totalGuests: 250,
    rsvpRate: 83,
    checkInRate: 95,
    feedbackCount: 150,
  },
  'evt-2': {
    totalGuests: 450,
    rsvpRate: 90,
    checkInRate: 88,
    feedbackCount: 320,
  },
};

const KPICard = ({
  title,
  value,
  icon: Icon,
  unit,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  unit?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {value}
        {unit}
      </div>
    </CardContent>
  </Card>
);

export function GuestAnalyticsPage() {
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[0].id);

  const analyticsData = mockAnalytics[selectedEvent as keyof typeof mockAnalytics];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Guest Engagement</CardTitle>
          <CardDescription>
            Analyze attendee data for a specific event.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedEvent} onValueChange={setSelectedEvent}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {mockEvents.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Guests"
          value={analyticsData.totalGuests}
          icon={Users}
        />
        <KPICard
          title="RSVP Rate"
          value={analyticsData.rsvpRate}
          icon={Percent}
          unit="%"
        />
        <KPICard
          title="Check-in Rate"
          value={analyticsData.checkInRate}
          icon={CheckCircle}
          unit="%"
        />
        <KPICard
          title="Feedback Responses"
          value={analyticsData.feedbackCount}
          icon={MessageSquare}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              RSVP Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[300px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Guest Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[300px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Check-ins Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[300px]" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Feedback Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[300px]" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
