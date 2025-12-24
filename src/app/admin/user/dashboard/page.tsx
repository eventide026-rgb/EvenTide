
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, FileQuestion } from 'lucide-react';

export default function UserAdminDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">User Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users and provide support.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Users /> User Console</CardTitle>
                    <CardDescription>View, search, and manage roles for all non-administrative users on the platform.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                    <Button asChild>
                        <Link href="/admin/user/users">Go to User Console</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileQuestion /> Support Tickets</CardTitle>
                    <CardDescription>View, track, and manage all user-submitted support requests and inquiries.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow flex items-end">
                    <Button asChild>
                        <Link href="/admin/user/support-tickets">Go to Ticket Queue</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
