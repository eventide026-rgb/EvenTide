
'use client';

import { useState, useEffect } from 'react';

export const Countdown = ({ date }: { date?: string }) => {
    if (!date) return null;
    
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

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 60000); // Update every minute
        
        // Also update immediately when the date prop changes
        setTimeLeft(calculateTimeLeft());

        return () => clearInterval(timer);
    }, [date]);


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
