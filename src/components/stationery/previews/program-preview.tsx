
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export function ProgramPreviewCard({ event }: { event: any }) {
    const firestore = useFirestore();

    const programDocRef = useMemoFirebase(() => {
        if (!firestore || !event.id) return null;
        return doc(firestore, 'events', event.id, 'program', 'main');
    }, [firestore, event.id]);

    const { data: program, isLoading } = useDoc(programDocRef);
    
    const backgroundStyle = event.stationery?.programBackground
    ? { backgroundImage: `url(${event.stationery.programBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: event.primaryColor };
    
    return (
        <Card className="aspect-[9/16] max-w-[350px] mx-auto overflow-hidden relative text-white flex flex-col" style={backgroundStyle}>
             <div className="absolute inset-0 bg-black/50 z-0"/>
            <CardHeader className="relative z-10 text-center">
                <h2 className="text-3xl font-bold" style={{ fontFamily: event.stationery?.font === 'serif' ? 'serif' : 'sans-serif' }}>
                    Order of Events
                </h2>
                <p>{event.name}</p>
            </CardHeader>
            <CardContent className="relative z-10 flex-1 overflow-y-auto text-left px-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : program && program.program?.length > 0 ? (
                    <ul className="space-y-3 text-sm">
                        {program.program.map((item: any, index: number) => (
                            <li key={index} className="flex gap-4">
                                <div className="font-semibold">{item.startTime}</div>
                                <div>
                                    <p className="font-medium">{item.title}</p>
                                    {item.notes && <p className="text-xs text-white/80 italic">&quot;{item.notes}&quot;</p>}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white/80">The event program has not been set yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
