
'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export function MenuPreviewCard({ event }: { event: any }) {
    const firestore = useFirestore();

    const menuDocRef = useMemoFirebase(() => {
        if (!firestore || !event.id) return null;
        return doc(firestore, 'events', event.id, 'menu', 'main');
    }, [firestore, event.id]);

    const { data: menu, isLoading } = useDoc(menuDocRef);
    
    const backgroundStyle = event.stationery?.menuBackground
    ? { backgroundImage: `url(${event.stationery.menuBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: event.primaryColor };
    
    return (
        <Card className="aspect-[9/16] max-w-[350px] mx-auto overflow-hidden relative text-white flex flex-col" style={backgroundStyle}>
             <div className="absolute inset-0 bg-black/60 z-0"/>
            <CardHeader className="relative z-10 text-center">
                <h2 className="text-3xl font-bold" style={{ fontFamily: event.stationery?.font === 'serif' ? 'serif' : 'sans-serif' }}>
                    {menu?.menuTitle || 'Menu'}
                </h2>
                <p>{event.name}</p>
            </CardHeader>
            <CardContent className="relative z-10 flex-1 overflow-y-auto text-left px-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : menu && menu.courses?.length > 0 ? (
                    <div className="space-y-4 text-sm">
                        {menu.courses.map((course: any, index: number) => (
                            <div key={index}>
                                <h3 className="font-bold text-lg mb-1 border-b border-white/30" style={{color: event.secondaryColor}}>{course.title}</h3>
                                <ul className="space-y-1.5">
                                    {course.dishes.map((dish: any, dIndex: number) => (
                                        <li key={dIndex}>
                                            <p className="font-medium">{dish.name}</p>
                                            {dish.description && <p className="text-xs text-white/80">{dish.description}</p>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="flex items-center justify-center h-full">
                        <p className="text-white/80">The event menu has not been set yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
