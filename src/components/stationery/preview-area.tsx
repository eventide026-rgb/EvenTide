
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvitationPreviewCard } from './previews/invitation-preview';
import { GatepassPreviewCard } from './previews/gatepass-preview';
import type { Stationery, EventColors } from '@/app/owner-dashboard/stationery-hub/invitation-studio/[eventId]/page';

type PreviewAreaProps = {
    stationery: Stationery;
    colors: EventColors;
    event: any;
}

export function PreviewArea({ stationery, colors, event }: PreviewAreaProps) {
    const combinedEventData = {
        ...event,
        stationery,
        primaryColor: colors.primary,
        secondaryColor: colors.accent,
    };
    
    return (
        <Tabs defaultValue="invitation" className="w-full">
            <TabsList>
                <TabsTrigger value="invitation">Invitation</TabsTrigger>
                <TabsTrigger value="gatepass">Gate Pass</TabsTrigger>
                <TabsTrigger value="program" disabled>Program</TabsTrigger>
                <TabsTrigger value="menu" disabled>Menu</TabsTrigger>
            </TabsList>
            <TabsContent value="invitation">
                <InvitationPreviewCard event={combinedEventData} />
            </TabsContent>
            <TabsContent value="gatepass">
                <GatepassPreviewCard event={combinedEventData} />
            </TabsContent>
        </Tabs>
    );
}
