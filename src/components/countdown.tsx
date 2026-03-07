
'use client';

import { useState, useEffect } from 'react';

export const Countdown = ({ date }: { date?: string }) => {
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number} | null>(null);

    useEffect(() => {
        if (!date) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(date) - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                };
            }
            return { days: 0, hours: 0, minutes: 0 };
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000);

        return () => clearInterval(timer);
    }, [date]);

    if (!timeLeft) return null;

    return (
        <div className="flex space-x-4">
            <div>
                <div className="text-3xl font-bold">{timeLeft.days}</div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Days</div>
            </div>
            <div>
                <div className="text-3xl font-bold">{timeLeft.hours}</div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Hours</div>
            </div>
            <div>
                <div className="text-3xl font-bold">{timeLeft.minutes}</div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Minutes</div>
            </div>
        </div>
    );
}
