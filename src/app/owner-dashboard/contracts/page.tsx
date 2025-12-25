
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type FashionContract = {
  id: string;
  designerId: string; // We'll need another query to get designer name
  description: string;
  budget: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
};

// Simplified type for now
type VendorContract = {
    id: string;
    vendorId: string;
    service: string;
    amount: number;
    status: 'pending' | 'accepted' | 'declined' | 'completed';
}

export default function MonitorContractsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const fashionContractsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'fashionContracts'));
  }, [firestore, selectedEventId]);

  const { data: fashionContracts, isLoading: isLoadingFashionContracts } = useCollection<FashionContract>(fashionContractsQuery);
  
  // Placeholder for vendor contracts
  const vendorContracts: VendorContract[] = []; 
  const isLoadingVendorContracts = false;


  const isLoading = isUserLoading || isLoadingEvents;
  const isLoadingContractData = isLoadingFashionContracts || isLoadingVendorContracts;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monitor Contracts</CardTitle>
          <CardDescription>
            View the status of all vendor contracts and fashion commissions for a selected event. This is a read-only view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Select an Event</Label>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select an event to view contracts" />
              </SelectTrigger>
              <SelectContent>
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-events" disabled>You have no events.</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <Tabs defaultValue="fashion">
            <TabsList>
                <TabsTrigger value="fashion">Fashion Commissions</TabsTrigger>
                <TabsTrigger value="vendor">Vendor Contracts</TabsTrigger>
            </TabsList>
            <TabsContent value="fashion">
                <Card>
                    <CardHeader>
                        <CardTitle>Fashion Commissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingContractData ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Designer</TableHead>
                                            <TableHead>Budget</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fashionContracts && fashionContracts.length > 0 ? fashionContracts.map(c => (
                                            <TableRow key={c.id}>
                                                <TableCell className="font-medium">{c.designerId.substring(0, 10)}...</TableCell>
                                                <TableCell>₦{c.budget.toLocaleString()}</TableCell>
                                                <TableCell><Badge>{c.status}</Badge></TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow><TableCell colSpan={3} className="h-24 text-center">No fashion commissions for this event.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="vendor">
                 <Card>
                    <CardHeader>
                        <CardTitle>Vendor Contracts</CardTitle>
                    </CardHeader>
                    <CardContent>
                         {isLoadingContractData ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> : (
                             <div className="rounded-md border">
                                <Table>
                                    <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead>Service</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        <TableRow><TableCell colSpan={4} className="h-24 text-center">No vendor contracts for this event yet.</TableCell></TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
