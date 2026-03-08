
'use client';

import EventCalendar from '@/components/events/event-calendar';

export default function CalendarPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="pb-4 border-b">
        <h1 className="text-3xl font-bold font-headline">My Calendar</h1>
        <p className="text-muted-foreground">
          A unified view of all your events and task deadlines.
        </p>
      </header>

      <div className="flex-1 mt-6">
        <EventCalendar />
      </div>
    </div>
  );
}
