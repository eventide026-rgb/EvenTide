
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SupportTicketsTable } from '@/components/admin/support-tickets-table';

export default function SupportTicketsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support Tickets</CardTitle>
        <CardDescription>View and manage all user-submitted support requests.</CardDescription>
      </Header>
      <CardContent>
         <SupportTicketsTable />
      </CardContent>
    </Card>
  );
}
