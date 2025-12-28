
'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useFirestore } from '@/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Loader2, Search, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

export const assignPlannerSchema = z.object({
  plannerId: z.string().optional(),
});

type Planner = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export function AssignPlannerStep() {
  const { control, setValue, getValues, watch } = useFormContext();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundPlanner, setFoundPlanner] = useState<Planner | null>(null);

  const assignedPlannerId = watch('plannerId');

  const handleSearch = async () => {
    if (!searchEmail || !firestore) {
        toast({ variant: "destructive", title: "Please enter an email address."});
        return;
    };
    setIsSearching(true);
    setFoundPlanner(null);
    setValue('plannerId', undefined); // Clear previous assignment

    const plannersQuery = query(collection(firestore, 'users'), where('email', '==', searchEmail), where('role', '==', 'Planner'), limit(1));
    
    try {
        const querySnapshot = await getDocs(plannersQuery);
        if (querySnapshot.empty) {
            toast({ variant: "destructive", title: "Planner Not Found", description: "No planner with that email exists."});
        } else {
            const plannerData = querySnapshot.docs[0].data() as Planner;
            plannerData.id = querySnapshot.docs[0].id;
            setFoundPlanner(plannerData);
        }
    } catch(error) {
        console.error("Error searching for planner:", error);
        toast({ variant: "destructive", title: "Search Failed" });
    } finally {
        setIsSearching(false);
    }
  }

  const handleAssign = () => {
      if (foundPlanner) {
          setValue('plannerId', foundPlanner.id);
          toast({ title: "Planner Assigned!", description: `${foundPlanner.firstName} ${foundPlanner.lastName} is now assigned to this event.`});
      }
  }

  return (
    <div className="space-y-4">
        <div>
            <Label htmlFor="planner-email">Find Planner by Email (Optional)</Label>
            <FormDescription>You can skip this and assign a planner later.</FormDescription>
            <div className="flex gap-2 mt-2">
                <Input 
                    id="planner-email"
                    placeholder="planner@example.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                />
                <Button type="button" onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span className="sr-only">Search</span>
                </Button>
            </div>
        </div>

        {foundPlanner && (
            <Card>
                <CardHeader>
                    <CardTitle>Planner Found</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold">{foundPlanner.firstName} {foundPlanner.lastName}</p>
                        <p className="text-sm text-muted-foreground">{foundPlanner.email}</p>
                    </div>
                     {assignedPlannerId === foundPlanner.id ? (
                        <Badge variant="default" className="flex items-center gap-2 bg-green-600">
                           <UserCheck className="h-4 w-4" /> Assigned
                        </Badge>
                     ) : (
                        <Button type="button" onClick={handleAssign}>Assign to Event</Button>
                     )}
                </CardContent>
            </Card>
        )}
         {/* Hidden field to hold the value for the form schema */}
        <FormField control={control} name="plannerId" render={({ field }) => (
            <FormItem className="hidden">
                <FormControl><Input {...field} /></FormControl>
            </FormItem>
        )} />
    </div>
  );
}
