
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
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
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Clock, Crown, Star, User } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type Guest = {
  id: string;
  guestId: string;
  name: string;
  category: string;
  rsvpStatus: 'Pending' | 'Accepted' | 'Declined';
  hasCheckedIn: boolean;
  checkInTime?: any; // Firestore Timestamp
};

const categoryPriority: Record<string, number> = {
  'Chairperson': 1,
  'VVIP': 2,
  'VIP': 3,
  'Family': 4,
  'General': 5,
  'Staff': 6,
};

const categoryIcons: Record<string, React.ElementType> = {
    'Chairperson': Crown,
    'VVIP': Crown,
    'VIP': Star,
    'Family': User,
}

export function CheckInMonitorClient() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const guestsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'guests'));
  }, [firestore, selectedEventId]);
  const { data: guests, isLoading: isLoadingGuests } = useCollection<Guest>(guestsQuery);
  
  const sortedGuests = useMemo(() => {
    if (!guests) return [];
    return [...guests].sort((a, b) => {
      // 1. Sort by check-in status (checked-in first)
      if (a.hasCheckedIn && !b.hasCheckedIn) return -1;
      if (!a.hasCheckedIn && b.hasCheckedIn) return 1;

      // 2. Sort by category priority
      const priorityA = categoryPriority[a.category] || 99;
      const priorityB = categoryPriority[b.category] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // 3. Alphabetical by name
      return a.name.localeCompare(b.name);
    });
  }, [guests]);

  const isLoading = isUserLoading || isLoadingEvents;
  const CategoryIcon = ({category}: {category: string}) => {
      const Icon = categoryIcons[category] || User;
      return <Icon className="h-4 w-4 text-muted-foreground" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Live Check-in Monitor</CardTitle>
          <CardDescription>
            View a real-time stream of guest check-ins and monitor event capacity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Select an Event</Label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading your events...</span>
            </div>
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select an event to monitor" />
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
        <Card>
            <CardHeader>
                <CardTitle>Guest Manifest</CardTitle>
                 <CardDescription>
                    Guests are automatically sorted by arrival and category.
                </CardDescription>
            </CardHeader>
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
                                    <TableHead>Arrival Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedGuests.length > 0 ? sortedGuests.map(guest => (
                                    <TableRow key={guest.id} className={cn(guest.hasCheckedIn && 'bg-green-500/10')}>
                                        <TableCell className="font-medium">{guest.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <CategoryIcon category={guest.category} />
                                                <span>{guest.category}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={guest.hasCheckedIn ? 'default' : 'outline'} className={cn(guest.hasCheckedIn && 'bg-green-600')}>
                                                {guest.hasCheckedIn ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                                                {guest.hasCheckedIn ? 'Checked-In' : 'Awaiting'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {guest.checkInTime ? format(guest.checkInTime.toDate(), 'p') : '—'}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No guests found for this event.</TableCell>
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
