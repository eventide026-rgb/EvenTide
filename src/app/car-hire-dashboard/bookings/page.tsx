
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BookingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Car Bookings</CardTitle>
        <CardDescription>View and manage all incoming booking requests for your vehicles.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-16">No booking requests found.</p>
      </CardContent>
    </Card>
  );
}
