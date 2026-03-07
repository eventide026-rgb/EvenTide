
'use client';

import { use, useEffect, useState, useMemo } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Loader2, Camera, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Media = {
    id: string;
    fileUrl: string;
    uploaderName?: string;
    uploadTimestamp: any;
};

export default function LivePhotoWall({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
    const firestore = useFirestore();
    const [lastAddedId, setLastAddedId] = useState<string | null>(null);

    // Fetch the latest 20 photos in real-time
    const mediaQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'events', eventId, 'media'),
            orderBy('uploadTimestamp', 'desc'),
            limit(24)
        );
    }, [firestore, eventId]);

    const { data: media, isLoading } = useCollection<Media>(mediaQuery);

    // Track the newest photo to trigger an animation
    useEffect(() => {
        if (media && media.length > 0 && media[0].id !== lastAddedId) {
            setLastAddedId(media[0].id);
        }
    }, [media, lastAddedId]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-black">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-white font-headline text-xl animate-pulse">Initializing Live Wall...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-black overflow-hidden p-4 md:p-8">
            {/* Overlay Branding */}
            <div className="fixed top-8 left-8 z-50 pointer-events-none">
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                    <Camera className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-headline font-bold text-white tracking-tight">Live Celebration Wall</h1>
                    <Sparkles className="h-4 w-4 text-accent animate-pulse" />
                </div>
            </div>

            <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
                <div className="bg-primary px-6 py-2 rounded-2xl shadow-2xl">
                    <p className="text-white text-sm font-bold uppercase tracking-widest">Powered by EvenTide</p>
                </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-start">
                {media && media.length > 0 ? (
                    media.map((item, index) => (
                        <div 
                            key={item.id} 
                            className={cn(
                                "relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-1000",
                                item.id === lastAddedId ? "scale-105 ring-4 ring-primary z-10 animate-in zoom-in-50" : "hover:scale-[1.02]",
                                index % 3 === 0 ? "md:row-span-2 md:aspect-[3/5]" : ""
                            )}
                        >
                            <Image 
                                src={item.fileUrl} 
                                alt="Event Moment" 
                                fill 
                                className="object-cover"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 16vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-white text-xs font-bold truncate uppercase tracking-wider opacity-80">
                                    {item.uploaderName || 'Guest'}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
                        <div className="p-8 rounded-full bg-white/5 border border-white/10">
                            <Camera className="h-24 w-24 text-white/20" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-headline font-bold text-white">The Wall is Waiting</h2>
                            <p className="text-white/40 text-lg">Upload your first photo to start the gallery!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
