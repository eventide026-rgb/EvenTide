

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  where,
  doc,
  writeBatch,
  getDocs,
  limit,
  serverTimestamp,
  documentId
} from 'firebase/firestore';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Search, Trash2 } from 'lucide-react';
import { Label } from '../ui/label';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


type EventPlannerAssignment = {
    id: string;
    eventId: string;
};

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type UserProfile = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
};

type TeamMember = {
    id: string;
    role: 'Planner' | 'Co-host' | 'Security';
    status: 'Pending' | 'Accepted' | 'Declined';
    user: UserProfile;
}

const inviteFormSchema = z.object({
  email: z.string().email('Please enter a valid email to search.'),
  role: z.enum(['Co-host', 'Security'], {
    required_error: 'Please select a role for the team member.',
  }),
});

const findUserByEmail = async (firestore: any, email: string): Promise<UserProfile | null> => {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const userDoc = querySnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as UserProfile;
}


export function TeamManagement() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<z.infer<typeof inviteFormSchema>>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: { email: '', role: 'Co-host' },
  });

  const plannerAssignmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'planners'), where('plannerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: assignments, isLoading: isLoadingAssignments } = useCollection<EventPlannerAssignment>(plannerAssignmentsQuery);
  const eventIds = useMemo(() => assignments?.map(a => a.eventId) || [], [assignments]);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return undefined;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

  const { data: events, isLoading: isLoadingEvents } =
    useCollection<Event>(eventsQuery);

  const cohostsQuery = useMemoFirebase(() => {
      if(!firestore || !selectedEventId) return null;
      return collection(firestore, 'events', selectedEventId, 'cohosts');
  }, [firestore, selectedEventId]);

  const {data: cohosts, isLoading: isLoadingTeam } = useCollection(cohostsQuery);
  
  const teamMembers = useMemo(() => {
      return cohosts?.map(c => ({...c, role: 'Co-host'})) || [];
  }, [cohosts]);

  const handleSearchUser = async () => {
      if (!firestore) return;
      const email = form.getValues('email');
      if(!email) {
          form.setError('email', {message: 'Email cannot be empty.'});
          return;
      }
      setIsSearching(true);
      setFoundUser(null);
      const userResult = await findUserByEmail(firestore, email);
      if(userResult) {
          setFoundUser(userResult);
      } else {
          toast({ variant: 'destructive', title: 'User Not Found', description: `No user with email ${email} exists on EvenTide.`});
      }
      setIsSearching(false);
  }

  const handleSendInvite = async () => {
    if (!firestore || !user || !selectedEventId || !foundUser) return;

    const role = form.getValues('role');
    const collectionName = 'cohosts'; // Simplified for now
    const batch = writeBatch(firestore);
    
    const teamMemberRef = doc(firestore, 'events', selectedEventId, collectionName, foundUser.id);
    const teamMemberData = {
        userId: foundUser.id,
        status: 'Pending',
        invitedAt: new Date(),
    };
    batch.set(teamMemberRef, teamMemberData);

    const notificationRef = doc(collection(firestore, 'users', foundUser.id, 'notifications'));
    const notificationData = {
        message: `You have been invited to be a ${role} for an event.`,
        link: `/cohost-dashboard/invitations`,
        read: false,
        createdAt: new Date(),
        userId: foundUser.id,
        eventId: selectedEventId
    };
    batch.set(notificationRef, notificationData);
    
    batch.commit()
      .then(() => {
        toast({ title: 'Invitation Sent!', description: `${foundUser.firstName} has been invited as a ${role}.`});
        setFoundUser(null);
        form.reset();
      })
      .catch((serverError) => {
        const contextualError = new FirestorePermissionError({
          path: teamMemberRef.path,
          operation: 'create',
          requestResourceData: { teamMemberData, notificationData },
        });
        errorEmitter.emit('permission-error', contextualError);
      });
  }

  const isLoading = isUserLoading || isLoadingEvents;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start h-full">
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Team Roster</CardTitle>
           <CardDescription>
            {selectedEventId ? `Showing team for your selected event.` : "Select an event to see the team list."}
          </CardDescription>
        </CardHeader>
        <CardContent>
            {isLoadingTeam ? (
                 <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : teamMembers && teamMembers.length > 0 ? (
                 <div className="rounded-md border">
                    <Table>
                        <TableHeader><TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                            {teamMembers.map(member => (
                                <TableRow key={member.id}>
                                    <TableCell>{member.userId}</TableCell>
                                    <TableCell><Badge variant="secondary">{member.role}</Badge></TableCell>
                                    <TableCell>{member.status || 'Accepted'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                 <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-semibold">Your team is empty</h3>
                    <p className="mt-1 text-muted-foreground">
                        {selectedEventId ? "Use the form to start inviting team members." : "Select an event to begin."}
                    </p>
                </div>
            )}
        </CardContent>
      </Card>
       <div className="md:col-span-1 space-y-6">
         <Card>
            <CardHeader>
                <CardTitle>Invite Team Member</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="space-y-4">
                    <div>
                        <Label>1. Select Event</Label>
                         {isLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /><span>Loading events...</span></div>
                        ) : (
                            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                            <SelectTrigger><SelectValue placeholder="Choose an event" /></SelectTrigger>
                            <SelectContent>
                                {events && events.length > 0 ? (
                                events.map((event) => (<SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>))
                                ) : (
                                <SelectItem value="no-events" disabled>No events assigned</SelectItem>
                                )}
                            </SelectContent>
                            </Select>
                        )}
                    </div>
                     <Form {...form}>
                        <form onSubmit={e => e.preventDefault()} className="space-y-4 pt-4 border-t">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>2. Find User by Email</FormLabel>
                                    <div className='flex gap-2'>
                                        <FormControl><Input type="email" placeholder="cohost@example.com" {...field} disabled={!selectedEventId} /></FormControl>
                                        <Button type="button" onClick={handleSearchUser} disabled={!selectedEventId || isSearching}>
                                            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            {foundUser && (
                                <Card className="bg-muted p-4">
                                    <p className='font-semibold'>{foundUser.firstName} {foundUser.lastName}</p>
                                    <p className='text-sm text-muted-foreground'>{foundUser.email}</p>
                                    <FormField control={form.control} name="role" render={({ field }) => (
                                        <FormItem className='mt-4'>
                                            <FormLabel>3. Assign Role</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Co-host">Co-host</SelectItem>
                                                    <SelectItem value="Security">Security</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )} />
                                    <Button className='w-full mt-4' onClick={handleSendInvite}>Send Invite</Button>
                                </Card>
                            )}
                        </form>
                    </Form>
                 </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
