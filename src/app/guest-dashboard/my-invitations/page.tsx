

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, QrCode } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type Announcement = {
    id: string;
    content: string;
    authorName: string;
    authorRole: string;
    targetGroup: string;
    timestamp: any;
};

const MOCK_GUEST_CATEGORY = 'VIP';
const MOCK_RSVP_STATUS: 'Pending' | 'Accepted' | 'Declined' = 'Pending';


export default function MyInvitationsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<{id: string, code: string, name: string} | null>(null);
  const [guestCode, setGuestCode] = useState<string | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<'Pending' | 'Accepted' | 'Declined'>(MOCK_RSVP_STATUS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const eventId = sessionStorage.getItem('guestEventId');
    const storedGuestCode = sessionStorage.getItem('guestEventCode');
    const eventName = sessionStorage.getItem('guestEventName');
    
    if (eventId && storedGuestCode && eventName) {
        setEventDetails({id: eventId, code: storedGuestCode, name: eventName});
        setGuestCode(storedGuestCode);
        setSelectedEventId(eventId);
    } else if (!user) {
        router.push('/guest-login');
    }
  }, [user, router]);

  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(
        collection(firestore, 'events', selectedEventId, 'announcements'),
        where('targetRoles', 'array-contains-any', ['All Guests', MOCK_GUEST_CATEGORY]),
        orderBy('timestamp', 'desc')
    );
  }, [firestore, selectedEventId]);

  const { data: announcements, isLoading: isLoadingAnnouncements } = useCollection<Announcement>(announcementsQuery);

  const handleRsvp = (status: 'Accepted' | 'Declined') => {
    if (!firestore || !selectedEventId || !guestCode) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the database or find guest ID.' });
        return;
    }
    setIsSubmitting(true);

    const guestRef = doc(firestore, 'events', selectedEventId, 'guests', guestCode);
    const updatedData = { rsvpStatus: status };

    updateDoc(guestRef, updatedData)
      .then(() => {
        setRsvpStatus(status);
        toast({
            title: 'RSVP Submitted',
            description: `You have successfully ${status.toLowerCase()} the invitation.`,
        });
      })
      .catch((error) => {
        console.error("Error updating RSVP:", error);
        const permissionError = new FirestorePermissionError({
            path: guestRef.path,
            operation: 'update',
            requestResourceData: updatedData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => {
          setIsSubmitting(false);
      });
  }
  
  if (!eventDetails) {
      return (
          <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="ml-4">Loading your event details...</p>
          </div>
      )
  }

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome, Guest!</h1>
            <p className="text-muted-foreground">This is your personal dashboard for the event.</p>
        </div>
        <Card className='max-w-md mx-auto'>
            <CardHeader className='text-center items-center'>
                <CardTitle>{eventDetails.name}</CardTitle>
                <div className='p-4 bg-white rounded-lg mt-4'>
                    <QrCode className='h-48 w-48 text-black' />
                </div>
                 <p className='text-sm text-muted-foreground pt-2'>Show this QR code at the entrance for check-in.</p>
                 <Badge variant="outline" className="mt-2">Event Code: {eventDetails.code}</Badge>
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
