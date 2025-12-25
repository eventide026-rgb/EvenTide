'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart, DollarSign, PieChart, Ticket } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

const KPICard = ({
  title,
  value,
  icon: Icon,
  unit,
  prefix,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  unit?: string;
  prefix?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {prefix}
        {value.toLocaleString()}
        {unit}
      </div>
    </CardContent>
  </Card>
);

export function SalesAnalyticsPage() {
  // Mock data for demonstration
  const mockSalesData = {
    totalRevenue: 850000,
    ticketsSold: 58,
    sellThroughRate: 72,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Performance</CardTitle>
          <CardDescription>
            Analyze ticket sales and revenue for public, ticketed events.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <KPICard
          title="Total Revenue"
          value={mockSalesData.totalRevenue}
          icon={DollarSign}
          prefix="₦"
        />
        <KPICard
          title="Tickets Sold"
          value={mockSalesData.ticketsSold}
          icon={Ticket}
        />
        <KPICard
          title="Sell-through Rate"
          value={mockSalesData.sellThroughRate}
          icon={PieChart}
          unit="%"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Revenue by Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="w-full h-[300px]" />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Tickets Sold by Tier
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
