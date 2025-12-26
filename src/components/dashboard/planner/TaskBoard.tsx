'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, addDoc, updateDoc, deleteDoc, getDocs, documentId } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, UserPlus, CalendarIcon, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

type EventPlannerAssignment = {
    id: string;
    eventId: string;
};

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type TeamMemberProfile = {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
}

type Task = {
  id: string;
  title: string;
  assigneeId: string;
  dueDate?: any; // Firestore Timestamp
  status: 'To Do' | 'In Progress' | 'Completed';
};

const taskFormSchema = z.object({
  title: z.string().min(3, 'Task title is required.'),
  assigneeId: z.string({ required_error: 'Please assign this task.' }),
  dueDate: z.date().optional(),
});

export function TaskBoard({ isReadOnly }: { isReadOnly: boolean }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberProfile[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: '', assigneeId: user?.uid },
  });

  const plannerAssignmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'planners'), where('plannerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: assignments, isLoading: isLoadingAssignments } = useCollection<EventPlannerAssignment>(plannerAssignmentsQuery);
  
  const eventIds = useMemo(() => assignments?.map(a => a.eventId) || [], [assignments]);
  
  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || eventIds.length === 0) return null;
    return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
  }, [firestore, eventIds]);

  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const tasksQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'tasks'), orderBy('dueDate', 'asc'));
  }, [firestore, selectedEventId]);

  const { data: tasks, isLoading: isLoadingTasks } = useCollection<Task>(tasksQuery);
  
  useEffect(() => {
    if (!selectedEventId || !firestore) {
        setTeamMembers([]);
        return;
    };
    
    const fetchTeam = async () => {
        setIsLoadingTeam(true);
        const memberIds = new Set<string>();
        const eventRef = doc(firestore, 'events', selectedEventId);
        const eventSnap = await getDocs(query(collection(eventRef, 'planners')));
        eventSnap.forEach(doc => memberIds.add(doc.id));
        const cohostsSnap = await getDocs(query(collection(eventRef, 'cohosts')));
        cohostsSnap.forEach(doc => memberIds.add(doc.id));
        
        const ownerId = (await getDocs(query(collection(firestore, 'events'), where(documentId(), '==', selectedEventId)))).docs[0]?.data().ownerId;
        if(ownerId) memberIds.add(ownerId);
        
        if (memberIds.size > 0) {
            const usersQuery = query(collection(firestore, 'users'), where(documentId(), 'in', Array.from(memberIds)));
            const usersSnap = await getDocs(usersQuery);
            const members = usersSnap.docs.map(d => ({id: d.id, ...d.data()} as TeamMemberProfile));
            setTeamMembers(members);
        }
        setIsLoadingTeam(false);
    }
    fetchTeam();
  }, [selectedEventId, firestore]);

  const handleAddTask = async (values: z.infer<typeof taskFormSchema>) => {
    if (!firestore || !selectedEventId) return;
    await addDoc(collection(firestore, 'events', selectedEventId, 'tasks'), {
        ...values,
        status: 'To Do',
    });
    toast({ title: 'Task Added' });
    form.reset();
  };

  const handleStatusChange = async (taskId: string, status: Task['status']) => {
      if(!firestore || !selectedEventId) return;
      const taskRef = doc(firestore, 'events', selectedEventId, 'tasks', taskId);
      await updateDoc(taskRef, { status });
  }

  const handleDeleteTask = async (taskId: string) => {
      if(!firestore || !selectedEventId) return;
      await deleteDoc(doc(firestore, 'events', selectedEventId, 'tasks', taskId));
      toast({title: "Task Deleted"});
  }

  const isLoading = isLoadingAssignments || isLoadingEvents;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start h-full">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Task Board</CardTitle>
          <CardDescription>
            {selectedEventId ? 'Manage your event tasks.' : 'Select an event to see tasks.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTasks && selectedEventId ? (
            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : tasks && tasks.length > 0 ? (
            <div className="rounded-md border">
              <Table><TableHeader><TableRow><TableHead>Task</TableHead><TableHead>Assigned To</TableHead><TableHead>Due Date</TableHead><TableHead>Status</TableHead>{!isReadOnly && <TableHead className='text-right'>Actions</TableHead>}</TableRow></TableHeader>
                <TableBody>
                  {tasks.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className='font-medium'>{task.title}</TableCell>
                      <TableCell>{teamMembers.find(m => m.id === task.assigneeId)?.firstName || 'Unassigned'}</TableCell>
                      <TableCell>{task.dueDate ? format(task.dueDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                      <TableCell>
                        <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value as Task['status'])} disabled={isReadOnly}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="To Do">To Do</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent>
                        </Select>
                      </TableCell>
                       {!isReadOnly && (
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                       )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16 border-dashed border-2 rounded-lg">
                <h3 className="text-xl font-semibold">No tasks yet.</h3>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="md:col-span-1 space-y-6">
        <Card><CardHeader><CardTitle>Select Event</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className='h-5 w-5 animate-spin' /> : (
              <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
                <SelectContent>
                    {events?.map(event => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>
        {!isReadOnly && (
            <Card><CardHeader><CardTitle>New Task</CardTitle></CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleAddTask)} className="space-y-4">
                             <FormField control={form.control} name="title" render={({field}) => <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>} />
                             <FormField control={form.control} name="assigneeId" render={({field}) => <FormItem><FormLabel>Assign To</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger disabled={isLoadingTeam}><SelectValue placeholder={isLoadingTeam ? "Loading team..." : "Select a team member"} /></SelectTrigger></FormControl><SelectContent>{teamMembers.map(m => <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>)}</SelectContent></Select><FormMessage/></FormItem>} />
                             <FormField control={form.control} name="dueDate" render={({field}) => <FormItem className="flex flex-col"><FormLabel>Due Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50"/></Button></FormControl></PopoverTrigger><PopoverContent><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage/></FormItem>}/>
                             <Button type="submit" disabled={!selectedEventId || form.formState.isSubmitting} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
