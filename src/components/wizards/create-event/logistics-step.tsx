
'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Countdown } from '@/components/countdown';
import { Label } from '@/components/ui/label';

export const logisticsSchema = z.object({
  location: z.string().min(5, "Location is required."),
  eventDate: z.date({ required_error: "Please select a date and time." }),
});

export function LogisticsStep() {
  const { control, watch } = useFormContext();
  const eventDate = watch('eventDate');

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
      <div className="grid md:grid-cols-2 gap-8 items-start">
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
                        "pl-3 text-left font-normal h-12",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP p")
                      ) : (
                        <span>Pick a date and time</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                  <div className="p-2 border-t border-border">
                      <Input 
                          type="time" 
                          defaultValue={field.value ? format(field.value, 'HH:mm') : '12:00'}
                          onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(':');
                              const newDate = new Date(field.value || new Date());
                              newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                              field.onChange(newDate);
                          }}
                      />
                  </div>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the date and time for your event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {eventDate && (
            <div className="space-y-2">
                <Label>Event Countdown</Label>
                <div className="p-4 rounded-lg bg-muted border flex items-center justify-center">
                    <Countdown date={eventDate.toISOString()} />
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
