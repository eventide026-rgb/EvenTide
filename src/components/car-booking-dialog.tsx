
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
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { type Car } from '@/components/car-listing-card';


type CarBookingDialogProps = {
  car: Car;
  user: User | null;
  isUserLoading: boolean;
};

export function CarBookingDialog({ car, user, isUserLoading }: CarBookingDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const days = dateRange?.from && dateRange?.to ? differenceInDays(dateRange.to, dateRange.from) + 1 : 0;
  const totalPrice = days * car.pricePerDay;

  const handleBooking = async () => {
    if (!firestore || !user || !dateRange?.from || !dateRange?.to) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select dates and ensure you are logged in.' });
      return;
    }
    setIsLoading(true);

    const bookingData = {
      carId: car.id,
      carOwnerId: car.ownerId,
      userId: user.uid,
      userEmail: user.email,
      carName: `${car.year} ${car.make} ${car.model}`,
      pickupDate: dateRange.from,
      returnDate: dateRange.to,
      totalPrice,
      status: 'pending' as const,
      createdAt: serverTimestamp(),
    };
    
    try {
      // Create in root collection for owner queries
      await addDoc(collection(firestore, 'carBookings'), bookingData);

      toast({
        title: 'Booking Request Sent!',
        description: 'The service provider has been notified. You will receive an update on your request shortly.',
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating car booking:', error);
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
        <Button onClick={() => router.push(`/login?redirect=/resources/cars/${car.id}`)} className="w-full">
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
          <DialogTitle>Book {car.make} {car.model}</DialogTitle>
          <DialogDescription>
            Confirm your dates for this rental.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="space-y-2">
            <Label htmlFor="dates">Pickup & Return Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dates"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
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

          {days > 0 && (
             <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">₦{car.pricePerDay.toLocaleString()} x {days} days</span>
                    <span className="font-semibold">₦{totalPrice.toLocaleString()}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-right">Total rental price</p>
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
