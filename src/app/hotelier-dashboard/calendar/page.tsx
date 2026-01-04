
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HotelCalendar } from '@/components/hotelier/hotel-calendar';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
       <Card>
            <CardHeader>
                <CardTitle>Booking Calendar</CardTitle>
                <CardDescription>A visual overview of your confirmed bookings across all your properties.</CardDescription>
            </CardHeader>
            <CardContent>
                <HotelCalendar />
            </CardContent>
        </Card>
    </div>
  );
}

