'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type FashionContract = {
  id: string;
  eventId: string;
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  // We need to fetch eventName and eventDate separately if not denormalized
};

type EventInfo = {
    id: string;
    name: string;
    eventDate: any;
}

export default function MyCommissionsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const contractsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'fashionContracts'),
      where('designerId', '==', user.uid)
    );
  }, [firestore, user?.uid]);

  const { data: contracts, isLoading: isLoadingContracts } = useCollection<FashionContract>(contractsQuery);

  const eventIds = useMemo(() => {
    if (!contracts) return [];
    return [...new Set(contracts.map(c => c.eventId))];
  }, [contracts]);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || eventIds.length === 0) return null;
    return query(collection(firestore, 'events'), where('__name__', 'in', eventIds));
  }, [firestore, eventIds]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<EventInfo>(eventsQuery);

  const eventsMap = useMemo(() => {
      const map = new Map<string, EventInfo>();
      events?.forEach(e => map.set(e.id, e));
      return map;
  }, [events]);

  const handleUpdateStatus = async (contract: FashionContract, status: 'accepted' | 'declined') => {
    if (!firestore) return;
    const contractRef = doc(firestore, 'events', contract.eventId, 'fashionContracts', contract.id);
    try {
        await updateDoc(contractRef, { status });
        toast({ title: 'Proposal Updated', description: `You have ${status} the commission.` });
    } catch (e) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Update failed' });
    }
  };
  
  const getStatusBadge = (status: FashionContract['status']) => {
    switch (status) {
      case 'accepted': return <Badge>Accepted</Badge>;
      case 'completed': return <Badge className="bg-green-600">Completed</Badge>;
      case 'pending': return <Badge variant="outline">Pending</Badge>;
      case 'declined': return <Badge variant="destructive">Declined</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isLoading = isUserLoading || isLoadingContracts || (eventIds.length > 0 && isLoadingEvents);

  const sortedContracts = useMemo(() => {
      if (!contracts) return { pending: [], other: [] };
      const pending = contracts.filter(c => c.status === 'pending');
      const other = contracts.filter(c => c.status !== 'pending');
      return { pending, other };
  }, [contracts]);

  const renderContractCard = (contract: FashionContract) => {
    const event = eventsMap.get(contract.eventId);
    return (
      <Card key={contract.id}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{event?.name || 'An Event'}</CardTitle>
              <CardDescription>{event?.eventDate ? format(event.eventDate.toDate(), 'PPP') : 'Date TBD'}</CardDescription>
            </div>
            {getStatusBadge(contract.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-sm">Design Brief</p>
            <p className="text-muted-foreground text-sm">{contract.description}</p>
          </div>
          <div>
            <p className="font-semibold text-sm">Proposed Budget</p>
            <p className="text-primary font-bold text-lg">₦{contract.budget.toLocaleString()}</p>
          </div>
          {contract.status === 'pending' && (
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => handleUpdateStatus(contract, 'declined')}>Decline</Button>
              <Button onClick={() => handleUpdateStatus(contract, 'accepted')}>Accept</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };


  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold font-headline">My Commissions</h1>
        <p className="text-muted-foreground">Manage your bespoke design projects and client consultations.</p>
      </header>

       <Tabs defaultValue="pending">
        <TabsList>
            <TabsTrigger value="pending">Pending Proposals ({sortedContracts.pending.length})</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
             {isLoading ? <Loader2 className="animate-spin" /> : (
                sortedContracts.pending.length > 0 ? (
                    <div className="space-y-4">{sortedContracts.pending.map(renderContractCard)}</div>
                ) : (
                    <p className="text-muted-foreground text-center py-16">No pending commission proposals.</p>
                )
             )}
        </TabsContent>
        <TabsContent value="history" className="mt-4">
            {isLoading ? <Loader2 className="animate-spin" /> : (
                sortedContracts.other.length > 0 ? (
                    <div className="space-y-4">{sortedContracts.other.map(renderContractCard)}</div>
                ) : (
                     <p className="text-muted-foreground text-center py-16">No previous commissions found.</p>
                )
             )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
