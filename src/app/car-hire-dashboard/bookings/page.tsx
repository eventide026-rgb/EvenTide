
'use client';

import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
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

type CarBooking = {
  id: string;
  carId: string;
  carName: string;
  pickupDate: any;
  returnDate: any;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'declined';
  userEmail: string;
  userPhone?: string;
};

export default function BookingsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'carBookings'), where('carOwnerId', '==', user.uid));
  }, [firestore, user]);

  const { data: bookings, isLoading: isLoadingBookings, error } = useCollection<CarBooking>(bookingsQuery);

  const handleUpdateStatus = async (bookingId: string, newStatus: 'confirmed' | 'declined') => {
    if (!firestore) return;
    
    const bookingRef = doc(firestore, 'carBookings', bookingId);
    
    try {
      await updateDoc(bookingRef, { status: newStatus });

      // Trigger Unified Tri-Channel Notification on Confirmation
      const booking = bookings?.find(b => b.id === bookingId);
      if (newStatus === 'confirmed' && booking) {
          fetch('/api/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  email: booking.userEmail,
                  phone: booking.userPhone,
                  templateId: 'BOOKING_CONFIRMED',
                  templateData: {
                      recipientName: 'Valued Client',
                      eventName: booking.carName,
                      eventDate: `${format(booking.pickupDate.toDate(), 'MMMM d')} to ${format(booking.returnDate.toDate(), 'MMMM d')}`
                  }
              }),
          }).catch(err => console.error("Post-confirmation notification failed:", err));
      }

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
        <CardTitle>Car Bookings</CardTitle>
        <CardDescription>View and manage all incoming booking requests for your vehicles.</CardDescription>
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
                <TableHead>Vehicle</TableHead>
                <TableHead>Client Email</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.carName}</TableCell>
                   <TableCell>{booking.userEmail}</TableCell>
                  <TableCell>
                    {booking.pickupDate?.toDate ? format(booking.pickupDate.toDate(), 'PPP') : 'N/A'} - {booking.returnDate?.toDate ? format(booking.returnDate.toDate(), 'PPP') : 'N/A'}
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
