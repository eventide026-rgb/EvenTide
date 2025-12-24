'use client';

import { useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
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

type Booking = {
  id: string;
  userId: string;
  hotelId: string;
  roomTypeName: string;
  checkInDate: any;
  checkOutDate: any;
  numberOfGuests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'declined';
};

export default function BookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Query for bookings where the hotelOwnerId matches the current user's UID
    return query(collection(firestore, 'bookings'), where('hotelOwnerId', '==', user.uid));
  }, [firestore, user]);

  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

  const handleUpdateStatus = async (bookingId: string, newStatus: 'confirmed' | 'declined') => {
    if (!firestore) return;
    const bookingRef = doc(firestore, 'bookings', bookingId);
    try {
      await updateDoc(bookingRef, { status: newStatus });
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>View and manage all incoming reservation requests for your properties.</CardDescription>
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
                <TableHead>Hotel</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.hotelId}</TableCell>
                  <TableCell>{booking.roomTypeName}</TableCell>
                  <TableCell>
                    {format(booking.checkInDate.toDate(), 'PPP')} - {format(booking.checkOutDate.toDate(), 'PPP')}
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
                        <Button size="sm" onClick={() => handleUpdateStatus(booking.id, 'confirmed')}>Confirm</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(booking.id, 'declined')}>Decline</Button>
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
