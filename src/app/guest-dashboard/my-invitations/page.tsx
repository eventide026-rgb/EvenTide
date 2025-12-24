
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, QrCode } from 'lucide-react';

export default function MyInvitationsPage() {
  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, Guest!</h1>
            <p className="text-muted-foreground">This is your personal dashboard for the event.</p>
        </div>
        <Card className='max-w-md mx-auto'>
            <CardHeader className='text-center items-center'>
                <CardTitle>Adebayo & Funke's Wedding</CardTitle>
                <div className='p-4 bg-white rounded-lg mt-4'>
                    <QrCode className='h-48 w-48 text-black' />
                </div>
                 <p className='text-sm text-muted-foreground pt-2'>Show this QR code at the entrance for check-in.</p>
            </CardHeader>
            <CardContent>
                <div className='flex gap-4'>
                    <Button className='w-full' variant="outline"><XCircle className='mr-2 h-4 w-4' /> Decline</Button>
                    <Button className='w-full'><CheckCircle className='mr-2 h-4 w-4' /> Accept</Button>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Announcements</CardTitle>
                 <CardDescription>Live updates from the event host.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className='text-center text-muted-foreground py-8'>No announcements yet.</p>
            </CardContent>
        </Card>
    </div>
  );
}
