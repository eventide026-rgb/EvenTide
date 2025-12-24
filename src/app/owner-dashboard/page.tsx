
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical, Calendar, Users, Percent, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sampleEvents = [
    {
        id: "evt-1",
        name: "Adebayo & Funke's Wedding",
        date: "2024-12-15T14:00:00.000Z",
        code: "WE-O-A4F8K2",
        status: "Upcoming",
        guests: 250,
        guestCapacity: 300,
        rsvpRate: 83,
    },
    {
        id: "evt-2",
        name: "Lagos Tech Summit 2024",
        date: "2024-11-02T09:00:00.000Z",
        code: "CN-P-L9S3T1",
        status: "Upcoming",
        guests: 450,
        guestCapacity: 500,
        rsvpRate: 90,
    },
    {
        id: "evt-3",
        name: "Grand Opening Gala",
        date: "2024-09-20T18:00:00.000Z",
        code: "CP-E-GOGRAND",
        status: "Completed",
        guests: 180,
        guestCapacity: 200,
        rsvpRate: 95,
    }
];

export default function OwnerDashboardPage() {
    const [selectedEvent, setSelectedEvent] = useState(sampleEvents[0]);

    const Countdown = ({ date }: { date: string }) => {
        const calculateTimeLeft = () => {
            const difference = +new Date(date) - +new Date();
            let timeLeft = {days: 0, hours: 0, minutes: 0};
            if (difference > 0) {
                timeLeft = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                };
            }
            return timeLeft;
        };

        const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

        return (
            <div className="flex space-x-4">
                <div>
                    <div className="text-3xl font-bold">{timeLeft.days}</div>
                    <div className="text-xs text-muted-foreground">Days</div>
                </div>
                <div>
                    <div className="text-3xl font-bold">{timeLeft.hours}</div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                </div>
                <div>
                    <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                    <div className="text-xs text-muted-foreground">Minutes</div>
                </div>
            </div>
        );
    }


    return (
        <div className="h-full flex flex-col">
            <header className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Owner Dashboard</h1>
                    <p className="text-muted-foreground">Manage all your events from one command center.</p>
                </div>
                <Button asChild>
                    <Link href="/owner-dashboard/create-event">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Event
                    </Link>
                </Button>
            </header>

            <div className="grid lg:grid-cols-12 gap-8 flex-1 mt-6">
                <div className="lg:col-span-4 xl:col-span-3 h-full">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>My Events</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            <ul className="space-y-2">
                                {sampleEvents.map(event => (
                                    <li key={event.id}>
                                        <button 
                                            className={cn(
                                                "w-full text-left p-3 rounded-lg border transition-all",
                                                selectedEvent.id === event.id ? "bg-accent border-primary" : "hover:bg-accent/50"
                                            )}
                                            onClick={() => setSelectedEvent(event)}
                                        >
                                            <p className="font-semibold truncate">{event.name}</p>
                                            <p className="text-sm text-muted-foreground">{event.status}</p>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-8 xl:col-span-9 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 content-start">
                     <Card className="md:col-span-2">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{selectedEvent.name}</CardTitle>
                                <CardDescription>Event Code: <span className="font-mono bg-muted px-2 py-1 rounded-md">{selectedEvent.code}</span></CardDescription>
                            </div>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent>
                            <Countdown date={selectedEvent.date} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2"><Calendar className="h-4 w-4" /> Event Date</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Total Guests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{selectedEvent.guests} / {selectedEvent.guestCapacity}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2"><Percent className="h-4 w-4" /> RSVP Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{selectedEvent.rsvpRate}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2"><CheckCircle className="h-4 w-4" /> Check-ins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">0 / {selectedEvent.guests}</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
