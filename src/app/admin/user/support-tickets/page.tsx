
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SupportTicketsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>View and manage all user-submitted support requests.</CardDescription>
      </CardHeader>
      <CardContent>
         <p className="text-muted-foreground text-center py-16">Support tickets queue will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
