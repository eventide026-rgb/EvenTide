'use client';

import { useState, useMemo } from 'react';
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
  Users,
  Percent,
  CheckCircle,
  MessageSquare,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import { 
    Bar, 
    BarChart as ReBarChart, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell,
    Pie,
    PieChart as RePieChart,
    Legend
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

type Event = {
  id: string;
  name: string;
  ownerId: string;
  guestLimit?: number;
};

type Guest = {
    id: string;
    rsvpStatus: 'Pending' | 'Accepted' | 'Declined';
    hasCheckedIn: boolean;
    category: string;
}

const COLORS = ['#4169E1', '#D4AF37', '#60A5FA', '#FDE047', '#1e293b'];

const KPICard = ({
  title,
  value,
  icon: Icon,
  description,
  colorClass = "text-primary"
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  colorClass?: string;
}) => (
  <Card className="border-none shadow-sm bg-muted/30">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <Icon className={cn("h-4 w-4", colorClass)} />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-[10px] text-muted-foreground mt-1 font-medium">{description}</p>}
    </CardContent>
  </Card>
);

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

export function GuestAnalyticsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // 1. Fetch Events
  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  // 2. Fetch Guests for Selected Event
  const guestsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'guests'));
  }, [firestore, selectedEventId]);
  const { data: guests, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);

  const selectedEvent = events?.find(e => e.id === selectedEventId);

  // 3. Calculate Real-Time Metrics
  const stats = useMemo(() => {
    if (!guests) return null;
    const total = guests.length;
    const accepted = guests.filter(g => g.rsvpStatus === 'Accepted').length;
    const pending = guests.filter(g => g.rsvpStatus === 'Pending').length;
    const declined = guests.filter(g => g.rsvpStatus === 'Declined').length;
    const checkedIn = guests.filter(g => g.hasCheckedIn).length;
    
    const categories: Record<string, number> = {};
    guests.forEach(g => {
        categories[g.category] = (categories[g.category] || 0) + 1;
    });

    return {
        total,
        accepted,
        pending,
        declined,
        checkedIn,
        rsvpRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
        checkInRate: accepted > 0 ? Math.round((checkedIn / accepted) * 100) : 0,
        categoryData: Object.entries(categories).map(([name, value]) => ({ name, value })),
        rsvpData: [
            { name: 'Accepted', value: accepted },
            { name: 'Pending', value: pending },
            { name: 'Declined', value: declined },
        ]
    };
  }, [guests]);

  if (isLoadingEvents) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Event Selector</CardTitle>
          <CardDescription>Choose a celebration to view live engagement metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
            <SelectTrigger className="w-full md:w-1/2 rounded-xl">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEventId && stats ? (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard title="Total Guests" value={stats.total} icon={Users} description={`Target: ${selectedEvent?.guestLimit || 0}`} />
                <KPICard title="RSVP Rate" value={`${stats.rsvpRate}%`} icon={Percent} description={`${stats.accepted} guests confirmed`} colorClass="text-accent" />
                <KPICard title="Check-in Velocity" value={`${stats.checkInRate}%`} icon={CheckCircle} description={`${stats.checkedIn} arrivals recorded`} colorClass="text-green-500" />
                <KPICard title="Interaction" value={stats.accepted} icon={TrendingUp} description="Confirmed attendance" />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                <Card className="border-none shadow-lg">
                    <CardHeader><CardTitle className="text-lg">RSVP Distribution</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                                <Pie
                                    data={stats.rsvpData}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.rsvpData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36}/>
                            </RePieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                    <CardHeader><CardTitle className="text-lg">Guest Categories</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={stats.categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                                <Tooltip />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {stats.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
      ) : selectedEventId ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>
      ) : (
          <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">Select an event above to load real-time analytics.</p>
          </div>
      )}
    </div>
  );
}
