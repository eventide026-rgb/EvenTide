
'use client';

import { useState, useEffect, use } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

/**
 * @fileOverview Invitation Studio (Client Page)
 * Unified state management for synchronized control and preview.
 */

const ControlPanel = dynamic(() => import('@/components/stationery/control-panel').then(m => m.ControlPanel), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
});

const PreviewArea = dynamic(() => import('@/components/stationery/preview-area').then(m => m.PreviewArea), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
});

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

export type CardType = 'invitation' | 'gatepass' | 'program' | 'menu';

export default function InvitationStudioPage({ params }: { params: Promise<{ eventId: string }> }) {
    const resolvedParams = use(params);
    const eventId = resolvedParams.eventId;
    const firestore = useFirestore();
    
    const eventRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return doc(firestore, 'events', eventId);
    }, [firestore, eventId]);

    const { data: event, isLoading } = useDoc(eventRef);

    const [stationery, setStationery] = useState<Stationery>({});
    const [colors, setColors] = useState<EventColors>({ primary: '#4169E1', accent: '#D4AF37' });
    const [activeTab, setActiveTab] = useState<CardType>('invitation');
    
    useEffect(() => {
        if (event) {
            setStationery(event.stationery || {});
            setColors({
                primary: event.primaryColor || '#4169E1',
                accent: event.secondaryColor || '#D4AF37',
            });
        }
    }, [event]);

    if (isLoading || !event) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-[80vh]">
            <div className="lg:col-span-1">
                <ControlPanel
                    eventId={eventId}
                    event={event}
                    initialStationery={stationery}
                    setStationery={setStationery}
                    initialColors={colors}
                    setColors={setColors}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
            </div>
            <div className="lg:col-span-2">
                <PreviewArea 
                    stationery={stationery} 
                    colors={colors} 
                    event={event} 
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>
        </div>
    );
}
