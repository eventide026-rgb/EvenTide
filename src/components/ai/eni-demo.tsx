'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { generateWelcomeMessage } from '@/ai/flows/ai-welcome-message';
import { useToast } from '@/hooks/use-toast';

export function EniDemo() {
    const [eventType, setEventType] = useState('Wedding');
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setIsGenerating(true);
        setResult(null);
        try {
            const res = await generateWelcomeMessage({
                guestName: 'Honored Guest',
                eventName: `The Grand ${eventType} Celebration`
            });
            setResult(res.message);
        } catch (error) {
            console.error("Eni Demo Error:", error);
            toast({ variant: 'destructive', title: 'Demo Offline', description: 'Eni is taking a quick rest. Please try again in a moment.' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-gradient-to-br from-primary/5 via-background to-background relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="h-24 w-24" />
            </div>
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-fit mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-3xl font-headline font-bold">Meet Eni, Your AI Assistant</CardTitle>
                <CardDescription className="text-base max-w-md mx-auto">
                    Experience the power of AI. Generate a personalized welcome message instantly.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end justify-center">
                    <div className="w-full sm:w-48 space-y-2 text-left">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Event Type</p>
                        <Select value={eventType} onValueChange={setEventType}>
                            <SelectTrigger className="h-12 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Wedding">Wedding</SelectItem>
                                <SelectItem value="Birthday">Birthday</SelectItem>
                                <SelectItem value="Gala">Gala Dinner</SelectItem>
                                <SelectItem value="Conference">Conference</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button 
                        size="lg" 
                        onClick={handleGenerate} 
                        disabled={isGenerating}
                        className="h-12 px-8 rounded-xl font-bold w-full sm:w-auto"
                    >
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
                        Generate Text
                    </Button>
                </div>

                {result && (
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in zoom-in-95 duration-500">
                        <p className="text-lg italic font-logo text-center text-foreground/90">&quot;{result}&quot;</p>
                        <p className="text-right text-[10px] font-bold uppercase tracking-widest text-primary mt-4">— Eni, Your Creative Director</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
