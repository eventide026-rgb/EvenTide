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
import { DollarSign, Ticket, PieChart, Loader2, ArrowUpRight } from 'lucide-react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, collectionGroup } from 'firebase/firestore';
import { 
    Bar, 
    BarChart as ReBarChart, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    Cell
} from 'recharts';

type Show = {
  id: string;
  name: string;
  ownerId: string;
};

type TicketData = {
    id: string;
    tierName: string;
    price: number;
}

const COLORS = ['#4169E1', '#D4AF37', '#60A5FA', '#FDE047', '#1e293b'];

const KPICard = ({
  title,
  value,
  icon: Icon,
  description,
  prefix = ""
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  prefix?: string;
}) => (
  <Card className="border-none shadow-sm bg-muted/30">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      <Icon className="h-4 w-4 text-primary" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{prefix}{value}</div>
      {description && <p className="text-[10px] text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

export function SalesAnalyticsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedShowId, setSelectedShowId] = useState<string | null>(null);

  // 1. Fetch Shows
  const showsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'shows'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: shows, isLoading: isLoadingShows } = useCollection<Show>(showsQuery);

  // 2. Fetch Tickets for selected show
  const ticketsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedShowId) return null;
    return query(collection(firestore, 'shows', selectedShowId, 'tickets'));
  }, [firestore, selectedShowId]);
  const { data: tickets, isLoading: isLoadingTickets } = useCollection<TicketData>(ticketsQuery);

  // 3. Aggregate Stats
  const stats = useMemo(() => {
    if (!tickets) return null;
    const totalRevenue = tickets.reduce((sum, t) => sum + (t.price || 0), 0);
    const count = tickets.length;
    
    const tierBreakdown: Record<string, { value: number, revenue: number }> = {};
    tickets.forEach(t => {
        const name = t.tierName || 'Unknown';
        if (!tierBreakdown[name]) tierBreakdown[name] = { value: 0, revenue: 0 };
        tierBreakdown[name].value += 1;
        tierBreakdown[name].revenue += (t.price || 0);
    });

    return {
        totalRevenue,
        count,
        chartData: Object.entries(tierBreakdown).map(([name, data]) => ({
            name,
            quantity: data.value,
            revenue: data.revenue
        }))
    };
  }, [tickets]);

  if (isLoadingShows) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Show Revenue Monitor</CardTitle>
          <CardDescription>Analyze ticket velocity and financial performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Select onValueChange={setSelectedShowId} value={selectedShowId || ''}>
            <SelectTrigger className="w-full md:w-1/2 rounded-xl">
              <SelectValue placeholder="Select a show" />
            </SelectTrigger>
            <SelectContent>
              {shows?.map((show) => (
                <SelectItem key={show.id} value={show.id}>{show.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedShowId && stats ? (
        <>
            <div className="grid gap-4 md:grid-cols-3">
                <KPICard title="Total Revenue" value={stats.totalRevenue.toLocaleString()} icon={DollarSign} prefix="₦" />
                <KPICard title="Tickets Sold" value={stats.count} icon={Ticket} />
                <KPICard title="Marketplace Reach" value="High" icon={ArrowUpRight} description="Performing above average" />
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
                <Card className="lg:col-span-3 border-none shadow-lg">
                    <CardHeader><CardTitle className="text-lg">Revenue by Tier</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                    {stats.chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </ReBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2 border-none shadow-lg">
                    <CardHeader><CardTitle className="text-lg">Sales Breakdown</CardTitle></CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ReBarChart data={stats.chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="quantity" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                            </ReBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
      ) : selectedShowId ? (
          <div className="flex justify-center p-20"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>
      ) : (
          <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl opacity-50">
              <Ticket className="h-12 w-12 mx-auto mb-4" />
              <p>Select a show to analyze sales performance.</p>
          </div>
      )}
    </div>
  );
}
