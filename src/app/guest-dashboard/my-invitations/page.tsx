

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, QrCode } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

type Announcement = {
    id: string;
    content: string;
    authorName: string;
    authorRole: string;
    targetGroup: string;
    timestamp: any;
};

type Guest = {
    id: string;
    rsvpStatus: 'Pending' | 'Accepted' | 'Declined';
    category: string;
}

export default function MyInvitationsPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This will be populated from session storage or a similar mechanism
  const [eventDetails, setEventDetails] = useState<{id: string, code: string, name: string} | null>(null);
  const [guestCode, setGuestCode] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, you would get this from a secure context after login.
    // For now, we'll retrieve it from session storage for demonstration.
    const eventId = sessionStorage.getItem('guestEventId');
    const storedGuestCode = sessionStorage.getItem('guestEventCode');
    const eventName = sessionStorage.getItem('guestEventName');
    
    if (eventId && storedGuestCode && eventName) {
        setEventDetails({id: eventId, code: storedGuestCode, name: eventName});
        setGuestCode(storedGuestCode);
    } else if (!user) {
        // If there's no user and no session data, they probably shouldn't be here.
        router.push('/guest-login');
    }
  }, [user, router]);
  
  const guestRef = useMemoFirebase(() => {
    if (!firestore || !eventDetails?.id || !guestCode) return null;
    return doc(firestore, 'events', eventDetails.id, 'guests', guestCode);
  }, [firestore, eventDetails?.id, guestCode]);

  const { data: guestData, isLoading: isLoadingGuest } = useDoc<Guest>(guestRef);
  const rsvpStatus = guestData?.rsvpStatus || 'Pending';

  // Query for announcements targeted at all guests OR the specific guest's category
  const announcementsQuery = useMemoFirebase(() => {
    if (!firestore || !eventDetails?.id || !guestData?.category) return null;
    return query(
        collection(firestore, 'events', eventDetails.id, 'announcements'),
        where('targetRoles', 'array-contains-any', ['All Guests', guestData.category]),
        orderBy('timestamp', 'desc')
    );
  }, [firestore, eventDetails?.id, guestData?.category]);

  const { data: announcements, isLoading: isLoadingAnnouncements } = useCollection<Announcement>(announcementsQuery);

  const handleRsvp = async (status: 'Accepted' | 'Declined') => {
    if (!guestRef) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to the database.' });
        return;
    }
    setIsSubmitting(true);
    try {
        await updateDoc(guestRef, { rsvpStatus: status });
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
  
  if (!eventDetails || isLoadingGuest) {
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
                 <Badge variant="outline" className="mt-2">Guest Code: {eventDetails.code}</Badge>
            </CardHeader>
            <CardContent>
                <div className='flex gap-4'>
                    <Button 
                        className='w-full' 
                        variant={rsvpStatus === 'Declined' ? 'destructive' : 'outline'} 
                        onClick={() => handleRsvp('Declined')}
                        disabled={isSubmitting || rsvpStatus === 'Declined'}
                    >
                        <XCircle className='mr-2 h-4 w-4' /> Decline
                    </Button>
                    <Button 
                        className={cn('w-full', rsvpStatus === 'Accepted' && 'bg-green-600 hover:bg-green-700')}
                        onClick={() => handleRsvp('Accepted')}
                        disabled={isSubmitting || rsvpStatus === 'Accepted'}
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className='mr-2 h-4 w-4' /> }
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
