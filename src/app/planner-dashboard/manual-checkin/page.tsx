
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, serverTimestamp, documentId } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, CheckCircle, XCircle } from 'lucide-react';
import { useDebounce } from 'use-debounce';

type EventPlannerAssignment = {
    id: string;
    eventId: string;
};

type Event = {
  id: string;
  name: string;
};

type Guest = {
  id: string;
  name: string;
  email: string;
  category: string;
  hasCheckedIn: boolean;
};

export default function ManualCheckinPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);

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

  const guestsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'guests'));
  }, [firestore, selectedEventId]);
  const { data: guests, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);

  const filteredGuests = useMemo(() => {
    if (!guests) return [];
    if (!debouncedSearchTerm) return guests;

    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return guests.filter(
      guest =>
        guest.name.toLowerCase().includes(lowercasedFilter) ||
        guest.email.toLowerCase().includes(lowercasedFilter)
    );
  }, [guests, debouncedSearchTerm]);

  const handleToggleCheckIn = async (guest: Guest) => {
    if (!firestore || !selectedEventId) return;

    const newStatus = !guest.hasCheckedIn;
    const guestRef = doc(firestore, 'events', selectedEventId, 'guests', guest.id);
    try {
      await updateDoc(guestRef, {
        hasCheckedIn: newStatus,
        checkInTime: newStatus ? serverTimestamp() : null,
      });
      toast({
        title: `Check-in ${newStatus ? 'Successful' : 'Revoked'}`,
        description: `${guest.name}'s status has been updated.`,
      });
    } catch (error) {
      console.error('Error updating check-in status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the guest\'s status.',
      });
    }
  };
  
  const isLoading = isLoadingAssignments || isLoadingEvents;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manual Guest Check-in</CardTitle>
          <CardDescription>
            Search for a guest to manually manage their check-in status for the selected event.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Event</Label>
             {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Loading events...</span></div>
            ) : (
                <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                <SelectTrigger className="w-full md:w-1/2">
                    <SelectValue placeholder="Choose an event to manage check-in" />
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
          </div>
           {selectedEventId && (
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <Card>
            <CardHeader><CardTitle>Guest Roster</CardTitle></CardHeader>
            <CardContent>
            {isLoadingGuests ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Guest</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredGuests.length > 0 ? (
                        filteredGuests.map((guest) => (
                            <TableRow key={guest.id}>
                            <TableCell>
                                <div className="font-medium">{guest.name}</div>
                                <div className="text-sm text-muted-foreground">{guest.email}</div>
                            </TableCell>
                            <TableCell><Badge variant="outline">{guest.category}</Badge></TableCell>
                            <TableCell>
                                <Badge variant={guest.hasCheckedIn ? 'default' : 'secondary'} className={guest.hasCheckedIn ? 'bg-green-600' : ''}>
                                    {guest.hasCheckedIn ? 'Checked-In' : 'Awaiting'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                size="sm"
                                variant={guest.hasCheckedIn ? 'destructive' : 'default'}
                                onClick={() => handleToggleCheckIn(guest)}
                                >
                                {guest.hasCheckedIn ? <XCircle className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                {guest.hasCheckedIn ? 'Revoke' : 'Check In'}
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                            No guests found.
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
