
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  curateCommunityMagazine,
  type MagazineCurationOutput,
} from '@/ai/flows/curate-community-magazine';
import { MagazinePreview } from '@/components/admin/magazine-preview';

type Event = {
    id: string;
    name: string;
    description: string;
    eventDate: any;
    eventType: string;
};

export default function MagazineCurationPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [magazineDraft, setMagazineDraft] = useState<MagazineCurationOutput | null>(null);

  const publicEventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'events'), where('isPublic', '==', true));
  }, [firestore]);

  const { data: publicEvents, isLoading: isLoadingEvents } = useCollection<Event>(publicEventsQuery);

  const handleGenerateDraft = async () => {
    if (!publicEvents || publicEvents.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Public Events',
        description: 'There are no public events available to generate a magazine issue.',
      });
      return;
    }
    setIsLoading(true);
    setMagazineDraft(null);

    try {
      const eventsForAI = publicEvents.map(e => ({
        name: e.name,
        description: e.description,
        eventDate: e.eventDate.toDate().toLocaleDateString(), // Convert timestamp to string
        eventType: e.eventType,
      }));

      const result = await curateCommunityMagazine({ events: eventsForAI });
      setMagazineDraft(result);
      toast({
        title: 'Draft Generated!',
        description: "Eni has crafted a new magazine issue for your review.",
      });
    } catch (error) {
      console.error('Error generating magazine draft:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'There was an error communicating with the AI. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Magazine Curation</h1>
        <p className="text-muted-foreground">The creative workspace for the EvenTide Community Magazine.</p>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Generate New Issue</CardTitle>
            <CardDescription>Let Eni, the AI Editor-in-Chief, automatically generate a complete draft.</CardDescription>
          </div>
          <Button onClick={handleGenerateDraft} disabled={isLoading || isLoadingEvents}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Generate Draft with AI'}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading && (
             <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Eni is curating the latest issue...</p>
             </div>
          )}
          {!isLoading && magazineDraft ? (
            <MagazinePreview draft={magazineDraft} />
          ) : !isLoading && (
             <p className="text-muted-foreground text-center py-16">
                The AI-generated magazine draft will appear here for review and editing.
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
