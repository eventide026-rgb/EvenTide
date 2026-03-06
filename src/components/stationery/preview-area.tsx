
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
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as CardType)} className="w-full">
            <TabsList className="hidden md:flex">
                <TabsTrigger value="invitation">Invitation</TabsTrigger>
                <TabsTrigger value="gatepass">Gate Pass</TabsTrigger>
                <TabsTrigger value="program">Program</TabsTrigger>
                <TabsTrigger value="menu">Menu</TabsTrigger>
            </TabsList>
            <TabsContent value="invitation">
                <InvitationPreviewCard event={combinedEventData} />
            </TabsContent>
            <TabsContent value="gatepass">
                <GatepassPreviewCard event={combinedEventData} />
            </TabsContent>
            <TabsContent value="program">
                <ProgramPreviewCard event={combinedEventData} />
            </TabsContent>
            <TabsContent value="menu">
                <MenuPreviewCard event={combinedEventData} />
            </TabsContent>
        </Tabs>
    );
}
