
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, deleteDoc, documentId, orderBy } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, MessageSquare, UserX, Search } from 'lucide-react';
import Link from 'next/link';

type EventPlannerAssignment = {
    id: string;
    eventId: string;
};

type Event = {
  id: string;
  name: string;
};

type VendorContract = {
    id: string;
    vendorId: string;
    vendorName?: string; 
    serviceDescription: string;
    proposedPayment: number;
    status: 'pending' | 'accepted' | 'declined' | 'dropped_out' | 'completed';
    createdAt: any;
}

export default function ContractsPage() {
    const firestore = useFirestore();
    const { user, isUserLoading } = useUser();
    const { toast } = useToast();
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const plannerAssignmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'planners', user.uid, 'assignments'), where('status', '==', 'accepted'));
    }, [firestore, user?.uid]);
    const { data: assignments, isLoading: isLoadingAssignments } = useCollection<EventPlannerAssignment>(plannerAssignmentsQuery);
    const eventIds = useMemo(() => assignments?.map(a => a.eventId) || [], [assignments]);

    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || eventIds.length === 0) return null;
        return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
    }, [firestore, eventIds]);
    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const contractsQuery = useMemoFirebase(() => {
        if (!firestore || !selectedEventId) return null;
        return query(collection(firestore, 'events', selectedEventId, 'vendorContracts'), where('plannerId', '==', user?.uid), orderBy('createdAt', 'desc'));
    }, [firestore, selectedEventId, user?.uid]);
    const { data: contracts, isLoading: isLoadingContracts } = useCollection<VendorContract>(contractsQuery);

    const handleRevoke = async (contractId: string) => {
        if (!firestore || !selectedEventId) return;
        await deleteDoc(doc(firestore, 'events', selectedEventId, 'vendorContracts', contractId));
        toast({ title: "Proposal Revoked", description: "The vendor will no longer be able to accept this offer." });
    };

    const handleDropout = async (contractId: string) => {
        if (!firestore || !selectedEventId) return;
        await updateDoc(doc(firestore, 'events', selectedEventId, 'vendorContracts', contractId), { status: 'dropped_out' });
        toast({ title: "Contract Updated", description: "The vendor has been marked as dropped out." });
    };

    const getStatusBadge = (status: VendorContract['status']) => {
        switch (status) {
            case 'accepted': return <Badge>Accepted</Badge>;
            case 'completed': return <Badge className="bg-green-600">Completed</Badge>;
            case 'pending': return <Badge variant="outline">Pending</Badge>;
            case 'declined': return <Badge variant="destructive">Declined</Badge>;
            case 'dropped_out': return <Badge variant="destructive">Dropped Out</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };
    
    const isLoading = isUserLoading || isLoadingAssignments || isLoadingEvents;
    const isLoadingData = isLoadingContracts && !!selectedEventId;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold font-headline">Vendor Contracts</h1>
                <p className="text-muted-foreground">Manage proposals and active contracts for your events.</p>
            </header>

             <Card>
                <CardHeader>
                    <CardTitle>Select an Event</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label>Event</Label>
                    {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                            <SelectTrigger className="w-full md:w-1/2">
                                <SelectValue placeholder="Select an event..." />
                            </SelectTrigger>
                            <SelectContent>
                                {events && events.length > 0 ? (
                                    events.map((event) => (
                                        <SelectItem key={event.id} value={event.id}>
                                            {event.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-events" disabled>You have no assigned events.</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            {selectedEventId && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Contract & Proposal Log</CardTitle>
                            <CardDescription>A list of all proposals sent for this event.</CardDescription>
                        </div>
                         <Button asChild>
                            <Link href="/planner-dashboard/vendor-hub">
                                <Search className="mr-2 h-4 w-4" />
                                Find New Vendor
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {isLoadingData ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Vendor</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contracts && contracts.length > 0 ? contracts.map(contract => (
                                            <TableRow key={contract.id}>
                                                <TableCell>
                                                    <div className="font-medium">{contract.vendorName || contract.vendorId.substring(0,8)}</div>
                                                    <div className="text-sm text-muted-foreground truncate max-w-xs">{contract.serviceDescription}</div>
                                                </TableCell>
                                                <TableCell>₦{contract.proposedPayment.toLocaleString()}</TableCell>
                                                <TableCell>{getStatusBadge(contract.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    {contract.status === 'pending' && <Button variant="outline" size="sm" onClick={() => handleRevoke(contract.id)}><Trash2 className="mr-2 h-4 w-4"/>Revoke</Button>}
                                                    {contract.status === 'accepted' && (
                                                        <div className="flex gap-2 justify-end">
                                                            <Button variant="outline" size="sm"><MessageSquare className="mr-2 h-4 w-4"/>Chat</Button>
                                                            <Button variant="destructive" size="sm" onClick={() => handleDropout(contract.id)}><UserX className="mr-2 h-4 w-4"/>Dropout</Button>
                                                        </div>
                                                    )}
                                                    {(contract.status === 'declined' || contract.status === 'dropped_out') && (
                                                        <Button variant="secondary" size="sm" asChild>
                                                            <Link href="/planner-dashboard/vendor-hub"><Search className="mr-2 h-4 w-4"/>Find New Vendor</Link>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No contracts or proposals for this event yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
