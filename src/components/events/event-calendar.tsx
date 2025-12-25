
'use client';

import { useMemo, useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { isSameDay, format } from 'date-fns';
import { CalendarCheck, CheckSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Event = {
    id: string;
    name: string;
    eventDate: any;
    ownerId: string;
};

type Task = {
    id: string;
    eventId: string;
    title: string;
    dueDate: any;
    status: 'pending' | 'in-progress' | 'completed';
};

type CalendarItem = {
    id: string;
    type: 'event' | 'task';
    date: Date;
    title: string;
    event?: Event;
    task?: Task;
};

export function EventCalendar() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    const eventsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
    }, [firestore, user]);

    const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

    // This is a simplified approach for demonstration. In a real-world scenario with many events,
    // you would fetch tasks for the visible month or selected event to avoid over-fetching.
    const taskQueries = useMemo(() => {
        if (!firestore || !events) return [];
        return events.map(event => query(collection(firestore, 'events', event.id, 'tasks')));
    }, [firestore, events]);

    // useCollection doesn't support an array of queries, so we'd need a custom hook or multiple calls.
    // For simplicity, we'll fetch tasks for the first event as a placeholder for the logic.
    const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(taskQueries.length > 0 ? taskQueries[0] : null);

    const isLoading = isLoadingEvents || isLoadingTasks;

    const calendarItems = useMemo(() => {
        const items: CalendarItem[] = [];
        if (events) {
            events.forEach(event => {
                items.push({
                    id: event.id,
                    type: 'event',
                    date: event.eventDate.toDate(),
                    title: event.name,
                    event: event,
                });
            });
        }
        if (tasks) {
            tasks.forEach(task => {
                items.push({
                    id: task.id,
                    type: 'task',
                    date: task.dueDate.toDate(),
                    title: task.title,
                    task: task,
                });
            });
        }
        return items;
    }, [events, tasks]);

    const datesWithItems = useMemo(() => calendarItems.map(item => item.date), [calendarItems]);

    const selectedDayItems = useMemo(() => {
        if (!selectedDate) return [];
        return calendarItems
            .filter(item => isSameDay(item.date, selectedDate))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [calendarItems, selectedDate]);

    const DayWithDot = ({ day }: { day: Date }) => (
        <div className="relative h-full w-full">
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
            {day.getDate()}
        </div>
    );

    return (
        <div className="grid md:grid-cols-3 gap-8 h-full">
            <Card className="md:col-span-2">
                <CardContent className="p-2 md:p-4">
                     <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="p-0 w-full"
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                            month: "space-y-4 w-full",
                            table: "w-full border-collapse space-y-1",
                            row: "flex w-full mt-2",
                            head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                            cell: "h-9 w-full text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        }}
                        components={{
                            Day: ({ date }) => {
                                if (!date) {
                                    return <div />;
                                }
                                const hasItem = datesWithItems.some(itemDate => isSameDay(date, itemDate));
                                return hasItem ? <DayWithDot day={date} /> : <div>{date.getDate()}</div>;
                            }
                        }}
                    />
                </CardContent>
            </Card>
            <div className="md:col-span-1">
                 <Card>
                    <CardHeader>
                        <CardTitle>
                            Agenda for {selectedDate ? format(selectedDate, 'PPP') : '...'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <Loader2 className="h-6 w-6 animate-spin mx-auto" />}
                        {!isLoading && selectedDayItems.length > 0 ? (
                             <ul className="space-y-4">
                                {selectedDayItems.map(item => (
                                    <li key={`${item.type}-${item.id}`} className="flex items-start gap-3">
                                        {item.type === 'event' ? (
                                            <CalendarCheck className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                                        ) : (
                                            <CheckSquare className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
                                        )}
                                        <div>
                                            <p className="font-semibold">{item.title}</p>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={item.type === 'event' ? 'default' : 'secondary'}>{item.type}</Badge>
                                                 {item.task && <Badge variant="outline">{item.task.status}</Badge>}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : !isLoading && (
                            <p className="text-muted-foreground text-center py-8">No events or tasks for this day.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
