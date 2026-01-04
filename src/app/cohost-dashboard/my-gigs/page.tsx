'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { format, isFuture, isPast } from 'date-fns';

type CoHostGig = {
  id: string; // eventId
  name: string;
  eventDate: any; // Firestore Timestamp
};

export default function MyGigsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  // This query is simplified. A more robust solution might involve a `cohostAssignments` collection.
  // Here, we query events where the user's ID is a key in the `cohostIds` map.
  const gigsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where(`cohostIds.${user.uid}`, '==', true));
  }, [firestore, user?.uid]);

  const { data: gigs, isLoading } = useCollection<CoHostGig>(gigsQuery);

  const getGigStatus = (gig: CoHostGig) => {
    const eventDate = gig.eventDate?.toDate();
    if (!eventDate) {
      return <Badge variant="outline">Date TBD</Badge>;
    }
    if (isPast(eventDate)) {
      return <Badge variant="secondary">Concluded</Badge>;
    }
    if (isFuture(eventDate)) {
      return <Badge variant="default">Upcoming</Badge>;
    }
    return <Badge>In Progress</Badge>;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Gigs</CardTitle>
        <CardDescription>A list of all your active, upcoming, and completed jobs as a co-host.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gigs && gigs.length > 0 ? (
                  gigs.map((gig) => (
                    <TableRow key={gig.id}>
                      <TableCell className="font-medium">{gig.name}</TableCell>
                      <TableCell>
                        {gig.eventDate ? format(gig.eventDate.toDate(), 'PPP') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getGigStatus(gig)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      You have no active gigs. Respond to invitations to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
