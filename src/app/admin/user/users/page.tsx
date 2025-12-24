
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserManagementTable } from '@/components/admin/user-management-table';

export default function UserManagementPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View all users and manage their roles on the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <UserManagementTable />
      </CardContent>
    </Card>
  );
}
