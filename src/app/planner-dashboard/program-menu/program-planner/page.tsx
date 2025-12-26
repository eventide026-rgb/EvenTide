
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProgramPlannerClient } from '@/components/planner/program-planner-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { Loader2 } from 'lucide-react';

function ProgramPlannerPageContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Event Not Selected</AlertTitle>
        <AlertDescription>
          No event was selected. Please go back to the hub and choose an event to manage its program.
        </AlertDescription>
      </Alert>
    );
  }

  return <ProgramPlannerClient eventId={eventId} />;
}

export default function ProgramPlannerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Program Planner</h1>
        <p className="text-muted-foreground">Build the event's "Order of Events" from start to finish.</p>
      </header>
      <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
        <ProgramPlannerPageContent />
      </Suspense>
    </div>
  );
}
