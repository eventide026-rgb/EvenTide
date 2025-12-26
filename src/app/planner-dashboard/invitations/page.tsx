
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import {
  collectionGroup,
  query,
  where,
  doc,
  writeBatch,
  getDoc,
  collection,
  Timestamp,
  getDocs,
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, Check, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
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

type Invitation = {
  id: string; // This will be the eventId
  hostId: string;
  plannerId: string;
  status: 'pending' | 'accepted' | 'declined';
  event?: EventDetails;
};

type EventDetails = {
    id: string;
    name: string;
    eventDate: Timestamp;
}

export default function PlannerInvitationsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [clashWarning, setClashWarning] = useState<{
    show: boolean;
    invitation?: Invitation;
    clashingEvent?: EventDetails;
  }>({ show: false });

  // 1. Get all event invitations for the current planner
  const invitationsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collectionGroup(firestore, 'planners'),
      where('userId', '==', user.uid),
      where('status', '==', 'pending')
    );
  }, [firestore, user?.uid]);

  const { data: invitations, isLoading: isLoadingInvitations } = useCollection<Invitation>(invitationsQuery);
  
  // 2. Fetch event details for each invitation
  const [invitationsWithDetails, setInvitationsWithDetails] = useState<Invitation[]>([]);
  useEffect(() => {
      if(!invitations || !firestore) return;

      const fetchEventDetails = async () => {
          const detailedInvs = await Promise.all(
              invitations.map(async (inv) => {
                  const eventId = inv.id; // The doc id is the event id
                  const eventRef = doc(firestore, 'events', eventId);
                  const eventSnap = await getDoc(eventRef);
                  if(eventSnap.exists()) {
                      return { ...inv, event: {id: eventSnap.id, ...eventSnap.data()} as EventDetails };
                  }
                  return inv;
              })
          );
          setInvitationsWithDetails(detailedInvs.filter(inv => inv.event) as Invitation[]);
      }
      fetchEventDetails();
  }, [invitations, firestore]);
  
  // 3. Get all accepted events for clash detection
  const acceptedGigsQuery = useMemoFirebase(() => {
      if (!firestore || !user?.uid) return null;
      return query(
          collectionGroup(firestore, 'planners'),
          where('userId', '==', user.uid),
          where('status', '==', 'accepted')
      );
  }, [firestore, user?.uid]);

  const {data: acceptedGigs} = useCollection(acceptedGigsQuery);

  const handleResponse = async (
    invitation: Invitation,
    status: 'accepted' | 'declined'
  ) => {
    if (!firestore || !user || !invitation.event) return;

    if (status === 'accepted') {
      const newEventDate = invitation.event.eventDate.toDate();
      const acceptedEventDocs = await getDocs(query(collection(firestore, 'events'), where('__name__', 'in', acceptedGigs?.map(g => g.id) || [])));
      const clashingEvent = acceptedEventDocs.docs.map(d => d.data() as EventDetails).find(gig => isSameDay(gig.eventDate.toDate(), newEventDate));

      if (clashingEvent) {
        setClashWarning({ show: true, invitation, clashingEvent });
        return;
      }
    }

    await updateInvitationStatus(invitation, status);
  };

  const updateInvitationStatus = async (
    invitation: Invitation,
    status: 'accepted' | 'declined'
  ) => {
    if (!firestore || !user || !invitation.event) return;
    const batch = writeBatch(firestore);

    // Update status in /events/{eventId}/planners subcollection
    const eventPlannerRef = doc(firestore, 'events', invitation.event.id, 'planners', user.uid);
    batch.update(eventPlannerRef, { status });

    // Also update the root /planners collection for the planner's own queries
    const rootPlannerDocRef = doc(firestore, 'planners', user.uid, 'assignments', invitation.event.id);
    batch.update(rootPlannerDocRef, {status});
    
    // Create notification for the event owner
    const eventOwnerNotificationRef = doc(collection(firestore, 'users', invitation.hostId, 'notifications'));
    batch.set(eventOwnerNotificationRef, {
        message: `Your invitation to ${user.displayName} for "${invitation.event.name}" has been ${status}.`,
        link: '/owner-dashboard/team',
        read: false,
        createdAt: new Date(),
    });

    await batch.commit();
    toast({
      title: `Invitation ${status}`,
      description: 'The event owner has been notified.',
    });
    setClashWarning({ show: false });
  };

  const isLoading = isLoadingInvitations;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Job Invitations</h1>
        <p className="text-muted-foreground">
          Review and respond to new event management proposals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader2 className="animate-spin" />}
          {!isLoading && invitationsWithDetails.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No new invitations at the moment.
            </p>
          )}
          <div className="space-y-4">
            {invitationsWithDetails.map((inv) =>
              inv.event ? (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">{inv.event.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(inv.event.eventDate.toDate(), 'PPP')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResponse(inv, 'declined')}
                    >
                      <X className="mr-2 h-4 w-4" /> Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResponse(inv, 'accepted')}
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
                clashWarning.invitation &&
                updateInvitationStatus(clashWarning.invitation, 'accepted')
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
