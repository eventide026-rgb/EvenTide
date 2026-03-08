
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, documentId, orderBy } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, CalendarIcon, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DndContext, useDroppable, useDraggable, DragEndEvent } from '@dnd-kit/core';

type Event = {
  id: string;
  name: string;
  ownerId: string;
  plannerIds?: string[];
  cohostIds?: Record<string, boolean>;
};

type UserProfile = {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
}

type Task = {
  id: string;
  title: string;
  assigneeId?: string;
  dueDate?: any; // Firestore Timestamp
  status: 'To Do' | 'In Progress' | 'Completed';
};

const taskFormSchema = z.object({
  title: z.string().min(3, 'Task title is required.'),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
});

function TaskCard({ task, teamMembers, onDelete, isReadOnly }: { task: Task; teamMembers: UserProfile[]; onDelete: () => void; isReadOnly: boolean }) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: task.id,
        data: { task },
        disabled: isReadOnly,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
    } : undefined;

    const assignee = teamMembers.find(m => m.id === task.assigneeId);

    return (
        <Card ref={setNodeRef} style={style} {...listeners} {...attributes} className={cn("bg-background cursor-grab", isReadOnly && "cursor-default")}>
            <CardContent className="p-3 space-y-2 relative">
                <p className="font-semibold text-sm">{task.title}</p>
                 <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground space-y-1">
                        {assignee && <p>To: {assignee.firstName}</p>}
                        {task.dueDate && <p>Due: {format(task.dueDate.toDate(), 'MMM dd')}</p>}
                    </div>
                 </div>
                 {!isReadOnly && <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
            </CardContent>
        </Card>
    )
}

function TaskColumn({ id, title, tasks, children }: { id: string; title: string; tasks: Task[]; children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div ref={setNodeRef}>
            <Card className="bg-muted/50 h-full flex flex-col">
                <CardHeader>
                    <CardTitle className='text-base'>{title} ({tasks.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 flex-1 overflow-y-auto">
                    {children}
                </CardContent>
            </Card>
        </div>
    )
}


export function TaskBoard({ isReadOnly }: { isReadOnly: boolean }) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);

  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { title: '', assigneeId: user?.uid },
  });

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where(isReadOnly ? 'ownerId' : 'plannerIds', 'array-contains', user.uid));
  }, [firestore, user?.uid, isReadOnly]);

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
        const eventRef = doc(firestore, 'events', selectedEventId);
        const eventSnap = await getDoc(eventRef);
        if (!eventSnap.exists()) {
             setTeamMembers([]);
             setIsLoadingTeam(false);
             return;
        }
        const eventData = eventSnap.data() as Event;
        
        const memberIds = new Set<string>();
        if (eventData.ownerId) memberIds.add(eventData.ownerId);
        if (eventData.plannerIds) eventData.plannerIds.forEach(id => memberIds.add(id));
        if (eventData.cohostIds) Object.keys(eventData.cohostIds).forEach(id => memberIds.add(id));
        
        if (memberIds.size > 0) {
            const usersQuery = query(collection(firestore, 'users'), where(documentId(), 'in', Array.from(memberIds)));
            const usersSnap = await getDocs(usersQuery);
            const members = usersSnap.docs.map(d => ({id: d.id, ...d.data()} as UserProfile));
            setTeamMembers(members);
        } else {
            setTeamMembers([]);
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.data.current?.task) {
        const task = active.data.current.task as Task;
        const newStatus = over.id as Task['status'];
        if (task.status !== newStatus) {
            const taskRef = doc(firestore, 'events', selectedEventId!, 'tasks', task.id);
            await updateDoc(taskRef, { status: newStatus });
        }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
      if(!firestore || !selectedEventId) return;
      await deleteDoc(doc(firestore, 'events', selectedEventId, 'tasks', taskId));
      toast({title: "Task Deleted"});
  }

  const isLoading = isLoadingEvents;
  const taskColumns = {
      'To Do': tasks?.filter(t => t.status === 'To Do') || [],
      'In Progress': tasks?.filter(t => t.status === 'In Progress') || [],
      'Completed': tasks?.filter(t => t.status === 'Completed') || [],
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
        <div className="grid md:grid-cols-4 gap-6 items-start h-full">
            <div className="md:col-span-3 h-full">
                {selectedEventId ? (
                    <div className="grid md:grid-cols-3 gap-6 items-start h-full">
                        {isLoadingTasks ? (
                            <div className="md:col-span-3 flex justify-center items-center h-64">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                               <TaskColumn id="To Do" title="To Do" tasks={taskColumns['To Do']}>
                                    {taskColumns['To Do'].map(task => <TaskCard key={task.id} task={task} teamMembers={teamMembers} onDelete={() => handleDeleteTask(task.id)} isReadOnly={isReadOnly} />)}
                                </TaskColumn>
                                <TaskColumn id="In Progress" title="In Progress" tasks={taskColumns['In Progress']}>
                                    {taskColumns['In Progress'].map(task => <TaskCard key={task.id} task={task} teamMembers={teamMembers} onDelete={() => handleDeleteTask(task.id)} isReadOnly={isReadOnly} />)}
                                </TaskColumn>
                                <TaskColumn id="Completed" title="Completed" tasks={taskColumns['Completed']}>
                                    {taskColumns['Completed'].map(task => <TaskCard key={task.id} task={task} teamMembers={teamMembers} onDelete={() => handleDeleteTask(task.id)} isReadOnly={isReadOnly} />)}
                                </TaskColumn>
                            </>
                        )}
                    </div>
                ) : (
                    <Card className="h-full flex items-center justify-center text-muted-foreground">
                        <p>Select an event to view the task board.</p>
                    </Card>
                )}
            </div>

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
                                <FormField control={form.control} name="dueDate" render={({field}) => <FormItem className="flex flex-col"><FormLabel>Due Date</FormLabel><Popover><PopoverTrigger asChild><FormControl><Button variant="outline" className={cn(!field.value && 'text-muted-foreground')}>{field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}<CalendarIcon className="ml-auto h-4 w-4 opacity-50"/></Button></FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage/></FormItem>}/>
                                <Button type="submit" disabled={!selectedEventId || form.formState.isSubmitting} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Add Task</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}
        </div>
        </div>
    </DndContext>
  );
}
