'use client';

import { useState, useEffect, use } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { ControlPanel } from '@/components/stationery/control-panel';
import { PreviewArea } from '@/components/stationery/preview-area';

export type Stationery = {
    invitationBackground?: string;
    gatepassBackground?: string;
    programBackground?: string;
    menuBackground?: string;
    font?: 'serif' | 'sans-serif';
    invitationDetails?: {
        title: string;
        description: string;
    };
};

export type EventColors = {
    primary: string;
    accent: string;
};

export default function InvitationStudioPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
    const firestore = useFirestore();
    const eventRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'events', eventId);
    }, [firestore, eventId]);

    const { data: event, isLoading } = useDoc(eventRef);

    const [stationery, setStationery] = useState<Stationery>({});
    const [colors, setColors] = useState<EventColors>({ primary: '#000000', accent: '#FFFFFF' });
    
    useEffect(() => {
        if (event) {
            setStationery(event.stationery || {});
            setColors({
                primary: event.primaryColor || '#000000',
                accent: event.secondaryColor || '#FFFFFF',
            });
        }
    }, [event]);

    if (isLoading || !event) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="grid lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-1">
                <ControlPanel
                    eventId={eventId}
                    event={event}
                    initialStationery={stationery}
                    setStationery={setStationery}
                    initialColors={colors}
                    setColors={setColors}
                />
            </div>
            <div className="lg:col-span-2">
                <PreviewArea stationery={stationery} colors={colors} event={event} />
            </div>
        </div>
    );
}
