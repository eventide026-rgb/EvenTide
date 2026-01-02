'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from 'date-fns';
import { type Guest } from '@/lib/types';

export function InvitationCardClient({ event, guest }: { event: any, guest: Guest }) {
    const backgroundStyle = event.stationery?.invitationBackground
    ? { backgroundImage: `url(${event.stationery.invitationBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: event.primaryColor };
    
    return (
        <Card className="aspect-[9/16] max-w-[350px] mx-auto overflow-hidden relative text-white flex flex-col" style={backgroundStyle}>
             <div className="absolute inset-0 bg-black/40 z-0"/>
            <CardHeader className="relative z-10 text-center flex-grow flex flex-col justify-center">
                <p className="text-lg">You are cordially invited to the</p>
                <h1 className="text-4xl font-bold mt-2" style={{ fontFamily: event.stationery?.font === 'serif' ? 'serif' : 'sans-serif' }}>
                    {event.stationery?.invitationDetails?.title || event.name}
                </h1>
                <p className="mt-4 text-white/90">
                    {event.stationery?.invitationDetails?.description || event.description}
                </p>
            </CardHeader>
            <CardContent className="relative z-10 text-center pb-8">
                 <p className="font-semibold">{format(event.eventDate.toDate(), 'EEEE, MMMM do, yyyy')}</p>
                 <p>{format(event.eventDate.toDate(), 'p')}</p>
                 <p className="mt-2 font-bold">{event.location}</p>
            </CardContent>
        </Card>
    );
}
