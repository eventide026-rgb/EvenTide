
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function OfficePage() {
  return (
    <div className="flex flex-col gap-8">
       <div>
            <h1 className="text-3xl font-bold font-headline">The Office</h1>
            <p className="text-muted-foreground">Core command center for platform management.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Administrative Staff Management</CardTitle>
                <CardDescription>View and manage all administrative roles on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-8">Admin staff management table will be here.</p>
            </CardContent>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5" />
                    Danger Zone
                </CardTitle>
                <CardDescription>High-impact, irreversible platform-wide actions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-destructive bg-destructive/10 p-4">
                    <div>
                        <h3 className="font-semibold">Force-Revoke All Sessions</h3>
                        <p className="text-sm text-destructive/80">Immediately invalidates all active user login sessions across the platform. Use only in case of a security incident.</p>
                    </div>
                    <Button variant="destructive">Revoke All Sessions</Button>
                </div>
            </CardContent>
        </Card>

    </div>
  );
}
