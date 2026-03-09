
'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { type Venue } from './venue-listing-card';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type VenueBookingDialogProps = {
  venue: Venue;
  user: User | null;
  isUserLoading: boolean;
};

export function VenueBookingDialog({ venue, user, isUserLoading }: VenueBookingDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [eventName, setEventName] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);

  // Fetch the user's profile to get their phone number for notifications
  const userProfileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile } = useDoc<any>(userProfileRef);

  const handleBooking = async () => {
    if (!firestore || !user || !eventDate || !eventName) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all fields and ensure you are logged in.' });
      return;
    }
    setIsLoading(true);

    const bookingData = {
      venueId: venue.id,
      venueOwnerId: venue.ownerId,
      userId: user.uid,
      userEmail: user.email,
      userPhone: userProfile?.phoneNumber || user?.phoneNumber || null,
      venueName: venue.name,
      eventName,
      eventDate: eventDate,
      numberOfGuests,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };
    
    try {
      const batch = writeBatch(firestore);

      const venueBookingsCol = collection(firestore, 'venueBookings');
      const topLevelBookingRef = doc(venueBookingsCol);
      batch.set(topLevelBookingRef, {...bookingData, id: topLevelBookingRef.id});

      await batch.commit();

      toast({
        title: 'Booking Request Sent!',
        description: 'The venue owner has been notified. You will receive an update on your request shortly.',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating venue booking:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'There was an error sending your booking request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderBookingButton = () => {
    if (isUserLoading) {
      return <Button disabled className="w-full">Loading...</Button>;
    }
  
    if (!user) {
      return (
        <Button onClick={() => router.push(`/login?redirect=/resources/venues/${venue.id}`)} className="w-full">
          Login to Book
        </Button>
      );
    }
    return (
        <DialogTrigger asChild>
            <Button className="w-full">Request to Book</Button>
        </DialogTrigger>
    )
  }


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {renderBookingButton()}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Request to Book {venue.name}</DialogTitle>
          <DialogDescription>
            Confirm your event details to send a booking request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="space-y-2">
            <Label htmlFor="eventName">Event Name</Label>
            <Input
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g., My Awesome Wedding"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eventDate">Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="eventDate"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={setEventDate}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfGuests">Number of Guests</Label>
            <Input
              id="numberOfGuests"
              type="number"
              min={1}
              max={venue.capacity}
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(Number(e.target.value))}
            />
             <p className="text-xs text-muted-foreground">Max capacity: {venue.capacity}</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleBooking} disabled={isLoading || !eventDate || !eventName}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Requesting...' : 'Request to Book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
