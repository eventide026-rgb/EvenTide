
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, documentId } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Music } from 'lucide-react';
import { Label } from '@/components/ui/label';

type VendorGig = {
  id: string;
  eventId: string;
};

type Event = {
  id: string;
  name: string;
};

type SongRequest = {
  id: string;
  songTitle: string;
  artist: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'rejected';
};

export default function VendorSongRequestsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const vendorGigsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'vendorContracts'), where('vendorId', '==', user.uid), where('status', '==', 'accepted'));
  }, [firestore, user?.uid]);
  const { data: gigs, isLoading: isLoadingGigs } = useCollection<VendorGig>(vendorGigsQuery);
  const eventIds = useMemo(() => gigs?.map(gig => gig.eventId) || [], [gigs]);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || eventIds.length === 0) return null;
    return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
  }, [firestore, eventIds]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'songRequests'), where('status', '==', 'approved'));
  }, [firestore, selectedEventId]);

  const { data: requests, isLoading: isLoadingRequests } = useCollection<SongRequest>(requestsQuery);

  const isLoading = isUserLoading || isLoadingGigs || isLoadingEvents;

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Song Requests</CardTitle>
          <CardDescription>View the approved song request playlist for your assigned events.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Select an Event</Label>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select an event to view its playlist" />
              </SelectTrigger>
              <SelectContent>
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-events" disabled>You have no assigned gigs.</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <Card>
            <CardHeader>
                <CardTitle>Approved Playlist</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoadingRequests ? (
                     <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Song</TableHead>
                                    <TableHead>Requested By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests && requests.length > 0 ? requests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className='font-medium'>{req.songTitle}</div>
                                            <div className='text-sm text-muted-foreground'>{req.artist}</div>
                                        </TableCell>
                                        <TableCell>{req.requesterName}</TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={2} className="h-24 text-center">
                                            <Music className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <p className='mt-2'>No approved song requests for this event yet.</p>
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
