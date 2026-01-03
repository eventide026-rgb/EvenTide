
'use client';

import { useMemo } from 'react';
import { useCollection, useCollectionGroup, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, Check, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

type Proposal = {
  id: string; // The contract ID
  eventId: string;
  plannerId: string;
  serviceDescription: string;
  proposedPayment: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: any;
};

// Simplified event type for this page
type Event = {
    id: string;
    name: string;
    eventDate: any;
};

export default function ProposalsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const proposalsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collectionGroup(firestore, 'vendorContracts'), where('vendorId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: proposals, isLoading, error } = useCollection<Proposal>(proposalsQuery);

  const eventIds = useMemo(() => {
      if(!proposals) return [];
      return [...new Set(proposals.map(p => p.eventId))];
  }, [proposals]);

  const eventsQuery = useMemoFirebase(() => {
      if(!firestore || eventIds.length === 0) return null;
      return query(collection(firestore, 'events'), where('__name__', 'in', eventIds));
  }, [firestore, eventIds]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const handleUpdateStatus = async (proposal: Proposal, status: 'accepted' | 'declined') => {
    if (!firestore) return;
    const contractRef = doc(firestore, 'events', proposal.eventId, 'vendorContracts', proposal.id);
    try {
        await updateDoc(contractRef, { status });
        toast({
            title: `Proposal ${status}`,
            description: "The event planner has been notified of your decision.",
        });
    } catch (err) {
        console.error("Error updating status:", err);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the proposal status. Please try again.",
        });
    }
  };

  if (isLoading || isLoadingEvents) {
      return (
          <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      )
  }

  const getEventName = (eventId: string) => {
      return events?.find(e => e.id === eventId)?.name || "An Event";
  }
  const getEventDate = (eventId: string) => {
      const event = events?.find(e => e.id === eventId);
      return event?.eventDate ? format(event.eventDate.toDate(), 'PPP') : 'Date TBD';
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">My Proposals</h1>
        <p className="text-muted-foreground">Review and respond to new job offers from event planners.</p>
      </header>

      <Card>
        <CardHeader>
            <CardTitle>Incoming Proposals</CardTitle>
            <CardDescription>New job offers awaiting your response.</CardDescription>
        </CardHeader>
        <CardContent>
            {proposals && proposals.filter(p => p.status === 'pending').length > 0 ? (
                <div className="space-y-4">
                    {proposals.filter(p => p.status === 'pending').map(proposal => (
                        <Card key={proposal.id} className="p-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="md:col-span-2 space-y-2">
                                    <h3 className="font-semibold text-lg">{getEventName(proposal.eventId)}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" />{getEventDate(proposal.eventId)}</p>
                                    <p className="text-sm">{proposal.serviceDescription}</p>
                                    <p className="font-bold text-lg text-primary">₦{proposal.proposedPayment.toLocaleString()}</p>
                                </div>
                                <div className="md:col-span-1 flex md:flex-col gap-2 justify-end">
                                    <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(proposal, 'declined')}><X className="mr-2 h-4 w-4" /> Decline</Button>
                                    <Button size="sm" onClick={() => handleUpdateStatus(proposal, 'accepted')}><Check className="mr-2 h-4 w-4" /> Accept</Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">No Pending Proposals</h3>
                    <p className="mt-1 text-muted-foreground">New proposals from planners will appear here.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
