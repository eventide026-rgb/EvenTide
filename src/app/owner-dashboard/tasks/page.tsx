
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const TaskBoard = dynamic(() => import('@/components/dashboard/planner/TaskBoard').then(mod => mod.TaskBoard), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
});

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold font-headline">Task Monitoring</h1>
        <p className="text-muted-foreground">
          View a read-only feed of the progress your planner is making.
        </p>
      </div>
      <div className="flex-1">
        <TaskBoard isReadOnly={true} />
      </div>
    </div>
  );
}
