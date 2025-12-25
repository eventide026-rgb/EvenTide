
'use client';

import { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, DollarSign } from 'lucide-react';
import { Label } from '@/components/ui/label';

type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type Expense = {
  id: string;
  category: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Unpaid';
};

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

export default function ExpensesPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);

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


  const isLoading = isUserLoading || isLoadingEvents;
  const isLoadingData = isLoadingExpenses || (selectedEventId && !expenses);

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle>Expense Tracker</CardTitle>
          <CardDescription>Select an event to monitor its budget and expenditures in real-time. This is a read-only view of expenses logged by your planner.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label>Select Event</Label>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select an event to view expenses" />
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
        <>
            <div className="grid gap-4 md:grid-cols-3">
                <KPICard title="Total Budget" value={financials.totalBudget} prefix="₦" icon={DollarSign} />
                <KPICard title="Total Paid" value={financials.totalPaid} prefix="₦" icon={DollarSign} />
                <KPICard title="Total Outstanding" value={financials.totalOutstanding} prefix="₦" icon={DollarSign} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expense Log</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingData ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount (₦)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {expenses && expenses.length > 0 ? expenses.map(exp => (
                                        <TableRow key={exp.id}>
                                            <TableCell className="font-medium">{exp.category}</TableCell>
                                            <TableCell>{exp.description}</TableCell>
                                            <TableCell><Badge variant={exp.status === 'Paid' ? 'default' : 'outline'}>{exp.status}</Badge></TableCell>
                                            <TableCell className="text-right font-mono">{exp.amount.toLocaleString()}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                No expenses have been logged for this event yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
      )}
    </div>
  );
}
