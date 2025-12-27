
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Check, X, Calendar, AlertTriangle } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type TeamMemberInvitation = {
  id: string; 
  eventId: string;
  eventName: string;
  eventDate: Timestamp;
  status: 'pending';
  userId: string;
};

type AcceptedGig = {
    id: string;
    eventId: string;
    eventDate: Timestamp;
    eventName: string;
}

export default function InvitationsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [clashWarning, setClashWarning] = useState<{
    show: boolean;
    invitation?: TeamMemberInvitation;
    clashingEvent?: AcceptedGig;
  }>({ show: false });

  // Query for all pending invitations across all events
  const pendingInvitationsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collectionGroup(firestore, 'teamMembers'),
      where('userId', '==', user.uid),
      where('status', '==', 'pending')
    );
  }, [firestore, user?.uid]);

  const { data: invitations, isLoading: isLoadingInvitations, error: invitationsError } = useCollection<TeamMemberInvitation>(pendingInvitationsQuery);
  
  const acceptedGigsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
        collectionGroup(firestore, 'teamMembers'),
        where('userId', '==', user.uid),
        where('status', '==', 'accepted')
    );
  }, [firestore, user?.uid]);
  const { data: acceptedGigs, isLoading: isLoadingGigs } = useCollection<AcceptedGig>(acceptedGigsQuery);


  const handleResponse = async (invitation: TeamMemberInvitation, status: 'accepted' | 'declined') => {
    if (!firestore || !user) return;

    if (status === 'accepted' && acceptedGigs) {
        const newEventDate = invitation.eventDate.toDate();
        const clashingEvent = acceptedGigs.find(gig => 
            gig.eventDate && isSameDay(gig.eventDate.toDate(), newEventDate)
        );

        if (clashingEvent) {
            setClashWarning({ show: true, invitation, clashingEvent });
            return;
        }
    }
    
    await updateInvitationStatus(invitation, status);
  };
  
  const updateInvitationStatus = async (invitation: TeamMemberInvitation, status: 'accepted' | 'declined') => {
    if (!firestore || !user) return;

    const teamMemberRef = doc(firestore, 'events', invitation.eventId, 'teamMembers', invitation.id);
    
    try {
        await updateDoc(teamMemberRef, { status });
        toast({
            title: `Invitation ${status}`,
            description: 'The event owner has been notified.',
        });
    } catch(error) {
        console.error("Error updating invitation:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the invitation status.",
        });
    }
    setClashWarning({ show: false });
  }

  const isLoading = isLoadingInvitations || isLoadingGigs;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Invitations</h1>
        <p className="text-muted-foreground">
          Review and respond to new event proposals.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Event Proposals</CardTitle>
          <CardDescription>You have {invitations?.length || 0} pending invitations.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <Loader2 className="animate-spin" />}
          {invitationsError && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Invitations</AlertTitle>
                <AlertDescription>
                    <pre className="mt-2 rounded-md bg-slate-950 p-4">
                        <code className="text-white">{invitationsError.message}</code>
                    </pre>
                </AlertDescription>
            </Alert>
          )}
          {!isLoading && !invitationsError && (!invitations || invitations.length === 0) && (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">Your inbox is clear!</h3>
                <p className="mt-1 text-muted-foreground">You have no pending event invitations.</p>
            </div>
          )}
          <div className="space-y-4">
            {invitations?.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold">{invitation.eventName || 'An Event'}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {invitation.eventDate ? format(invitation.eventDate.toDate(), 'PPP') : 'Date TBD'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResponse(invitation, 'declined')}
                    >
                      <X className="mr-2 h-4 w-4" /> Decline
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleResponse(invitation, 'accepted')}
                    >
                      <Check className="mr-2 h-4 w-4" /> Accept
                    </Button>
                  </div>
                </div>
            ))}
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
              <strong>`{clashWarning.clashingEvent?.eventName}`</strong> on this
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
