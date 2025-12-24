
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function EditorialAdminDashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Editorial Dashboard</CardTitle>
        <CardDescription>Overview of recent magazine issues and their status.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-16">Magazine issue overview will be here.</p>
      </CardContent>
    </Card>
  );
}
