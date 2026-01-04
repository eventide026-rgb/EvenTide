
'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, writeBatch, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

type VenueBooking = {
  id: string;
  userId: string;
  venueId: string;
  venueName: string;
  eventName: string;
  eventDate: any;
  numberOfGuests: number;
  status: 'pending' | 'confirmed' | 'declined';
  userEmail: string;
};

export default function BookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'venueBookings'), where('venueOwnerId', '==', user.uid));
  }, [firestore, user]);

  const { data: bookings, isLoading: isLoadingBookings, error } = useCollection<VenueBooking>(bookingsQuery);

  const handleUpdateStatus = async (booking: VenueBooking, newStatus: 'confirmed' | 'declined') => {
    if (!firestore) return;
    
    const batch = writeBatch(firestore);
    
    const topLevelBookingRef = doc(firestore, 'venueBookings', booking.id);
    batch.update(topLevelBookingRef, { status: newStatus });
    
    try {
      await batch.commit();
      toast({
        title: 'Booking Updated',
        description: `The booking has been ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update the booking status. Please try again.',
      });
    }
  };

  const isLoading = isUserLoading || isLoadingBookings;

  if (error) {
    console.error(error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Venue Bookings</CardTitle>
        <CardDescription>View and manage all incoming booking requests for your venues.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!isLoading && bookings && bookings.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Venue</TableHead>
                <TableHead>Client Email</TableHead>
                <TableHead>Event Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.eventName}</TableCell>
                  <TableCell>{booking.venueName}</TableCell>
                  <TableCell>{booking.userEmail}</TableCell>
                  <TableCell>
                    {booking.eventDate?.toDate ? format(booking.eventDate.toDate(), 'PPP') : 'Invalid Date'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      booking.status === 'confirmed' ? 'default' :
                      booking.status === 'declined' ? 'destructive' : 'outline'
                    }>
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.status === 'pending' && (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" onClick={() => handleUpdateStatus(booking, 'confirmed')}>Confirm</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(booking, 'declined')}>Decline</Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && (!bookings || bookings.length === 0) && (
          <p className="text-muted-foreground text-center py-16">No booking requests found.</p>
        )}
      </CardContent>
    </Card>
  );
}
