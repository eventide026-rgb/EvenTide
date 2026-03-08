
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, collectionGroup, documentId } from 'firebase/firestore';
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

type VendorGig = {
  id: string;
  eventId: string;
  eventName: string;
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
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Fetch gigs where the vendor has an accepted contract
  const gigsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
        collectionGroup(firestore, 'vendorContracts'), 
        where('vendorId', '==', user.uid),
        where('status', '==', 'accepted')
    );
  }, [firestore, user?.uid]);

  const { data: gigs, isLoading: isLoadingGigs } = useCollection<VendorGig>(gigsQuery);

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
        title: `Song ${status === 'approved' ? 'Accepted' : 'Rejected'}`,
        description: 'The guest will see the update in their portal.',
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ variant: 'destructive', title: 'Update Failed' });
    }
  };

  const getStatusBadge = (status: SongRequest['status']) => {
    switch (status) {
      case 'approved': return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };
  
  const isLoading = isUserLoading || isLoadingGigs;

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>DJ Command Center</CardTitle>
          <CardDescription>Manage live song requests from event attendees.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Select Active Event</Label>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin mt-2" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2 mt-2">
                <SelectValue placeholder="Choose an event to manage requests" />
              </SelectTrigger>
              <SelectContent>
                {gigs && gigs.length > 0 ? (
                  gigs.map((gig) => (
                    <SelectItem key={gig.id} value={gig.eventId}>
                      {gig.eventName || `Event ${gig.eventId.substring(0,6)}`}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-events" disabled>No active gigs found.</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Music className="h-5 w-5 text-primary"/> Live Request Queue</CardTitle>
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
                                    <TableHead>Song Details</TableHead>
                                    <TableHead>Guest</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {requests && requests.length > 0 ? requests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell>
                                            <div className='font-medium'>{req.songTitle}</div>
                                            <div className='text-xs text-muted-foreground'>{req.artist}</div>
                                        </TableCell>
                                        <TableCell className="text-sm font-semibold text-primary">{req.requesterName}</TableCell>
                                        <TableCell>{getStatusBadge(req.status)}</TableCell>
                                        <TableCell className="text-right">
                                            {req.status === 'pending' && (
                                                <div className='flex gap-2 justify-end'>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdateStatus(req.id, 'approved')}>
                                                        <Check className='h-4 w-4' />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleUpdateStatus(req.id, 'rejected')}>
                                                        <X className='h-4 w-4' />
                                                    </Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Music className="mx-auto h-12 w-12 text-muted-foreground/20" />
                                            <p className='mt-2 text-muted-foreground'>The queue is currently empty.</p>
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
