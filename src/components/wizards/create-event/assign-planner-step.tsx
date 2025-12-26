
'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

export const assignPlannerSchema = z.object({
  plannerId: z.string().optional(),
});

type Planner = {
    id: string;
    firstName: string;
    lastName: string;
}

export function AssignPlannerStep() {
  const { control } = useFormContext();
  const firestore = useFirestore();

  const plannersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), where('role', '==', 'Planner'));
  }, [firestore]);
  
  const { data: planners, isLoading } = useCollection<Planner>(plannersQuery);

  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="plannerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assign a Planner (Optional)</FormLabel>
             <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoading ? "Loading planners..." : "Select a planner to manage this event"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                    ) : (
                        planners?.map(planner => (
                            <SelectItem key={planner.id} value={planner.id}>
                                {planner.firstName} {planner.lastName}
                            </SelectItem>
                        ))
                    )}
                </SelectContent>
            </Select>
            <FormDescription>
                You can skip this step and assign a planner later from your team management dashboard.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
