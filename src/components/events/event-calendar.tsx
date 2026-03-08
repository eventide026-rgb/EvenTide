'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { isSameDay, format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarCheck, CheckSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

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
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function EventCalendar() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  // Use useEffect to prevent hydration error by initializing date on client
  useEffect(() => {
    setSelectedDate(new Date());
  }, []);

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
  const firstEventId = events?.[0]?.id;

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !firstEventId) return null;
    return query(collection(firestore, 'events', firstEventId, 'tasks'));
  }, [firestore, firstEventId]);

  const { data: tasks, isLoading: loadingTasks } = useCollection<Task>(tasksQuery);

  const isLoading = loadingOwned || loadingInvited || loadingTasks;

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const items: CalendarItem[] = [];

    ownedEvents?.forEach((event) => {
      if (!event.eventDate) return;
      items.push({ id: event.id, type: 'event', date: event.eventDate.toDate(), title: event.name, source: 'owned' });
    });

    invitedEvents?.forEach((event) => {
      if (!event.eventDate) return;
      items.push({ id: event.id, type: 'event', date: event.eventDate.toDate(), title: event.name, source: 'invited' });
    });

    tasks?.forEach((task) => {
      if (!task.dueDate) return;
      items.push({ id: task.id, type: 'task', date: task.dueDate.toDate(), title: task.title, task });
    });

    return items;
  }, [ownedEvents, invitedEvents, tasks]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return calendarItems.filter((item) => isSameDay(item.date, selectedDate));
  }, [calendarItems, selectedDate]);

  if (isLoading || !selectedDate) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-8 min-h-[600px]">
      <Card className="md:col-span-2 border-none shadow-lg">
        <CardContent className="p-4">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
            modifiers={{ 
                hasOwned: (date: Date) => calendarItems.some(i => i.source === 'owned' && isSameDay(i.date, date)),
                hasInvited: (date: Date) => calendarItems.some(i => i.source === 'invited' && isSameDay(i.date, date)),
                hasTask: (date: Date) => calendarItems.some(i => i.type === 'task' && isSameDay(i.date, date))
            }}
            modifiersClassNames={{
                hasOwned: "day-indicator indicator-primary",
                hasInvited: "day-indicator indicator-blue",
                hasTask: "day-indicator indicator-green"
            }}
          />
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            Agenda for {selectedDate ? format(selectedDate, 'PPP') : '—'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDayItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-6 text-sm">No events or tasks for this day.</p>
          ) : (
            <ul className="space-y-4">
              {selectedDayItems.map((item) => (
                <li key={`${item.type}-${item.id}`} className="flex gap-3">
                  <div className='mt-1'>
                    {item.type === 'event' ? (
                        <CalendarCheck className={cn("h-5 w-5", item.source === 'owned' ? 'text-primary' : 'text-blue-500')} />
                    ) : (
                        <CheckSquare className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] h-4">{item.type}</Badge>
                      {item.source && <Badge variant="outline" className="text-[10px] h-4">{item.source}</Badge>}
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
