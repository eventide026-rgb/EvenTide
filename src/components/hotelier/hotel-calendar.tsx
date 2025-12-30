
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { type Hotel, type RoomType } from '../hotel-listing-card';

type Booking = {
  id: string;
  roomTypeName: string;
  checkInDate: any;
  checkOutDate: any;
  userEmail: string;
};

export function HotelCalendar() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const hotelsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'hotels'), where('ownerId', '==', user.uid));
  }, [firestore, user]);
  const { data: hotels, isLoading: isLoadingHotels } = useCollection<Hotel>(hotelsQuery);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedHotelId) return null;
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return query(
      collection(firestore, 'bookings'),
      where('hotelId', '==', selectedHotelId),
      where('status', '==', 'confirmed'),
      where('checkInDate', '<=', end),
      where('checkOutDate', '>=', start)
    );
  }, [firestore, selectedHotelId, currentDate]);
  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

  if (hotels && !selectedHotelId && hotels.length > 0) {
    setSelectedHotelId(hotels[0].id);
  }

  const selectedHotel = hotels?.find(h => h.id === selectedHotelId);
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const isLoading = isUserLoading || isLoadingHotels || (selectedHotelId && isLoadingBookings);

  const isDayBooked = (room: RoomType, day: Date) => {
    return bookings?.find(booking => 
      booking.roomTypeName === room.name &&
      isWithinInterval(day, { start: booking.checkInDate.toDate(), end: booking.checkOutDate.toDate() })
    );
  };
  
  const getBookingForDay = (room: RoomType, day: Date) => {
    return bookings?.find(booking => 
      booking.roomTypeName === room.name &&
      isWithinInterval(day, { start: booking.checkInDate.toDate(), end: booking.checkOutDate.toDate() })
    );
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));


  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
         <Select onValueChange={setSelectedHotelId} value={selectedHotelId || ''} disabled={isLoadingHotels}>
            <SelectTrigger className="w-full md:w-1/3">
                <SelectValue placeholder="Select a hotel..." />
            </SelectTrigger>
            <SelectContent>
                {hotels?.map(hotel => (
                    <SelectItem key={hotel.id} value={hotel.id}>{hotel.name}</SelectItem>
                ))}
            </SelectContent>
        </Select>
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
      ) : selectedHotel ? (
        <TooltipProvider>
        <div className="overflow-x-auto border rounded-lg">
          <div className="grid grid-flow-col auto-cols-min min-w-full">
             <div className="sticky left-0 bg-background z-10 border-r">
                <div className="h-12 border-b flex items-center px-2 font-semibold">Room</div>
                 {selectedHotel.roomTypes.map(room => (
                    <div key={room.name} className="h-12 border-b flex items-center px-2 truncate">
                        <span className="font-semibold">{room.name}</span>
                    </div>
                ))}
            </div>
            {daysInMonth.map((day, dayIndex) => (
              <div key={day.toISOString()} className={cn("text-center", (getDay(day) === 0 || getDay(day) === 6) && 'bg-muted/50' )}>
                <div className="h-12 border-b flex flex-col items-center justify-center p-1">
                    <span className="text-xs">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][getDay(day)]}</span>
                    <span className="font-bold text-lg">{format(day, 'd')}</span>
                </div>
                {selectedHotel.roomTypes.map(room => {
                    const booking = getBookingForDay(room, day);
                    return (
                        <div key={`${room.name}-${dayIndex}`} className="h-12 border-b flex items-center justify-center">
                            {booking ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="h-full w-full bg-primary/20 cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">Booked</p>
                                        <p>{booking.userEmail}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : null}
                        </div>
                    );
                })}
              </div>
            ))}
          </div>
        </div>
        </TooltipProvider>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground">You have no hotels. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
