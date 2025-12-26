
'use client';

import { ProgramPlannerClient } from '@/components/planner/program-planner-client';

export default function ProgramPlannerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Program Planner</h1>
        <p className="text-muted-foreground">Build the event's "Order of Events" from start to finish.</p>
      </header>
      <ProgramPlannerClient />
    </div>
  );
}
