
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ContentAdminDashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Landing Page Management</CardTitle>
        <CardDescription>Edit the main headline and sub-headline of the homepage's hero section.</CardDescription>
      </CardHeader>
      <CardContent>
         <p className="text-muted-foreground text-center py-16">Landing page content editing form will be here.</p>
      </CardContent>
    </Card>
  );
}
