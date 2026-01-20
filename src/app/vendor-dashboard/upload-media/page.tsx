
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, where } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Film } from 'lucide-react';
import { ImageUploader } from '@/components/image-uploader';

type VendorContract = {
  id: string;
  eventId: string;
  eventName: string;
};

export default function UploadMediaPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const gigsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collectionGroup(firestore, 'vendorContracts'), where('vendorId', '==', user.uid), where('status', '==', 'accepted'));
  }, [firestore, user?.uid]);

  const { data: gigs, isLoading: isLoadingGigs } = useCollection<VendorContract>(gigsQuery);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Upload Media</h1>
        <p className="text-muted-foreground">Deliver your final photos and videos to the client.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: Select Event</CardTitle>
          <CardDescription>Choose the event you are uploading media for.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Event</Label>
          {isLoadingGigs ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select one of your gigs..." />
              </SelectTrigger>
              <SelectContent>
                {gigs?.map((gig) => (
                  <SelectItem key={gig.id} value={gig.eventId}>
                    {gig.eventName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <Card>
            <CardHeader>
                <CardTitle>Step 2: Upload Files</CardTitle>
                <CardDescription>Select a photo to upload. It will be added to the event's shared media library.</CardDescription>
            </CardHeader>
            <CardContent>
                <ImageUploader eventId={selectedEventId} />
            </CardContent>
        </Card>
      )}

      {!selectedEventId && (
        <div className="text-center py-16 border-dashed border-2 rounded-lg">
            <Film className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Please select an event to begin uploading.</p>
        </div>
      )}
    </div>
  );
}

    