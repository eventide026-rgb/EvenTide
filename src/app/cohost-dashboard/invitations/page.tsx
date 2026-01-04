'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where, doc, updateDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

type CoHostInvitation = {
  id: string; // This is the user's ID in the subcollection
  status: 'pending' | 'accepted' | 'declined';
  // Note: For this to work, eventName and eventDate should be denormalized onto the invitation doc
  eventName: string;
  eventDate: any; 
};

export default function InvitationsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const invitationsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    // This is a simplified query. A real-world app might use collectionGroup
    // or have a top-level `invitations` collection for easier querying.
    // For now, we'll assume a structure that's queryable, though it might need optimization.
    // Let's assume co-hosts are stored in `events/{eventId}/cohosts/{userId}`
    // A collectionGroup query is the right tool here.
    return query(collectionGroup(firestore, 'cohosts'), where('userId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: invitations, isLoading } = useCollection<CoHostInvitation>(invitationsQuery);

  const handleResponse = async (invitation: CoHostInvitation, newStatus: 'accepted' | 'declined') => {
    if (!firestore) return;
    
    // Path reconstruction is tricky without the eventId. 
    // This is a major simplification and assumes the doc ID is structured to help.
    // A better way is for the collectionGroup query to return docs with full path info.
    // For this demo, we'll assume the ID might be structured like `eventId_userId`.
    const eventId = invitation.id.split('_')[0]; 
    if (!eventId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not identify the event for this invitation.'});
        return;
    }

    const invitationRef = doc(firestore, 'events', eventId, 'cohosts', user!.uid);
    await updateDoc(invitationRef, { status: newStatus });
    toast({
      title: `Invitation ${newStatus}`,
      description: `You have ${newStatus} the invitation.`,
    });
  };
  
  const pendingInvitations = invitations?.filter(inv => inv.status === 'pending');

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Invitations</CardTitle>
        <CardDescription>View and accept or decline invitations from event owners to co-host their events.</CardDescription>
      </CardHeader>
      <CardContent>
         {isLoading && <Loader2 className="animate-spin" />}
          {!isLoading && (!pendingInvitations || pendingInvitations.length === 0) && (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-xl font-semibold">Your inbox is clear!</h3>
                <p className="mt-1 text-muted-foreground">You have no pending co-host invitations.</p>
            </div>
          )}
          <div className="space-y-4">
            {pendingInvitations?.map((invitation) => (
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
  );
}
