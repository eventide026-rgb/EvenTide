
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, documentId } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Music } from 'lucide-react';
import { Label } from '@/components/ui/label';

type EventPlannerAssignment = {
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

export default function SongRequestsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const plannerAssignmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'planners', user.uid, 'assignments'));
  }, [firestore, user?.uid]);
  const { data: assignments, isLoading: isLoadingAssignments } = useCollection<EventPlannerAssignment>(plannerAssignmentsQuery);
  const eventIds = useMemo(() => assignments?.map(a => a.eventId) || [], [assignments]);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || eventIds.length === 0) return null;
    return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
  }, [firestore, eventIds]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);


  const requestsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'songRequests'));
  }, [firestore, selectedEventId]);

  const { data: requests, isLoading: isLoadingRequests } = useCollection<SongRequest>(requestsQuery);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!firestore || !selectedEventId) return;
    const requestRef = doc(firestore, 'events', selectedEventId, 'songRequests', requestId);
    try {
      await updateDoc(requestRef, { status });
      toast({
        title: 'Request Updated',
        description: `The song has been ${status}.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the song request.',
      });
    }
  };

  const getStatusBadge = (status: SongRequest['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const isLoading = isUserLoading || isLoadingEvents || isLoadingAssignments;

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Song Request Moderation</CardTitle>
          <CardDescription>Approve or reject song requests from guests for your event.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Select an Event</Label>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select an event to manage its song requests" />
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
            <CardHeader>
                <CardTitle>Request Queue</CardTitle>
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
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
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
                                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'pending' && (
                                                <div className='flex gap-2 justify-end'>
                                                    <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleUpdateStatus(req.id, 'approved')}>
                                                        <Check className='h-4 w-4' />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleUpdateStatus(req.id, 'rejected')}>
                                                        <X className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Music className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <p className='mt-2'>No song requests for this event yet.</p>
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
