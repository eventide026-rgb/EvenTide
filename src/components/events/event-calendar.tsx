
'use client';

import { useMemo, useState } from 'react';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { DayPicker, DayProps, Day } from 'react-day-picker';
import { isSameDay, format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarCheck, CheckSquare } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Event = {
  id: string;
  name: string;
  eventDate?: any;
  ownerId: string;
};

type Task = {
  id: string;
  eventId: string;
  title: string;
  dueDate?: any;
  status: 'pending' | 'in-progress' | 'completed';
};

type CalendarItem = {
  id: string;
  type: 'event' | 'task';
  date: Date;
  title: string;
  task?: Task;
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export function EventCalendar() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

  /* ---------------------------------------------------------------- */
  /* Events (auth-safe)                                               */
  /* ---------------------------------------------------------------- */

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(
      collection(firestore, 'events'),
      where('ownerId', '==', user.uid)
    );
  }, [firestore, user?.uid]);

  const { data: events, isLoading: isLoadingEvents } =
    useCollection<Event>(eventsQuery);

  /* ---------------------------------------------------------------- */
  /* Tasks (simplified: first event only)                              */
  /* ---------------------------------------------------------------- */

  const firstEventId = events?.[0]?.id;

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !firstEventId) return null;
    return query(
      collection(firestore, 'events', firstEventId, 'tasks')
    );
  }, [firestore, firstEventId]);

  const { data: tasks, isLoading: isLoadingTasks } =
    useCollection<Task>(tasksQuery);

  const isLoading = isLoadingEvents || isLoadingTasks;

  /* ---------------------------------------------------------------- */
  /* Build calendar items safely                                      */
  /* ---------------------------------------------------------------- */

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const items: CalendarItem[] = [];

    events?.forEach((event) => {
      if (!event.eventDate) return;
      items.push({
        id: event.id,
        type: 'event',
        date: event.eventDate.toDate(),
        title: event.name,
      });
    });

    tasks?.forEach((task) => {
      if (!task.dueDate) return;
      items.push({
        id: task.id,
        type: 'task',
        date: task.dueDate.toDate(),
        title: task.title,
        task,
      });
    });

    return items;
  }, [events, tasks]);

  const datesWithItems = useMemo(
    () => calendarItems.map((item) => item.date),
    [calendarItems]
  );

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return calendarItems.filter((item) =>
      isSameDay(item.date, selectedDate)
    );
  }, [calendarItems, selectedDate]);

  /* ---------------------------------------------------------------- */
  /* Custom Day Renderer (react-day-picker v8+)                        */
  /* ---------------------------------------------------------------- */

  function DayWithDot(props: DayProps) {
    const hasItem = datesWithItems.some((d) =>
      isSameDay(d, props.date)
    );
    return (
        <Day {...props}>
            {hasItem && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
            )}
        </Day>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Loading state                                                    */
  /* ---------------------------------------------------------------- */

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /* Render                                                          */
  /* ---------------------------------------------------------------- */

  return (
    <div className="grid md:grid-cols-3 gap-8 min-h-[600px]">
      {/* Calendar */}
      <Card className="md:col-span-2">
        <CardContent className="p-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            components={{
              Day: DayWithDot
            }}
          />
        </CardContent>
      </Card>

      {/* Agenda */}
      <Card>
        <CardHeader>
          <CardTitle>
            Agenda for{' '}
            {selectedDate ? format(selectedDate, 'PPP') : '—'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDayItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-6">
              No events or tasks for this day.
            </p>
          ) : (
            <ul className="space-y-4">
              {selectedDayItems.map((item) => (
                <li
                  key={`${item.type}-${item.id}`}
                  className="flex gap-3"
                >
                  {item.type === 'event' ? (
                    <CalendarCheck className="h-5 w-5 text-primary mt-1" />
                  ) : (
                    <CheckSquare className="h-5 w-5 text-blue-500 mt-1" />
                  )}
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge
                        variant={
                          item.type === 'event'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {item.type}
                      </Badge>
                      {item.task && (
                        <Badge variant="outline">
                          {item.task.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
