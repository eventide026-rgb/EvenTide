
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, deleteDoc, addDoc, orderBy, documentId } from 'firebase/firestore';
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
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, PlusCircle, Trash2, DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';

type EventPlannerAssignment = {
    id: string;
    eventId: string;
};

type Event = {
  id: string;
  name: string;
};

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Unpaid';
};

const expenseFormSchema = z.object({
  category: z.string().min(2, 'Category is required.'),
  description: z.string().optional(),
  amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
  status: z.enum(['Paid', 'Unpaid']),
});

const KPICard = ({ title, value, prefix, icon: Icon }: { title: string; value: number; prefix?: string; icon: React.ElementType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {prefix}{value.toLocaleString()}
        </div>
      </CardContent>
    </Card>
);

export default function BudgetPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: { category: 'Venue', description: '', amount: 0, status: 'Unpaid' },
  });

  const plannerAssignmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'planners', user.uid, 'assignments'));
  }, [firestore, user?.uid]);
  const { data: assignments, isLoading: isLoadingAssignments } = useCollection<EventPlannerAssignment>(plannerAssignmentsQuery);
  const eventIds = useMemo(() => assignments?.map((a: any) => a.eventId) || [], [assignments]);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || eventIds.length === 0) return null;
    return query(collection(firestore, 'events'), where(documentId(), 'in', eventIds));
  }, [firestore, eventIds]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const expensesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'expenses'), orderBy('amount', 'desc'));
  }, [firestore, selectedEventId]);

  const { data: expenses, isLoading: isLoadingExpenses } = useCollection<Expense>(expensesQuery);

  const financials = useMemo(() => {
      if (!expenses) return { totalBudget: 0, totalPaid: 0, totalOutstanding: 0 };
      
      const totalBudget = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalPaid = expenses.filter(exp => exp.status === 'Paid').reduce((sum, exp) => sum + exp.amount, 0);
      const totalOutstanding = totalBudget - totalPaid;

      return { totalBudget, totalPaid, totalOutstanding };
  }, [expenses]);

  const handleAddExpense = async (values: z.infer<typeof expenseFormSchema>) => {
    if (!firestore || !selectedEventId) return;
    await addDoc(collection(firestore, 'events', selectedEventId, 'expenses'), values);
    toast({ title: 'Expense Added' });
    form.reset();
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!firestore || !selectedEventId) return;
    await deleteDoc(doc(firestore, 'events', selectedEventId, 'expenses', expenseId));
    toast({ title: 'Expense Deleted' });
  };
  
  const isLoading = isLoadingAssignments || isLoadingEvents;
  const isDataLoading = isLoadingExpenses && !!selectedEventId;

  return (
    <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 space-y-6">
         <div className="grid gap-4 md:grid-cols-3">
            <KPICard title="Total Budget" value={financials.totalBudget} prefix="₦" icon={DollarSign} />
            <KPICard title="Total Paid" value={financials.totalPaid} prefix="₦" icon={DollarSign} />
            <KPICard title="Total Outstanding" value={financials.totalOutstanding} prefix="₦" icon={DollarSign} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Expense Log</CardTitle>
            <CardDescription>
              {selectedEventId ? 'Full list of expenses for the selected event.' : 'Select an event to see expenses.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isDataLoading ? (
                <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : expenses && expenses.length > 0 ? (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount (₦)</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map(exp => (
                                <TableRow key={exp.id}>
                                    <TableCell><Badge variant="secondary">{exp.category}</Badge></TableCell>
                                    <TableCell>{exp.description}</TableCell>
                                    <TableCell><Badge variant={exp.status === 'Paid' ? 'default' : 'outline'}>{exp.status}</Badge></TableCell>
                                    <TableCell className="font-mono">{exp.amount.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(exp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="text-center py-16 border-dashed border-2 rounded-lg">
                    <p className="text-muted-foreground">No expenses logged yet.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader><CardTitle>Select Event</CardTitle></CardHeader>
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
        <Card>
            <CardHeader><CardTitle>Log New Expense</CardTitle></CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddExpense)} className="space-y-4">
                        <FormField control={form.control} name="category" render={({field}) => (
                            <FormItem><FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Venue">Venue</SelectItem>
                                        <SelectItem value="Catering">Catering</SelectItem>
                                        <SelectItem value="Decor">Decor</SelectItem>
                                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                                        <SelectItem value="Marketing">Marketing</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage/></FormItem>
                        )}/>
                        <FormField control={form.control} name="description" render={({field}) => (
                            <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage/></FormItem>
                        )}/>
                        <FormField control={form.control} name="amount" render={({field}) => (
                            <FormItem><FormLabel>Amount (₦)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                        )}/>
                        <FormField control={form.control} name="status" render={({field}) => (
                            <FormItem><FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                    <SelectContent><SelectItem value="Unpaid">Unpaid</SelectItem><SelectItem value="Paid">Paid</SelectItem></SelectContent>
                                </Select>
                            <FormMessage/></FormItem>
                        )}/>
                        <Button type="submit" disabled={!selectedEventId || form.formState.isSubmitting} className="w-full">
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <PlusCircle className="mr-2 h-4 w-4" />}
                            Add Expense
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
