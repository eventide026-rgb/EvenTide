
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2, ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { eachDayOfInterval, endOfMonth, format, startOfMonth, isWithinInterval, getDay, addMonths, subMonths } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { type Car } from '@/components/car-listing-card';
import Link from 'next/link';

type Booking = {
  id: string;
  eventName: string;
  pickupDate: any;
  returnDate: any;
  userEmail: string;
};

export function CarCalendar() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const carsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'cars'), where('ownerId', '==', user.uid));
  }, [firestore, user]);
  const { data: cars, isLoading: isLoadingCars } = useCollection<Car>(carsQuery);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedCarId) return null;
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return query(
      collection(firestore, 'carBookings'),
      where('carId', '==', selectedCarId),
      where('status', '==', 'confirmed'),
      where('pickupDate', '<=', end)
    );
  }, [firestore, selectedCarId, currentDate]);

  const { data: bookingsData, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

  const bookings = useMemo(() => {
    if (!bookingsData) return [];
    // Filter bookings that have a return date before the start of the month, as Firestore can't do this complex query.
    const start = startOfMonth(currentDate);
    return bookingsData.filter(b => b.returnDate.toDate() >= start);
  }, [bookingsData, currentDate]);

  if (cars && !selectedCarId && cars.length > 0) {
    setSelectedCarId(cars[0].id);
  }

  const selectedCar = cars?.find(h => h.id === selectedCarId);
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const isLoading = isUserLoading || isLoadingCars || (selectedCarId && isLoadingBookings);

  const getBookingForDay = (day: Date) => {
    return bookings?.find(booking => 
      isWithinInterval(day, { start: booking.pickupDate.toDate(), end: booking.returnDate.toDate() })
    );
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const formatShortWeekday = (date: Date) => {
      const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      return weekdays[getDay(date)];
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
         <div className="flex gap-2 w-full md:w-auto">
            <Select onValueChange={setSelectedCarId} value={selectedCarId || ''} disabled={isLoadingCars}>
                <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Select a vehicle..." />
                </SelectTrigger>
                <SelectContent>
                    {cars?.map(car => (
                        <SelectItem key={car.id} value={car.id}>{car.year} {car.make} {car.model}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {selectedCarId && (
                <Button variant="outline" asChild>
                    <Link href={`/car-hire-dashboard/my-cars/${selectedCarId}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Car
                    </Link>
                </Button>
            )}
         </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}><ChevronLeft/></Button>
            <span className="font-semibold text-lg w-36 text-center">{format(currentDate, 'MMMM yyyy')}</span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}><ChevronRight/></Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : selectedCar ? (
        <TooltipProvider>
        <div className="overflow-x-auto border rounded-lg">
          <div className="grid grid-cols-7 min-w-[800px]">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center font-semibold p-2 border-b">{day}</div>
            ))}

            {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => (
                <div key={`empty-start-${i}`} className="border-r border-b h-24" />
            ))}

            {daysInMonth.map((day) => {
                const booking = getBookingForDay(day);
                return (
                    <div key={day.toISOString()} className="h-24 border-r border-b p-1 flex flex-col">
                        <span className="font-semibold">{format(day, 'd')}</span>
                        {booking && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="bg-primary text-primary-foreground text-xs p-1 rounded-md mt-1 truncate cursor-pointer">
                                        Booked
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">Rented by:</p>
                                    <p>{booking.userEmail}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                )
            })}

            {Array.from({ length: 6 - getDay(endOfMonth(currentDate)) }).map((_, i) => (
                <div key={`empty-end-${i}`} className="border-r border-b h-24" />
            ))}
          </div>
        </div>
        </TooltipProvider>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground">You have no vehicles. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
