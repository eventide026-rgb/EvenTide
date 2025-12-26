
'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2, Sparkles, Upload } from "lucide-react";
import type { Stationery, EventColors } from '@/app/owner-dashboard/stationery-hub/invitation-studio/[eventId]/page';
import { generateInvitationCard } from '@/ai/flows/invitation-card-design';

type ControlPanelProps = {
    eventId: string;
    eventType: string;
    initialStationery: Stationery;
    initialColors: EventColors;
};

export function ControlPanel({ eventId, eventType, initialStationery, initialColors }: ControlPanelProps) {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();

    const [stationery, setStationery] = useState<Stationery>(initialStationery);
    const [colors, setColors] = useState<EventColors>(initialColors);
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const eventRef = doc(firestore, 'events', eventId);
        try {
            await updateDoc(eventRef, {
                stationery: stationery,
                primaryColor: colors.primary,
                secondaryColor: colors.accent,
            });
            toast({
                title: 'Theme Saved!',
                description: 'Your event stationery theme has been updated.',
            });
            router.push(`/owner-dashboard/stationery-hub/gatepass-preview/${eventId}`);
        } catch (error) {
            console.error("Error saving theme:", error);
            toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save your theme.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateInvitationCard({
                eventName: stationery.invitationDetails?.title || 'Our Event',
                eventDate: 'To be announced',
                eventTime: '',
                eventVenue: '',
                primaryColor: colors.primary,
                secondaryColor: colors.accent,
                eventDescription: stationery.invitationDetails?.description || 'A grand celebration',
                theme: aiPrompt,
            });
            setStationery(prev => ({...prev, background: result.invitationCardDesign }));
            toast({ title: "New background generated!" });
        } catch(error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'AI Generation Failed' });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Background Control</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Template Gallery (Coming Soon)</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="h-16 bg-muted rounded-md border-dashed border-2"></div>
                                    <div className="h-16 bg-muted rounded-md border-dashed border-2"></div>
                                    <div className="h-16 bg-muted rounded-md border-dashed border-2"></div>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor='ai-prompt'>AI Generation</Label>
                                <div className="flex gap-2">
                                    <Input id="ai-prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g., royal blue and gold abstract" />
                                    <Button onClick={handleGenerate} disabled={isGenerating}>
                                        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4" />}
                                    </Button>
                                </div>
                             </div>
                              <div className="space-y-2">
                                <Label htmlFor='upload'>Upload Your Own</Label>
                                <Button variant="outline" className="w-full" disabled><Upload className="mr-2 h-4 w-4" /> Upload (Coming Soon)</Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Details Control</AccordionTrigger>
                         <AccordionContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor='inv-title'>Invitation Title</Label>
                                <Input id="inv-title" value={stationery.invitationDetails?.title} onChange={e => setStationery(s => ({...s, invitationDetails: {...s.invitationDetails, title: e.target.value}}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor='inv-desc'>Invitation Description</Label>
                                <Textarea id="inv-desc" value={stationery.invitationDetails?.description} onChange={e => setStationery(s => ({...s, invitationDetails: {...s.invitationDetails, description: e.target.value}}))} />
                            </div>
                         </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                        <AccordionTrigger>Global Appearance</AccordionTrigger>
                         <AccordionContent className="space-y-4">
                             <div className="space-y-2">
                                <Label>Typography</Label>
                                <p className="text-sm text-muted-foreground">Global font styles (Coming Soon).</p>
                             </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor='primary-color'>Primary Color</Label>
                                    <Input id="primary-color" type="color" value={colors.primary} onChange={e => setColors(c => ({...c, primary: e.target.value}))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor='accent-color'>Accent Color</Label>
                                    <Input id="accent-color" type="color" value={colors.accent} onChange={e => setColors(c => ({...c, accent: e.target.value}))} />
                                </div>
                             </div>
                         </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
             <div className="pt-4 border-t mt-4">
                <Button className="w-full" size="lg" onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Theme & Continue
                </Button>
            </div>
        </div>
    );
}
