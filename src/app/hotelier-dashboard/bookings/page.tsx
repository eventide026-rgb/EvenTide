import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>View and manage all incoming reservation requests for your properties.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Booking requests will appear here.</p>
      </CardContent>
    </Card>
  );
}
