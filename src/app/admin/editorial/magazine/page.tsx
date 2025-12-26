
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
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

// Represents a document from the 'magazineIssues' collection
export type MagazineIssue = MagazineCurationOutput & {
    id: string;
    status: 'draft' | 'published';
    createdAt: any;
    publishedAt?: any;
}

export default function MagazineCurationPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [magazineDraft, setMagazineDraft] = useState<MagazineIssue | null>(null);

  const publicEventsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Query for public events that have already concluded
    return query(
        collection(firestore, "events"), 
        where('isPublic', '==', true),
        where('eventDate', '<', yesterday)
    );
  }, [firestore]);

  const { data: publicEvents, isLoading: isLoadingEvents } = useCollection<Event>(publicEventsQuery);

  const handleGenerateDraft = async () => {
    if (!publicEvents || publicEvents.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Recent Public Events',
        description: 'There are no concluded public events available to generate a magazine issue.',
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
        eventType: e.eventType || 'General Event',
      }));

      const result = await curateCommunityMagazine({ events: eventsForAI });
      
      if (!firestore) throw new Error("Firestore not available");

      // Save the generated draft to Firestore
      const magazineCollection = collection(firestore, "events");
      const newDraftDoc = {
        ...result,
        status: 'draft' as const,
        createdAt: serverTimestamp(),
      }
      
      const docRef = await addDoc(magazineCollection, newDraftDoc);
      
      setMagazineDraft({ ...newDraftDoc, id: docRef.id, createdAt: new Date() });

      toast({
        title: 'Draft Generated!',
        description: "Eni has crafted a new magazine issue for your review.",
      });

    } catch (error) {
      console.error('Error generating magazine draft:', error);
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: 'There was an error communicating with the AI or saving the draft. Please try again.',
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
            {isLoading || isLoadingEvents ? (
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
             <div className="text-center py-16 border-dashed border-2 rounded-lg">
                <h3 className="text-xl font-semibold">Generate an issue to begin</h3>
                 <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    Click the &quot;Generate Draft with AI&quot; button. The system will find recent public events and Eni will write the first draft for you.
                 </p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
