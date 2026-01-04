'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { ImageUploader } from '@/components/image-uploader';

type Media = {
    id: string;
    fileUrl: string;
    mediaType: 'photo' | 'video';
}

export default function MediaGalleryPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    setEventId(sessionStorage.getItem('guestEventId'));
  }, []);

  const mediaQuery = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return query(collection(firestore, 'events', eventId, 'media'), orderBy('uploadTimestamp', 'desc'));
  }, [firestore, eventId]);

  const { data: media, isLoading: isLoadingMedia } = useCollection<Media>(mediaQuery);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Live Event Gallery</CardTitle>
          <CardDescription>View photos from the event as they happen and upload your own.</CardDescription>
        </CardHeader>
        <CardContent>
            {eventId && <ImageUploader eventId={eventId} />}
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
            <CardTitle>Photo Feed</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingMedia ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : media && media.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {media.map(item => (
                        <div key={item.id} className="aspect-square relative rounded-lg overflow-hidden border">
                            <Image src={item.fileUrl} alt="Event media" fill className="object-cover" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Be the first to share a photo!</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
