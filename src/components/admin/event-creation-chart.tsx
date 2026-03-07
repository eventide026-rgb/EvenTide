
'use client';

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { date: '2024-05-01', events: 21 },
  { date: '2024-05-08', events: 35 },
  { date: '2024-05-15', events: 28 },
  { date: '2024-05-22', events: 42 },
  { date: '2024-05-29', events: 55 },
  { date: '2024-06-05', events: 60 },
];

const chartConfig = {
  events: {
    label: 'New Events',
    color: 'hsl(var(--primary))',
  },
};

export function EventCreationChart() {
  return (
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-[300px]">
        <LineChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
           <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            />
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Line
            dataKey="events"
            type="natural"
            stroke="var(--color-events)"
            strokeWidth={2}
            dot={{
              fill: 'var(--color-events)',
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ChartContainer>
  );
}
