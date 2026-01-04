'use client';

import { useState, useMemo } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { curateGalleryPage } from '@/ai/flows/curate-gallery-page';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

type Event = {
  id: string;
  name: string;
  eventType: string;
  ownerId: string;
  curatedGalleries?: { id: string, title: string, imageUrls: string[] }[];
};

type Media = {
    id: string;
    fileUrl: string;
    mediaType: 'photo' | 'video';
}

export default function MediaLibraryPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isCurating, setIsCurating] = useState(false);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const selectedEventRef = useMemoFirebase(() => {
      if (!firestore || !selectedEventId) return null;
      return doc(firestore, 'events', selectedEventId);
  }, [firestore, selectedEventId])
  const { data: selectedEvent } = useDoc<Event>(selectedEventRef);
  
  const mediaQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'media'), where('mediaType', '==', 'photo'));
  }, [firestore, selectedEventId]);
  const { data: media, isLoading: isLoadingMedia } = useCollection<Media>(mediaQuery);

  const handleCurate = async () => {
    if (!media || media.length < 5 || !selectedEvent || !selectedEventRef) {
        toast({
            variant: "destructive",
            title: 'Curation Failed',
            description: 'You need at least 5 photos in the library to use this feature.',
        });
        return;
    }
    setIsCurating(true);
    try {
        const result = await curateGalleryPage({
            eventName: selectedEvent.name,
            eventType: selectedEvent.eventType,
            imageUrls: media.map(m => m.fileUrl),
        });

        const newGallery = {
            id: uuidv4(),
            ...result,
        };

        await updateDoc(selectedEventRef, {
            curatedGalleries: arrayUnion(newGallery)
        });

        toast({
            title: 'Gallery Curated!',
            description: `Eni has created a new collection: "${result.title}"`,
        });

    } catch (error) {
        console.error("Curation error:", error);
        toast({ variant: 'destructive', title: 'AI Curation Failed' });
    } finally {
        setIsCurating(false);
    }
  }

  const isLoading = isLoadingEvents || (selectedEventId && isLoadingMedia);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Media Library</CardTitle>
          <CardDescription>
            View all uploaded media from your event and use AI to create curated galleries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Select an Event</Label>
            <div className="flex items-start md:items-center md:justify-between flex-col md:flex-row gap-4">
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select an event to view its media" />
              </SelectTrigger>
              <SelectContent>
                {events?.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCurate} disabled={isCurating || !selectedEventId || !media || media.length < 5}>
                {isCurating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                {isCurating ? "Eni is working..." : "Curate with Eni"}
            </Button>
            </div>
        </CardContent>
      </Card>

      {selectedEvent?.curatedGalleries && selectedEvent.curatedGalleries.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Curated Galleries by Eni</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedEvent.curatedGalleries.map(gallery => (
                    <div key={gallery.id}>
                        <h3 className="font-bold text-lg mb-2">{gallery.title}</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            {gallery.imageUrls.map(url => (
                                <div key={url} className="aspect-square relative rounded-md overflow-hidden">
                                    <Image src={url} alt="Curated photo" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
              </CardContent>
          </Card>
      )}

      {selectedEventId && (
        <Card>
            <CardHeader>
                <CardTitle>Raw Media Feed</CardTitle>
                <CardDescription>All photos uploaded by guests and vendors.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : media && media.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {media.map(item => (
                            <div key={item.id} className="aspect-square relative rounded-lg overflow-hidden border">
                                <Image src={item.fileUrl} alt="Event media" fill className="object-cover" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-dashed border-2 rounded-lg">
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-muted-foreground">No photos have been uploaded for this event yet. Guests can start uploading from their dashboard!</p>
                    </div>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
