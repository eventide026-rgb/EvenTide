
'use client';

import { useMemo, useState } from 'react';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { DayPicker, Day, type DayProps } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
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
  eventDate?: any; // Firestore Timestamp
  ownerId: string;
  managers?: string[]; // invited managers
};

type Task = {
  id: string;
  eventId: string;
  title: string;
  dueDate?: any; // Firestore Timestamp
  status: 'pending' | 'in-progress' | 'completed';
};

type CalendarItem = {
  id: string;
  type: 'event' | 'task';
  date: Date;
  title: string;
  source?: 'owned' | 'invited';
  task?: Task;
};

/* ------------------------------------------------------------------ */
/* Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function EventCalendar() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  /* ---------------------------------------------------------------- */
  /* Queries: Owned + Invited events                                  */
  /* ---------------------------------------------------------------- */

  const ownedEventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const invitedEventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('managers', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  const { data: ownedEvents, isLoading: loadingOwned } = useCollection<Event>(ownedEventsQuery);
  const { data: invitedEvents, isLoading: loadingInvited } = useCollection<Event>(invitedEventsQuery);

  const events = [...(ownedEvents ?? []), ...(invitedEvents ?? [])];

  /* ---------------------------------------------------------------- */
  /* Tasks (simplified: first event only)                             */
  /* ---------------------------------------------------------------- */

  const firstEventId = events?.[0]?.id;

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !firstEventId) return null;
    return query(collection(firestore, 'events', firstEventId, 'tasks'));
  }, [firestore, firstEventId]);

  const { data: tasks, isLoading: loadingTasks } = useCollection<Task>(tasksQuery);

  const isLoading = loadingOwned || loadingInvited || loadingTasks;

  /* ---------------------------------------------------------------- */
  /* Build calendar items                                             */
  /* ---------------------------------------------------------------- */

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const items: CalendarItem[] = [];

    ownedEvents?.forEach((event) => {
      if (!event.eventDate) return;
      items.push({
        id: event.id,
        type: 'event',
        date: event.eventDate.toDate(),
        title: event.name,
        source: 'owned',
      });
    });

    invitedEvents?.forEach((event) => {
      if (!event.eventDate) return;
      items.push({
        id: event.id,
        type: 'event',
        date: event.eventDate.toDate(),
        title: event.name,
        source: 'invited',
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
  }, [ownedEvents, invitedEvents, tasks]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return calendarItems.filter((item) => isSameDay(item.date, selectedDate));
  }, [calendarItems, selectedDate]);

  /* ---------------------------------------------------------------- */
  /* Custom Day renderer using <Day> wrapper                          */
  /* ---------------------------------------------------------------- */

  function DayWithDot(props: DayProps) {
    const { day, children, className } = props;
    const date = day.date;

    const hasOwned = calendarItems.some(
      (i) => i.source === 'owned' && isSameDay(i.date, date)
    );
    const hasInvited = calendarItems.some(
      (i) => i.source === 'invited' && isSameDay(i.date, date)
    );
    const hasTask = calendarItems.some(
      (i) => i.type === 'task' && isSameDay(i.date, date)
    );

    return (
      <Day {...props} className={`relative ${className ?? ''}`}>
        {children}
        {hasOwned && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
        )}
        {hasInvited && (
          <span className="absolute bottom-1 left-[40%] h-1 w-1 rounded-full bg-blue-500" />
        )}
        {hasTask && (
          <span className="absolute bottom-1 left-[60%] h-1 w-1 rounded-full bg-green-500" />
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
  /* Render                                                           */
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
              Day: DayWithDot,
            }}
          />
        </CardContent>
      </Card>

      {/* Agenda */}
      <Card>
        <CardHeader>
          <CardTitle>
            Agenda for {selectedDate ? format(selectedDate, 'PPP') : '—'}
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
                <li key={`${item.type}-${item.id}`} className="flex gap-3">
                  {item.type === 'event' ? (
                    <CalendarCheck
                      className={`h-5 w-5 mt-1 ${
                        item.source === 'owned'
                          ? 'text-primary'
                          : 'text-blue-500'
                      }`}
                    />
                  ) : (
                    <CheckSquare className="h-5 w-5 text-green-500 mt-1" />
                  )}
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge
                        variant={
                          item.type === 'event'
                            ? item.source === 'owned'
                              ? 'default'
                              : 'secondary'
                            : 'secondary'
                        }
                      >
                        {item.type}
                      </Badge>
                      {item.source && (
                        <Badge variant="outline">{item.source}</Badge>
                      )}
                      {item.task && (
                        <Badge variant="outline">{item.task.status}</Badge>
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
