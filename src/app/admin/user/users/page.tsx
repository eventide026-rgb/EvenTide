
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function UserManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View all users and manage their roles on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center py-16">User management table will be displayed here.</p>
      </CardContent>
    </Card>
  );
}
