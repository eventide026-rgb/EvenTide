
'use client';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { type Guest } from '@/lib/types';
import QRCode from "react-qr-code";

function formatSerialNumber(num?: number) {
    if (typeof num !== 'number') return `No. 000`;
    return `No. ${num.toString().padStart(3, '0')}`;
}

export function GatepassCardClient({ event, guest }: { event: any, guest: Guest }) {
    const backgroundStyle = event.stationery?.gatepassBackground
    ? { backgroundImage: `url(${event.stationery.gatepassBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: event.primaryColor };

    const qrValue = JSON.stringify({ eventId: event.id, guestId: guest.id });

    return (
        <Card className="aspect-[9/16] max-w-[350px] mx-auto overflow-hidden relative text-white flex flex-col justify-between" style={backgroundStyle}>
            <div className="absolute inset-0 bg-black/40 z-0"/>
            <CardHeader className="relative z-10 text-center">
                 <p className="font-bold text-lg">{formatSerialNumber(guest.serialNumber)}</p>
                <h2 className="text-3xl font-bold" style={{ fontFamily: event.stationery?.font === 'serif' ? 'serif' : 'sans-serif' }}>
                    {event.name}
                </h2>
                <p>Digital Gate Pass</p>
            </CardHeader>
            <CardContent className="relative z-10 flex flex-col items-center justify-center gap-4">
                <div className="bg-white/90 p-4 rounded-lg">
                    <QRCode value={qrValue} size={160} fgColor="#000000" bgColor="#FFFFFF" />
                </div>
                 <p className="font-bold text-lg">{guest.name}</p>
                 <p className="text-sm -mt-2 text-white/80">{guest.category}</p>
            </CardContent>
             <div className="relative z-10 text-center pb-8">
                 <p className="font-bold text-sm">EVENT CODE: {event.eventCode}</p>
            </div>
        </Card>
    );
}
