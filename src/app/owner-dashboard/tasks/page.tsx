
'use client';

import { TaskBoard } from '@/components/dashboard/planner/TaskBoard';

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
