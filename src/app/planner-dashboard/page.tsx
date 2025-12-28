
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

const sampleEvents = [
    {
        id: "evt-1",
        name: "Adebayo & Funke's Wedding",
        date: "2024-12-15T14:00:00.000Z",
        eventCode: "WEO-O-A4F8K2",
        status: "Upcoming",
    },
    {
        id: "evt-2",
        name: "Lagos Tech Summit 2024",
        date: "2024-11-02T09:00:00.000Z",
        eventCode: "CN-P-L9S3T1",
        status: "Upcoming",
    },
];

export default function PlannerDashboardPage() {
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
                    <h1 className="text-3xl font-bold font-headline">Planner Dashboard</h1>
                    <p className="text-muted-foreground">Manage all your assigned events.</p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/planner-dashboard/invitations">
                        View Invitations
                    </Link>
                </Button>
            </header>

            <div className="grid lg:grid-cols-12 gap-8 flex-1 mt-6">
                <div className="lg:col-span-4 xl:col-span-3 h-full">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>My Gigs</CardTitle>
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
                <div className="lg:col-span-8 xl:col-span-9">
                     <Card>
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle className="text-2xl">{selectedEvent.name}</CardTitle>
                                <CardDescription>Event Code: <span className="font-mono bg-muted px-2 py-1 rounded-md">{selectedEvent.eventCode}</span></CardDescription>
                            </div>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                        </CardHeader>
                        <CardContent>
                            <Countdown date={selectedEvent.date} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
