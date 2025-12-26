

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, QrCode } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Announcement = {
    id: string;
    content: string;
    authorName: string;
    authorRole: string;
    targetGroup: string;
    timestamp: any;
};

// This is a placeholder. In a real application, the guest's context (including their ID and the event ID)
// would be managed through a secure session or context provider after they log in.
const MOCK_EVENT_ID = 'wTeoD2ZOGxVjHYaKodJS'; // Mock event ID
const MOCK_GUEST_ID = 'YOUR_MOCK_GUEST_ID';   // Mock guest document ID
const MOCK_GUEST_CATEGORY = 'VIP';            // Mock guest category for filtering announcements
const MOCK_RSVP_STATUS: 'Pending' | 'Accepted' | 'Declined' = 'Pending'; // Mock initial RSVP status


export default function MyInvitationsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [rsvpStatus, setRsvpStatus] = useState<'Pending' | 'Accepted' | 'Declined'>(MOCK_RSVP_STATUS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query for announcements targeted at all guests OR the specific guest's category
  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'events', MOCK_EVENT_ID, 'announcements'),
        where('targetRoles', 'array-contains-any', ['All Guests', MOCK_GUEST_CATEGORY]),
        orderBy('timestamp', 'desc')
    );
  }, [firestore]);

  const { data: announcements, isLoading: isLoadingAnnouncements } = useCollection<Announcement>(announcementsQuery);

  const handleRsvp = async (status: 'Accepted' | 'Declined') => {
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the database.' });
        return;
    }
    setIsSubmitting(true);
    // In a real app, MOCK_GUEST_ID would come from the user's session
    const guestRef = doc(firestore, 'events', MOCK_EVENT_ID, 'guests', MOCK_GUEST_ID);

    try {
        await updateDoc(guestRef, { rsvpStatus: status });
        setRsvpStatus(status);
        toast({
            title: 'RSVP Submitted',
            description: `You have successfully ${status.toLowerCase()} the invitation.`,
        });
    } catch (error) {
        console.error("Error updating RSVP:", error);
        toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not update your RSVP status.' });
    } finally {
        setIsSubmitting(false);
    }
  }

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
                    <Button 
                        className='w-full' 
                        variant={rsvpStatus === 'Declined' ? 'destructive' : 'outline'} 
                        onClick={() => handleRsvp('Declined')}
                        disabled={isSubmitting}
                    >
                        <XCircle className='mr-2 h-4 w-4' /> Decline
                    </Button>
                    <Button 
                        className={cn('w-full', rsvpStatus === 'Accepted' && 'bg-green-600 hover:bg-green-700')}
                        onClick={() => handleRsvp('Accepted')}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && rsvpStatus !== 'Accepted' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className='mr-2 h-4 w-4' /> }
                        Accept
                    </Button>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Announcements</CardTitle>
                 <CardDescription>Live updates from the event host.</CardDescription>
            </CardHeader>
            <CardContent>
                 {isLoadingAnnouncements ? (
                    <div className="flex justify-center items-center h-48"><Loader2 className="h-8 w-8 animate-spin" /></div>
                ) : announcements && announcements.length > 0 ? (
                    <ul className="space-y-4">
                        {announcements.map(ann => (
                            <li key={ann.id} className="border p-4 rounded-lg bg-accent/50">
                                <p className="font-medium">{ann.content}</p>
                                <div className="text-xs text-muted-foreground mt-2 flex items-center justify-between">
                                    <span>From {ann.authorName} ({ann.authorRole})</span>
                                    <span>{formatDistanceToNow(ann.timestamp.toDate(), { addSuffix: true })}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='text-center text-muted-foreground py-8'>No announcements yet.</p>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
