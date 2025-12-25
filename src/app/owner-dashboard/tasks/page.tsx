
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type Task = {
  id: string;
  title: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: any;
};

const TaskCard = ({ task }: { task: Task }) => (
    <Card className="bg-background">
        <CardContent className="p-3">
            <p className="font-semibold text-sm">{task.title}</p>
            <p className="text-xs text-muted-foreground mt-1">Due: {task.dueDate.toDate().toLocaleDateString()}</p>
        </CardContent>
    </Card>
)

export default function TrackTasksPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);
  
  const tasksQuery = useMemoFirebase(() => {
      if(!firestore || !selectedEventId) return null;
      return query(collection(firestore, 'events', selectedEventId, 'tasks'));
  }, [firestore, selectedEventId]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);

  const isLoading = isUserLoading || isLoadingEvents;
  
  const taskColumns = {
      pending: tasks?.filter(t => t.status === 'pending') || [],
      'in-progress': tasks?.filter(t => t.status === 'in-progress') || [],
      completed: tasks?.filter(t => t.status === 'completed') || [],
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Card>
        <CardHeader>
          <CardTitle>Track Tasks</CardTitle>
          <CardDescription>
            Monitor the progress of tasks being managed by your planner. This is a read-only view.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Select an Event</Label>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select an event to track tasks" />
              </SelectTrigger>
              <SelectContent>
                {events && events.length > 0 ? (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-events" disabled>You have no events.</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedEventId && (
        <div className="flex-grow grid md:grid-cols-3 gap-6 items-start">
            {isLoadingTasks ? (
                <div className="md:col-span-3 flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <Card className="bg-muted/50 h-full">
                        <CardHeader><CardTitle className='text-base'>To Do</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                           {taskColumns.pending.map(task => <TaskCard key={task.id} task={task} />)}
                           {taskColumns.pending.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No tasks.</p>}
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/50 h-full">
                        <CardHeader><CardTitle className='text-base'>In Progress</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                           {taskColumns['in-progress'].map(task => <TaskCard key={task.id} task={task} />)}
                           {taskColumns['in-progress'].length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No tasks.</p>}
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/50 h-full">
                        <CardHeader><CardTitle className='text-base'>Completed</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                           {taskColumns.completed.map(task => <TaskCard key={task.id} task={task} />)}
                           {taskColumns.completed.length === 0 && <p className="text-sm text-center text-muted-foreground py-4">No tasks.</p>}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
      )}
    </div>
  );
}
