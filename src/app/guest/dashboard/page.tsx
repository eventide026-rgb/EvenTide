
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GuestDashboardPage() {
  return (
    <div className="container py-8">
        <Card>
            <CardHeader>
                <CardTitle>Welcome to the Event!</CardTitle>
                <CardDescription>Your personalized event dashboard will be displayed here.</CardDescription>
            </CardHeader>
        </Card>
    </div>
  );
}
