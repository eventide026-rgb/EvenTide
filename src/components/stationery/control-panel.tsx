
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
import type { Stationery, EventColors, CardType } from '@/app/owner-dashboard/stationery-hub/invitation-studio/[eventId]/page';
import { generateInvitationCard } from '@/ai/flows/invitation-card-design';
import { StationeryDesigns } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

type ControlPanelProps = {
    eventId: string;
    event: any;
    initialStationery: Stationery;
    setStationery: React.Dispatch<React.SetStateAction<Stationery>>;
    initialColors: EventColors;
    setColors: React.Dispatch<React.SetStateAction<EventColors>>;
    activeTab: CardType;
    setActiveTab: (tab: CardType) => void;
};

export function ControlPanel({ 
    eventId, 
    event, 
    initialStationery, 
    setStationery, 
    initialColors, 
    setColors,
    activeTab,
    setActiveTab
}: ControlPanelProps) {
    const { toast } = useToast();
    const router = useRouter();
    const firestore = useFirestore();

    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        const eventRef = doc(firestore, 'events', eventId);
        try {
            await updateDoc(eventRef, {
                stationery: initialStationery,
                primaryColor: initialColors.primary,
                secondaryColor: initialColors.accent,
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
    
    const handleSetBackground = (url: string) => {
        const backgroundProp = `${activeTab}Background` as keyof Stationery;
        setStationery(prev => ({ ...prev, [backgroundProp]: url }));
    }

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateInvitationCard({
                eventName: initialStationery.invitationDetails?.title || 'Our Event',
                eventDate: 'To be announced',
                eventTime: '',
                eventVenue: '',
                primaryColor: initialColors.primary,
                secondaryColor: initialColors.accent,
                eventDescription: initialStationery.invitationDetails?.description || 'A grand celebration',
                theme: aiPrompt,
            });
            handleSetBackground(result.invitationCardDesign);
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
                             <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CardType)}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="invitation">Invite</TabsTrigger>
                                    <TabsTrigger value="gatepass">Pass</TabsTrigger>
                                    <TabsTrigger value="program">Program</TabsTrigger>
                                    <TabsTrigger value="menu">Menu</TabsTrigger>
                                </TabsList>
                             </Tabs>
                             <div className="space-y-2">
                                <Label>Template Gallery</Label>
                                <ScrollArea className="h-48">
                                    <div className="grid grid-cols-3 gap-2">
                                    {StationeryDesigns.map(design => (
                                        <button key={design.id} className="aspect-[2/3] relative rounded-md overflow-hidden group border-2 border-transparent hover:border-primary" onClick={() => handleSetBackground(design.imageUrl)}>
                                            <Image src={design.imageUrl} alt={design.name} fill className="object-cover"/>
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                        </button>
                                    ))}
                                    </div>
                                </ScrollArea>
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
                                <Input id="inv-title" value={initialStationery.invitationDetails?.title || ''} onChange={e => setStationery(s => ({...s, invitationDetails: {...(s.invitationDetails || {title: '', description: ''}), title: e.target.value}}))} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor='inv-desc'>Invitation Description</Label>
                                <Textarea id="inv-desc" value={initialStationery.invitationDetails?.description || ''} onChange={e => setStationery(s => ({...s, invitationDetails: {...(s.invitationDetails || {title: '', description: ''}), description: e.target.value}}))} />
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
                                    <Input id="primary-color" type="color" value={initialColors.primary} onChange={e => setColors(c => ({...c, primary: e.target.value}))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor='accent-color'>Accent Color</Label>
                                    <Input id="accent-color" type="color" value={initialColors.accent} onChange={e => setColors(c => ({...c, accent: e.target.value}))} />
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
