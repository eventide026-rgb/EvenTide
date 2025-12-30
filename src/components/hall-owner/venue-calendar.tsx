
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
import { eachDayOfInterval, endOfMonth, format, startOfMonth, isSameDay, getDay, addMonths, subMonths } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { cn } from '@/lib/utils';
import { type Venue } from '../venue-listing-card';
import Link from 'next/link';

type Booking = {
  id: string;
  eventName: string;
  eventDate: any;
  userEmail: string;
};

export function VenueCalendar() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const venuesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'venues'), where('ownerId', '==', user.uid));
  }, [firestore, user]);
  const { data: venues, isLoading: isLoadingVenues } = useCollection<Venue>(venuesQuery);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedVenueId) return null;
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return query(
      collection(firestore, 'venueBookings'),
      where('venueId', '==', selectedVenueId),
      where('status', '==', 'confirmed'),
      where('eventDate', '>=', start),
      where('eventDate', '<=', end)
    );
  }, [firestore, selectedVenueId, currentDate]);
  const { data: bookings, isLoading: isLoadingBookings } = useCollection<Booking>(bookingsQuery);

  if (venues && !selectedVenueId && venues.length > 0) {
    setSelectedVenueId(venues[0].id);
  }

  const selectedVenue = venues?.find(h => h.id === selectedVenueId);
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const isLoading = isUserLoading || isLoadingVenues || (selectedVenueId && isLoadingBookings);

  const getBookingForDay = (day: Date) => {
    return bookings?.find(booking => 
      isSameDay(booking.eventDate.toDate(), day)
    );
  };

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));


  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
         <div className="flex gap-2 w-full md:w-auto">
            <Select onValueChange={setSelectedVenueId} value={selectedVenueId || ''} disabled={isLoadingVenues}>
                <SelectTrigger className="w-full md:w-64">
                    <SelectValue placeholder="Select a venue..." />
                </SelectTrigger>
                <SelectContent>
                    {venues?.map(venue => (
                        <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {selectedVenueId && (
                <Button variant="outline" asChild>
                    <Link href={`/hall-owner-dashboard/my-venues/${selectedVenueId}/edit`}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Venue
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
      ) : selectedVenue ? (
        <TooltipProvider>
        <div className="overflow-x-auto border rounded-lg">
          <div className="grid grid-cols-7 min-w-full">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-center font-semibold p-2 border-b">{day}</div>
            ))}

            {Array.from({ length: getDay(startOfMonth(currentDate)) }).map((_, i) => (
                <div key={`empty-start-${i}`} className="border-r border-b" />
            ))}

            {daysInMonth.map((day, dayIndex) => {
                const booking = getBookingForDay(day);
                return (
                    <div key={day.toISOString()} className="h-28 border-r border-b p-1 flex flex-col">
                        <span className="font-semibold">{format(day, 'd')}</span>
                        {booking && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="bg-primary text-primary-foreground text-xs p-1 rounded-md mt-1 truncate cursor-pointer">
                                        {booking.eventName}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p className="font-bold">{booking.eventName}</p>
                                    <p>{booking.userEmail}</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                )
            })}

            {Array.from({ length: 6 - getDay(endOfMonth(currentDate)) }).map((_, i) => (
                <div key={`empty-end-${i}`} className="border-r border-b" />
            ))}
          </div>
        </div>
        </TooltipProvider>
      ) : (
        <div className="text-center py-16">
            <p className="text-muted-foreground">You have no venues. Create one to get started.</p>
        </div>
      )}
    </div>
  );
}
