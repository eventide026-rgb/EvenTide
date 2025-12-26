
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  query,
  where,
  doc,
  writeBatch,
  getDocs,
  documentId,
  Timestamp,
} from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Check, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type EventPlannerAssignment = {
  id: string;
  eventId: string;
  status: 'pending' | 'accepted' | 'declined';
};

type Event = {
  id: string;
  name: string;
  eventType: string;
  eventDate: Timestamp;
};

export default function PlannerEventsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [clashWarning, setClashWarning] = useState<{
    show: boolean;
    assignment?: EventPlannerAssignment;
    clashingEvent?: Event;
  }>({ show: false });

  // 1. Get all event assignments for the current planner
  const assignmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'planners'),
      where('plannerId', '==', user.uid)
    );
  }, [firestore, user?.uid]);

  const { data: assignments, isLoading: isLoadingAssignments } =
    useCollection<EventPlannerAssignment>(assignmentsQuery);

  const eventIds = useMemo(
    () => assignments?.map((a) => a.eventId) || [],
    [assignments]
  );

  // 2. Fetch all events based on assignments
  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || eventIds.length === 0) return null;
    return query(
      collection(firestore, 'events'),
      where(documentId(), 'in', eventIds)
    );
  }, [firestore, eventIds]);

  const { data: events, isLoading: isLoadingEvents } =
    useCollection<Event>(eventsQuery);

  const mergedData = useMemo(() => {
    if (!assignments || !events) return [];
    return assignments.map((assignment) => {
      const event = events.find((e) => e.id === assignment.eventId);
      return { ...assignment, event };
    });
  }, [assignments, events]);

  const pendingInvitations = useMemo(
    () => mergedData.filter((item) => item.status === 'pending' && item.event),
    [mergedData]
  );

  const activeGigs = useMemo(
    () => mergedData.filter((item) => item.status === 'accepted' && item.event),
    [mergedData]
  );

  const handleResponse = async (
    assignment: EventPlannerAssignment,
    status: 'accepted' | 'declined'
  ) => {
    if (!firestore || !user) return;

    if (status === 'accepted') {
      const newEvent = events?.find((e) => e.id === assignment.eventId);
      const clashingEvent = activeGigs.find(
        (gig) =>
          gig.event &&
          newEvent &&
          isSameDay(gig.event.eventDate.toDate(), newEvent.eventDate.toDate())
      )?.event;

      if (clashingEvent) {
        setClashWarning({ show: true, assignment, clashingEvent });
        return;
      }
    }

    await updateAssignmentStatus(assignment, status);
  };

  const updateAssignmentStatus = async (
    assignment: EventPlannerAssignment,
    status: 'accepted' | 'declined'
  ) => {
    if (!firestore || !user) return;
    const batch = writeBatch(firestore);

    // Update status in /planners collection
    const assignmentRef = doc(firestore, 'planners', assignment.id);
    batch.update(assignmentRef, { status });

    // Update status in /events/{eventId}/planners subcollection
    const eventPlannerRef = doc(
      firestore,
      'events',
      assignment.eventId,
      'planners',
      user.uid
    );
    batch.update(eventPlannerRef, { status });

    await batch.commit();
    toast({
      title: `Invitation ${status}`,
      description: 'The event owner has been notified.',
    });
    setClashWarning({ show: false });
  };

  const isLoading = isLoadingAssignments || isLoadingEvents;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Events</h1>
        <p className="text-muted-foreground">
          Manage your job invitations and active gigs.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader2 className="animate-spin" />}
          {!isLoading && pendingInvitations.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No new invitations.
            </p>
          )}
          <div className="space-y-4">
            {pendingInvitations.map(({ id, event }) =>
              event ? (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">{event.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(event.eventDate.toDate(), 'PPP')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResponse({ id, eventId: event.id, status: 'pending' }, 'declined')}
                    >
                      <X className="mr-2 h-4 w-4" /> Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResponse({ id, eventId: event.id, status: 'pending' }, 'accepted')}
                    >
                      <Check className="mr-2 h-4 w-4" /> Accept
                    </Button>
                  </div>
                </div>
              ) : null
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Active & Upcoming Gigs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeGigs.map(({ id, event }) =>
                event ? (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{event.eventType}</Badge>
                    </TableCell>
                    <TableCell>
                      {format(event.eventDate.toDate(), 'PPP')}
                    </TableCell>
                    <TableCell>
                      <Badge>
                        {event.eventDate.toDate() > new Date()
                          ? 'Upcoming'
                          : 'Concluded'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/planner-dashboard/tasks?eventId=${event.id}`}>Manage</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : null
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog
        open={clashWarning.show}
        onOpenChange={(open) => setClashWarning({ ...clashWarning, show: open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Calendar Clash Detected</AlertDialogTitle>
            <AlertDialogDescription>
              You are already booked for{' '}
              <strong>`{clashWarning.clashingEvent?.name}`</strong> on this
              date. Are you sure you want to accept this new event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                clashWarning.assignment &&
                updateAssignmentStatus(clashWarning.assignment, 'accepted')
              }
            >
              Accept Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
