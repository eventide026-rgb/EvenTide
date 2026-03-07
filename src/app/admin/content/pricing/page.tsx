'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit, PlusCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';


const planSchema = z.object({
  name: z.string().min(2, "Plan name is required."),
  price: z.coerce.number().min(0, "Price must be a non-negative number."),
  guestLimit: z.coerce.number().min(1, "Guest limit must be at least 1."),
  plannerLimit: z.coerce.number().min(0),
  cohostLimit: z.coerce.number().min(0),
  securityPersonnelLimit: z.coerce.number().min(0),
});

type PricePlan = z.infer<typeof planSchema> & { id: string };

export default function PricingPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricePlan | null>(null);

  const form = useForm<z.infer<typeof planSchema>>({
    resolver: zodResolver(planSchema),
  });

  const plansQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "price_plans"));
  }, [firestore]);

  const { data: plans, isLoading } = useCollection<PricePlan>(plansQuery);

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "price_plans", id);
    try {
      await deleteDoc(docRef);
      toast({
        title: 'Plan Deleted',
        description: 'The pricing plan has been successfully removed.',
      });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the pricing plan.',
      });
    }
  };

  const handleEditClick = (plan: PricePlan) => {
    setEditingPlan(plan);
    form.reset(plan);
  };

  const handleFormSubmit = async (values: z.infer<typeof planSchema>) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      if (editingPlan) {
        // Update existing plan
        const planRef = doc(firestore, "price_plans", editingPlan.id);
        await updateDoc(planRef, values);
        toast({ title: "Plan Updated", description: "The plan has been successfully updated." });
      } else {
        // Add new plan
        await addDoc(collection(firestore, "price_plans"), values);
        toast({ title: "Plan Added", description: "The new plan has been created." });
      }
      setEditingPlan(null);
      form.reset();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({ variant: "destructive", title: "Save Failed", description: "Could not save the pricing plan." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <div>
          <CardTitle>Pricing Plan Management</CardTitle>
          <CardDescription>Create, edit, and delete the subscription plans available to event owners.</CardDescription>
        </div>
        <Dialog onOpenChange={(open) => !open && setEditingPlan(null)}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add New Plan</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Plan Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price (₦)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="guestLimit" render={({ field }) => (
                  <FormItem><FormLabel>Guest Limit</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="plannerLimit" render={({ field }) => (
                  <FormItem><FormLabel>Planner Limit</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="cohostLimit" render={({ field }) => (
                  <FormItem><FormLabel>Co-host Limit</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                 <FormField control={form.control} name="securityPersonnelLimit" render={({ field }) => (
                  <FormItem><FormLabel>Security Limit</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )}/>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Plan'}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Price (₦)</TableHead>
                  <TableHead>Max Guests</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans && plans.length > 0 ? (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>{plan.price.toLocaleString()}</TableCell>
                      <TableCell>{plan.guestLimit}</TableCell>
                      <TableCell className="text-right">
                        <Dialog onOpenChange={(open) => !open && setEditingPlan(null)}>
                           <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(plan)}>
                                    <Edit className="h-4 w-4" />
                                </Button>
                           </DialogTrigger>
                        </Dialog>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the {plan.name} pricing plan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(plan.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No pricing plans found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
