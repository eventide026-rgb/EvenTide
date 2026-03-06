'use client';

import { useState, useMemo, Suspense } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, collectionGroup } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Info } from 'lucide-react';
import { ProgramPlannerClient } from '@/components/planner/program-planner-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type VendorGig = {
  id: string;
  eventId: string;
  eventName: string;
};

function ProgramViewerContent() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const gigsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
        collectionGroup(firestore, 'vendorContracts'), 
        where('vendorId', '==', user.uid),
        where('status', '==', 'accepted')
    );
  }, [firestore, user?.uid]);

  const { data: gigs, isLoading: isLoadingGigs } = useCollection<VendorGig>(gigsQuery);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Program Selector</CardTitle>
          <CardDescription>Select one of your active gigs to view its program schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Select Event</Label>
          {isLoadingGigs ? (
            <div className="flex items-center gap-2 text-muted-foreground mt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading your gigs...</span>
            </div>
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2 mt-2">
                <SelectValue placeholder="Choose an event to view its program" />
              </SelectTrigger>
              <SelectContent>
                {gigs && gigs.length > 0 ? (
                  gigs.map((gig) => (
                    <SelectItem key={gig.id} value={gig.eventId}>
                      {gig.eventName || `Event ${gig.eventId.substring(0, 6)}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-gigs" disabled>You have no active gigs.</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedEventId ? (
        <Card>
            <CardHeader>
                <CardTitle>Event Order of Events</CardTitle>
                <CardDescription>This is a read-only view of the schedule. Use it to time your cues.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProgramPlannerClient eventId={selectedEventId} isReadOnly />
            </CardContent>
        </Card>
      ) : (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Select an Event</AlertTitle>
            <AlertDescription>
                Choose an event from the list above to load the "Order of Events" schedule.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default function ProgramViewerPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Program Viewer</h1>
        <p className="text-muted-foreground">Your tactical guide to the event's timeline.</p>
      </header>
      <Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>}>
        <ProgramViewerContent />
      </Suspense>
    </div>
  );
}
