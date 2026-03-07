
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvitationPreviewCard } from './previews/invitation-preview';
import { GatepassPreviewCard } from './previews/gatepass-preview';
import { ProgramPreviewCard } from './previews/program-preview';
import { MenuPreviewCard } from './previews/menu-preview';
import type { Stationery, EventColors, CardType } from '@/app/owner-dashboard/stationery-hub/invitation-studio/[eventId]/page';

type PreviewAreaProps = {
    stationery: Stationery;
    colors: EventColors;
    event: any;
    activeTab: CardType;
    onTabChange: (tab: CardType) => void;
}

export function PreviewArea({ stationery, colors, event, activeTab, onTabChange }: PreviewAreaProps) {
    const combinedEventData = {
        ...event,
        stationery,
        primaryColor: colors.primary,
        secondaryColor: colors.accent,
    };
    
    return (
        <div className="w-full flex flex-col h-full">
            <div className="hidden md:flex mb-6">
                <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as CardType)} className="w-full">
                    <TabsList className="w-full h-12 bg-muted/50 p-1 rounded-xl">
                        <TabsTrigger value="invitation" className="flex-1 rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Invitation</TabsTrigger>
                        <TabsTrigger value="gatepass" className="flex-1 rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Gate Pass</TabsTrigger>
                        <TabsTrigger value="program" className="flex-1 rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Program</TabsTrigger>
                        <TabsTrigger value="menu" className="flex-1 rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm">Menu</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="flex-1 flex items-start justify-center overflow-auto p-4 bg-muted/30 rounded-3xl border-2 border-dashed border-border/50">
                <div className="w-full max-w-[350px] transition-all duration-500 ease-in-out origin-top scale-90 sm:scale-100">
                    {activeTab === 'invitation' && <InvitationPreviewCard event={combinedEventData} />}
                    {activeTab === 'gatepass' && <GatepassPreviewCard event={combinedEventData} />}
                    {activeTab === 'program' && <ProgramPreviewCard event={combinedEventData} />}
                    {activeTab === 'menu' && <MenuPreviewCard event={combinedEventData} />}
                </div>
            </div>
            
            <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase font-bold tracking-widest">High-Fidelity Preview Rendering</p>
        </div>
    );
}
