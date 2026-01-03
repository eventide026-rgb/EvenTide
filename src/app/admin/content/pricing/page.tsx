
'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, doc, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Edit } from 'lucide-react';
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

type PricePlan = {
  id: string;
  name: string;
  price: number;
  maxGuests: number;
  planners: number;
  cohosts: number;
};

export default function PricingPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

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

  return (
    <Card>
      <CardHeader className='flex-row items-center justify-between'>
        <div>
          <CardTitle>Pricing Plan Management</CardTitle>
          <CardDescription>Create, edit, and delete the subscription plans available to event owners.</CardDescription>
        </div>
        <Button>Add New Plan</Button>
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
                      <TableCell>{plan.maxGuests}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
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
                                This action cannot be undone. This will permanently delete the pricing plan.
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
