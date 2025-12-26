
'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';

export const logisticsSchema = z.object({
  location: z.string().min(5, "Location is required."),
  eventDate: z.date({ required_error: "Please select a date and time." }),
});

export function LogisticsStep() {
  const { control } = useFormContext();

  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location / Venue</FormLabel>
            <FormControl>
              <Input placeholder="e.g., The Landmark Centre, VI, Lagos" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="eventDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Event Date & Time</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? format(field.value, "PPP p") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
                 <div className="p-2 border-t">
                    <Input type="time" defaultValue={field.value ? format(field.value, 'HH:mm') : '12:00'} onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(field.value || new Date());
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        field.onChange(newDate);
                    }} />
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
