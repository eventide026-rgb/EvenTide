
'use client';

import { useState } from 'react';
import { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
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
import { type Hotel, type RoomType } from './hotel-listing-card';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';

type BookingDialogProps = {
  hotel: Hotel;
  roomType: RoomType;
  user: User | null;
  isUserLoading: boolean;
};

export function BookingDialog({ hotel, roomType, user, isUserLoading }: BookingDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);

  const nights = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) : 0;
  const totalPrice = nights * roomType.price;

  const handleBooking = async () => {
    if (!firestore || !user || !dateRange?.from || !dateRange?.to) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select dates and ensure you are logged in.' });
      return;
    }
    setIsLoading(true);

    const bookingData = {
      hotelId: hotel.id,
      hotelOwnerId: hotel.ownerId,
      userId: user.uid,
      userEmail: user.email,
      hotelName: hotel.name,
      roomTypeName: roomType.name,
      checkInDate: dateRange.from,
      checkOutDate: dateRange.to,
      numberOfGuests: guests,
      totalPrice,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };
    
    try {
      await addDoc(collection(firestore, 'bookings'), bookingData);

      toast({
        title: 'Booking Request Sent!',
        description: 'The hotelier has been notified. You will receive an update on your request shortly.',
      });
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'There was an error sending your booking request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading) {
    return <Button disabled>Loading...</Button>;
  }

  if (!user) {
    return (
      <Button onClick={() => router.push(`/login?redirect=/resources/hotels/${hotel.id}`)}>
        Login to Book
      </Button>
    );
  }

  const resetForm = () => {
      setDateRange(undefined);
      setGuests(1);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Book Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {roomType.name}</DialogTitle>
          <DialogDescription>
            Confirm your dates and details for your stay at {hotel.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dates" className="text-right">
              Dates
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dates"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal col-span-3",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick your dates</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="guests" className="text-right">
              Guests
            </Label>
            <Input
              id="guests"
              type="number"
              min={1}
              max={roomType.capacity}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          {nights > 0 && (
             <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">₦{roomType.price.toLocaleString()} x {nights} nights</span>
                    <span className="font-semibold">₦{totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">Total before taxes and fees</p>
             </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleBooking} disabled={isLoading || !dateRange?.from || !dateRange.to}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Requesting...' : 'Request to Book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
