
'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type VendorContract = {
  id: string;
  eventId: string;
  eventName: string; // Ideally this is denormalized
  eventDate: any; // Ideally this is denormalized
  status: 'pending' | 'accepted' | 'declined' | 'completed';
};

export default function MyGigsPage() {
  const firestore = useFirestore();
  const { user } = useUser();

  const gigsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collectionGroup(firestore, 'vendorContracts'), where('vendorId', '==', user.uid), where('status', '==', 'accepted'));
  }, [firestore, user?.uid]);

  const { data: gigs, isLoading } = useCollection<VendorContract>(gigsQuery);

  const getGigStatus = (gig: VendorContract) => {
    if (gig.status === 'completed') {
      return <Badge>Completed</Badge>;
    }
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
        <CardDescription>A list of all your active, upcoming, and completed jobs.</CardDescription>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gigs && gigs.length > 0 ? (
                  gigs.map((gig) => (
                    <TableRow key={gig.id}>
                      <TableCell className="font-medium">{gig.eventName || gig.eventId}</TableCell>
                      <TableCell>
                        {gig.eventDate ? format(gig.eventDate.toDate(), 'PPP') : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {getGigStatus(gig)}
                      </TableCell>
                       <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/vendor-dashboard/my-gigs/${gig.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      You have no active gigs. Respond to proposals to get started.
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

    