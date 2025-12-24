
'use client';

import { useMemo } from 'react';
import { Pie, PieChart } from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';

type Event = {
    eventType?: string;
    [key: string]: any;
}

type EventTypeChartProps = {
    events: Event[];
}

const initialChartData = [
  { eventType: 'Wedding', count: 0, fill: 'var(--color-wedding)' },
  { eventType: 'Conference', count: 0, fill: 'var(--color-conference)' },
  { eventType: 'Birthday', count: 0, fill: 'var(--color-birthday)' },
  { eventType: 'General', count: 0, fill: 'var(--color-general)' },
  { eventType: 'Other', count: 0, fill: 'var(--color-other)' },
];

const chartConfig = {
  count: {
    label: 'Events',
  },
  wedding: {
    label: 'Wedding',
    color: 'hsl(var(--chart-1))',
  },
  conference: {
    label: 'Conference',
    color: 'hsl(var(--chart-2))',
  },
  birthday: {
    label: 'Birthday',
    color: 'hsl(var(--chart-3))',
  },
  general: {
    label: 'General',
    color: 'hsl(var(--chart-4))',
  },
  other: {
    label: 'Other',
    color: 'hsl(var(--chart-5))',
  },
};

export function EventTypeChart({ events }: EventTypeChartProps) {

  const chartData = useMemo(() => {
    if (!events || events.length === 0) {
        return initialChartData.map(d => ({ ...d, count: 1 })); // Show chart even if empty
    }

    const counts: { [key: string]: number } = {
        Wedding: 0,
        Conference: 0,
        Birthday: 0,
        General: 0,
        Other: 0,
    };
    
    events.forEach(event => {
        if(event.eventType && counts.hasOwnProperty(event.eventType)) {
            counts[event.eventType]++;
        } else {
            counts['Other']++;
        }
    });

    return initialChartData.map(item => ({
        ...item,
        count: counts[item.eventType]
    })).filter(item => item.count > 0);

  }, [events]);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="eventType"
          innerRadius={60}
          strokeWidth={5}
        />
        <ChartLegend
          content={<ChartLegendContent nameKey="eventType" />}
          className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
        />
      </PieChart>
    </ChartContainer>
  );
}
