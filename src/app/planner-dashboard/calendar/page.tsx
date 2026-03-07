
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, getDocs, documentId } from 'firebase/firestore';
import { DayPicker, type DayProps } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { isSameDay, format, getDay } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CalendarCheck, CheckSquare } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type EventPlanner = {
  id: string;
  eventId: string;
  plannerId: string;
};

type Event = {
  id: string;
  name: string;
  eventDate?: any; // Firestore Timestamp
};

type Task = {
  id: string;
  eventId: string;
  title: string;
  dueDate?: any; // Firestore Timestamp
};

type CalendarItem = {
  id: string;
  type: 'Event' | 'Task';
  date: Date;
  title: string;
  parentEventName: string;
};

/* ------------------------------------------------------------------ */
/* Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function PlannerCalendarPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Get all event assignments for the current planner
  const plannerAssignmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'planners'), where('plannerId', '==', user.uid));
  }, [firestore, user?.uid]);
  
  const { data: assignments } = useCollection<EventPlanner>(plannerAssignmentsQuery);

  // 2. Fetch all events and tasks based on assignments
  useEffect(() => {
    const fetchAllData = async () => {
      if (!assignments || !firestore) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      const allItems: CalendarItem[] = [];
      const eventIds = assignments.map(a => a.eventId);

      if (eventIds.length === 0) {
        setCalendarItems([]);
        setIsLoading(false);
        return;
      }

      // Fetch all assigned events in one query
      const eventsQuery = query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
      const eventsSnapshot = await getDocs(eventsQuery);
      
      const eventsData = new Map<string, Event>();
      eventsSnapshot.forEach(doc => {
        eventsData.set(doc.id, { id: doc.id, ...doc.data() } as Event);
      });

      for (const event of eventsData.values()) {
        if (event.eventDate) {
          allItems.push({
            id: event.id,
            type: 'Event',
            date: event.eventDate.toDate(),
            title: event.name,
            parentEventName: event.name,
          });
        }

        // Fetch tasks for each event
        const tasksQuery = query(collection(firestore, 'events', event.id, 'tasks'));
        const tasksSnapshot = await getDocs(tasksQuery);
        tasksSnapshot.forEach(doc => {
          const task = { id: doc.id, ...doc.data() } as Task;
          if (task.dueDate) {
            allItems.push({
              id: task.id,
              type: 'Task',
              date: task.dueDate.toDate(),
              title: task.title,
              parentEventName: event.name,
            });
          }
        });
      }

      setCalendarItems(allItems);
      setIsLoading(false);
    };

    fetchAllData();
  }, [assignments, firestore]);

  const markedDates = useMemo(() => {
    return calendarItems.map(item => item.date);
  }, [calendarItems]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return calendarItems.filter((item) => isSameDay(item.date, selectedDate));
  }, [calendarItems, selectedDate]);

  function DayWithDot(props: DayProps) {
    const { day } = props;
    const date = day.date;
    const isMarked = markedDates.some(d => isSameDay(d, date));

    return (
        <div className="relative flex items-center justify-center h-full w-full">
            <button {...props} className={cn(props.className, "h-full w-full")} />
            {isMarked && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
            )}
        </div>
    );
  }
  
  const formatShortWeekday = (date: Date) => {
    return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][getDay(date)];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Calendar</h1>
          <p className="text-muted-foreground">
            A unified view of all your assigned events and task deadlines.
          </p>
        </div>
      </header>

      <div className="flex-1 mt-6">
        <div className="grid md:grid-cols-3 gap-8 min-h-[600px]">
          <Card className="md:col-span-2">
            <CardContent className="p-0 md:p-4">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                modifiers={{ marked: markedDates }}
                formatters={{ formatShortWeekday }}
                components={{
                  Day: DayWithDot,
                }}
              />
            </CardContent>
          </Card>

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
                      <div className='mt-1'>
                        {item.type === 'Event' ? (
                          <CalendarCheck className="h-5 w-5 text-primary" />
                        ) : (
                          <CheckSquare className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={item.type === 'Event' ? 'default' : 'secondary'}>
                            {item.type}
                          </Badge>
                          {item.type === 'Task' && (
                            <Badge variant="outline">{item.parentEventName}</Badge>
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
      </div>
    </div>
  );
}
