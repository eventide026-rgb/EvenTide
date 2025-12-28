
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CarCalendar } from '@/components/car-hire/car-calendar';

export default function CalendarPage() {
  return (
    <div className="space-y-6">
       <Card>
            <CardHeader>
                <CardTitle>Booking Calendar</CardTitle>
                <CardDescription>A visual overview of your confirmed bookings across all your vehicles.</CardDescription>
            </CardHeader>
            <CardContent>
                <CarCalendar />
            </CardContent>
        </Card>
    </div>
  );
}
