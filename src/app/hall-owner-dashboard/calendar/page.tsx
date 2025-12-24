
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CalendarPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Calendar</CardTitle>
        <CardDescription>A visual overview of your confirmed bookings.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Your booking calendar will appear here.</p>
      </CardContent>
    </Card>
  );
}
