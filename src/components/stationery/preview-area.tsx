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
        <div className="w-full">
            <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as CardType)} className="w-full">
                <TabsList className="hidden md:flex w-full">
                    <TabsTrigger value="invitation" className="flex-1">Invitation</TabsTrigger>
                    <TabsTrigger value="gatepass" className="flex-1">Gate Pass</TabsTrigger>
                    <TabsTrigger value="program" className="flex-1">Program</TabsTrigger>
                    <TabsTrigger value="menu" className="flex-1">Menu</TabsTrigger>
                </TabsList>
                <TabsContent value="invitation" className="mt-6">
                    <InvitationPreviewCard event={combinedEventData} />
                </TabsContent>
                <TabsContent value="gatepass" className="mt-6">
                    <GatepassPreviewCard event={combinedEventData} />
                </TabsContent>
                <TabsContent value="program" className="mt-6">
                    <ProgramPreviewCard event={combinedEventData} />
                </TabsContent>
                <TabsContent value="menu" className="mt-6">
                    <MenuPreviewCard event={combinedEventData} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
