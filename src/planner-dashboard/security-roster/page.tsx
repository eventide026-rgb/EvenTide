
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, getDocs, documentId } from 'firebase/firestore';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Shield, Copy } from 'lucide-react';
import { Input } from '@/components/ui/input';

type EventPlannerAssignment = {
    id: string;
    eventId: string;
};

type Event = {
  id: string;
  name: string;
  securityPersonnelLimit?: number;
  securityCode?: string;
};

type SecurityMember = {
    id: string;
    name: string;
    email: string;
}

export default function SecurityRosterPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const plannerAssignmentsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'planners'), where('plannerId', '==', user.uid));
    }, [firestore, user?.uid]);
    const { data: assignments, isLoading: isLoadingAssignments } = useCollection<EventPlannerAssignment>(plannerAssignmentsQuery);
    const eventIds = useMemo(() => assignments?.map(a => a.eventId) || [], [assignments]);

    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || eventIds.length === 0) return null;
        return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
    }, [firestore, eventIds]);
    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    const selectedEventRef = useMemoFirebase(() => {
        if(!firestore || !selectedEventId) return null;
        return doc(firestore, 'events', selectedEventId);
    }, [firestore, selectedEventId]);

    const { data: selectedEvent, isLoading: isLoadingSelectedEvent } = useDoc<Event>(selectedEventRef);

    const securityQuery = useMemoFirebase(() => {
        if (!firestore || !selectedEventId) return null;
        return query(collection(firestore, 'events', selectedEventId, 'security'));
    }, [firestore, selectedEventId]);

    const { data: securityTeam, isLoading: isLoadingSecurity } = useCollection<SecurityMember>(securityQuery);
    
    const generateNewCode = async () => {
        if (!selectedEventRef) return;
        const newCode = `SECURE${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await updateDoc(selectedEventRef, { securityCode: newCode });
        toast({ title: 'New Code Generated', description: 'The scanner activation code has been updated.' });
    };

    const copyToClipboard = () => {
        if (!selectedEvent?.securityCode) return;
        navigator.clipboard.writeText(selectedEvent.securityCode);
        toast({ title: "Copied!", description: "The security code has been copied to your clipboard." });
    }

    const isLoading = isLoadingAssignments || isLoadingEvents;
    const isLoadingData = isLoadingSelectedEvent || isLoadingSecurity;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Security Roster</CardTitle>
                    <CardDescription>Oversee the security team and scanner access for your event.</CardDescription>
                </CardHeader>
                 <CardContent>
                    <Label>Select Event</Label>
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Loading events...</span></div>
                    ) : (
                        <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                            <SelectTrigger className="w-full md:w-1/2">
                                <SelectValue placeholder="Choose an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events && events.length > 0 ? (
                                events.map((event) => (<SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>))
                                ) : (
                                <SelectItem value="no-events" disabled>No events assigned</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </CardContent>
            </Card>

            {selectedEventId && (
                <div className="grid md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Assigned Security Team</CardTitle>
                                <CardDescription>
                                    {securityTeam?.length || 0} of {selectedEvent?.securityPersonnelLimit || 'N/A'} security personnel assigned.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isLoadingData ? <Loader2 className='mx-auto h-8 w-8 animate-spin' /> : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead></TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {securityTeam && securityTeam.length > 0 ? securityTeam.map(member => (
                                                    <TableRow key={member.id}><TableCell>{member.name}</TableCell><TableCell>{member.email}</TableCell></TableRow>
                                                )) : (
                                                    <TableRow><TableCell colSpan={2} className="h-24 text-center">No security team assigned yet.</TableCell></TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                     <div className="md:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Shield /> Scanner Activation</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="security-code">Event Security Code</Label>
                                    <div className="flex items-center gap-2">
                                        <Input id="security-code" value={selectedEvent?.securityCode || 'Not set'} readOnly />
                                        <Button variant="outline" size="icon" onClick={copyToClipboard} disabled={!selectedEvent?.securityCode}><Copy className="h-4 w-4" /></Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Share this code with your on-site team to activate their scanners.</p>
                                </div>
                                <Button className="w-full" onClick={generateNewCode}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> Generate New Code
                                </Button>
                            </CardContent>
                        </Card>
                     </div>
                </div>
            )}
        </div>
    );
}
