
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VenueCalendar } from '@/components/hall-owner/venue-calendar';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
       <Card>
            <CardHeader>
                <CardTitle>Booking Calendar</CardTitle>
                <CardDescription>A visual overview of your confirmed bookings across all your properties.</CardDescription>
            </CardHeader>
            <CardContent>
                <VenueCalendar />
            </CardContent>
        </Card>
    </div>
  );
}
