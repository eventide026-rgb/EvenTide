
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, QrCode, Upload, Sparkles, PartyPopper } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, where, orderBy, doc, updateDoc, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { Loader2 } from 'lucide-react';
import { formatDistanceToNow, isPast, addHours } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { generateThankYouNote } from '@/ai/flows/generate-thank-you-note';
import { Textarea } from '@/components/ui/textarea';

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
    name: string;
    rsvpStatus: 'Pending' | 'Accepted' | 'Declined';
    category: string;
}

type Event = {
    id: string;
    name: string;
    eventDate: Timestamp;
}

export default function MyInvitationsPage() {
  const firestore = useFirestore();
  const storage = getStorage();
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [thankYouNote, setThankYouNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [eventDetails, setEventDetails] = useState<{id: string, code: string, name: string} | null>(null);
  const [guestCode, setGuestCode] = useState<string | null>(null);

  useEffect(() => {
    const eventId = sessionStorage.getItem('guestEventId');
    const storedGuestCode = sessionStorage.getItem('guestEventCode');
    const eventName = sessionStorage.getItem('guestEventName');
    
    if (eventId && storedGuestCode && eventName) {
        setEventDetails({id: eventId, code: storedGuestCode, name: eventName});
        setGuestCode(storedGuestCode);
    } else if (!user) {
        router.push('/guest-login');
    }
  }, [user, router]);
  
  const guestRef = useMemoFirebase(() => {
    if (!firestore || !eventDetails?.id || !guestCode) return null;
    return doc(firestore, 'events', eventDetails.id, 'guests', guestCode);
  }, [firestore, eventDetails?.id, guestCode]);

  const { data: guestData, isLoading: isLoadingGuest } = useDoc<Guest>(guestRef);
  const rsvpStatus = guestData?.rsvpStatus || 'Pending';

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventDetails?.id) return null;
    return doc(firestore, 'events', eventDetails.id);
  }, [firestore, eventDetails?.id]);
  const { data: eventData } = useDoc<Event>(eventRef);

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

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !eventDetails || !user) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
        const dataUrl = reader.result as string;
        const storageRef = ref(storage, `events/${eventDetails.id}/media/${user.uid}/${Date.now()}_${file.name}`);

        try {
            const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
            const downloadURL = await getDownloadURL(snapshot.ref);

            await addDoc(collection(firestore, 'events', eventDetails.id, 'media'), {
                fileUrl: downloadURL,
                uploaderId: user.uid,
                uploaderName: guestData?.name || 'Guest',
                mediaType: file.type.startsWith('video') ? 'video' : 'photo',
                uploadTimestamp: serverTimestamp(),
            });

            toast({
                title: 'Upload Successful!',
                description: 'Your moment has been shared with the event gallery.',
            });
        } catch (error) {
            console.error("Upload error:", error);
            toast({ variant: 'destructive', title: 'Upload Failed' });
        } finally {
            setIsUploading(false);
        }
    };
  };

  const handleGenerateThankYou = async () => {
      if (!eventData || !guestData) return;
      setIsGeneratingNote(true);
      try {
          const result = await generateThankYouNote({
              guestName: guestData.name,
              eventName: eventData.name,
              eventType: "event" // A generic eventType for the prompt
          });
          setThankYouNote(result.note);
      } catch (error) {
          console.error(error);
          toast({ variant: 'destructive', title: 'AI Generation Failed' });
      } finally {
          setIsGeneratingNote(false);
      }
  }

  const showThankYouCard = eventData && isPast(addHours(eventData.eventDate.toDate(), 24));
  
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
            <h1 className="text-3xl font-bold font-headline">Welcome, {guestData?.name || 'Guest'}!</h1>
            <p className="text-muted-foreground">This is your personal dashboard for the event.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className='max-w-md mx-auto lg:col-span-1 md:col-span-2'>
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

            <div className="md:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Share Your Moments</CardTitle>
                        <CardDescription>Upload photos to the live event gallery.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*,video/*" className="hidden" />
                        <Button className="w-full" onClick={handleFileSelect} disabled={isUploading}>
                            {isUploading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Upload className='mr-2 h-4 w-4' />}
                            {isUploading ? 'Uploading...' : 'Upload Photo/Video'}
                        </Button>
                    </CardContent>
                </Card>
                {showThankYouCard && (
                    <Card className="bg-primary/10 border-primary">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><PartyPopper/> A Note of Thanks</CardTitle>
                            <CardDescription>The event has concluded. Use Eni to help you write a thank you note to the hosts!</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button className="w-full" onClick={handleGenerateThankYou} disabled={isGeneratingNote}>
                                {isGeneratingNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                {isGeneratingNote ? 'Eni is writing...' : 'Generate with Eni'}
                            </Button>
                             {thankYouNote && (
                                <Textarea value={thankYouNote} rows={6} readOnly className="bg-background"/>
                             )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
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
