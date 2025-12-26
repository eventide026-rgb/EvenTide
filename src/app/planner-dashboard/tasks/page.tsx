
'use client';

import { TaskBoard } from '@/components/dashboard/planner/TaskBoard';

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="text-3xl font-bold font-headline">Task Management</h1>
        <p className="text-muted-foreground">
          Your command center for all event to-do items. Select an event to get started.
        </p>
      </div>
      <div className="flex-1">
        <TaskBoard isReadOnly={false} />
      </div>
    </div>
  );
}

    