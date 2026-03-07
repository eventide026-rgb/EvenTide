
'use client';

import { use, Suspense, useState } from 'react';
import { useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2, ArrowLeft, ArrowRight, Sparkles, Clipboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { generateThankYouNote } from '@/ai/flows/generate-thank-you-note';

function ThankYouNotesPageContent({ eventId }: { eventId: string }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();
    const [generatedNote, setGeneratedNote] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const eventRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'events', eventId);
    }, [firestore, eventId]);

    const { data: event, isLoading } = useDoc(eventRef);
    
    const handleGenerateNote = async () => {
        if (!event) return;
        setIsGenerating(true);
        try {
            const result = await generateThankYouNote({
                guestName: user?.displayName || 'A Grateful Guest',
                eventName: event.name,
                eventType: event.eventType || 'wonderful event',
            });
            setGeneratedNote(result.note);
            toast({
                title: 'Note Generated!',
                description: 'Eni has drafted a thank-you note for you.',
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'Could not generate a note at this time.',
            });
        } finally {
            setIsGenerating(false);
        }
    }

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(generatedNote);
        toast({ title: 'Copied to clipboard!' });
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
             <div className="flex justify-between items-center mb-4">
                 <Button variant="outline" asChild>
                    <Link href={`/owner/stationery-hub/menu-preview/${eventId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Menu
                    </Link>
                </Button>
                <Button asChild>
                    <Link href={`/owner/stationery-hub/complete/${eventId}`}>
                        Finish Setup
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>AI Thank-You Note Generator</CardTitle>
                    <CardDescription>Let Eni draft a heartfelt thank-you note to the event hosts on your behalf.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button className="w-full" onClick={handleGenerateNote} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isGenerating ? "Eni is writing..." : "Generate Note with Eni"}
                    </Button>
                    <div className="space-y-2">
                        <Label htmlFor="note-output">Generated Note</Label>
                        <Textarea 
                            id="note-output"
                            rows={8} 
                            readOnly 
                            value={generatedNote} 
                            placeholder="Your thank-you note will appear here..." 
                        />
                    </div>
                    {generatedNote && (
                        <Button variant="secondary" className="w-full" onClick={handleCopyToClipboard}>
                            <Clipboard className="mr-2 h-4 w-4" /> Copy to Clipboard
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ThankYouNotesPage({ params }: { params: Promise<{ eventId: string }> }) {
    const resolvedParams = use(params);
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>}>
            <ThankYouNotesPageContent eventId={resolvedParams.eventId} />
        </Suspense>
    );
}
