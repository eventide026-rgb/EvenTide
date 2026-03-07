
'use client';

import { useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CalendarIcon, MapPin, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Countdown } from '@/components/countdown';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NigerianStatesAndCities } from '@/lib/nigerian-states';

export const logisticsSchema = z.object({
  location: z.string().min(5, "Venue address is required."),
  city: z.string().min(2, "City is required."),
  eventDate: z.date({ required_error: "Please select a date and time." }),
  budget: z.coerce.number().min(1000, "Please set a target budget."),
});

export function LogisticsStep() {
  const { control, watch } = useFormContext();
  const eventDate = watch('eventDate');

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <FormField
            control={control}
            name="location"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Venue Name / Address</FormLabel>
                <FormControl>
                <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-10" placeholder="e.g., Landmark Centre, Victoria Island" {...field} />
                </div>
                </FormControl>
                <FormMessage />
            </FormItem>
            )}
        />
        <FormField
            control={control}
            name="city"
            render={({ field }) => (
            <FormItem>
                <FormLabel>City (for Vendor Matching)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {NigerianStatesAndCities.flatMap(s => s.cities).sort().map(city => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
            )}
        />
      </div>

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
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
            control={control}
            name="budget"
            render={({ field }) => (
            <FormItem>
                <FormLabel>Target Budget (₦)</FormLabel>
                <FormControl>
                <div className="relative">
                    <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" className="pl-10" placeholder="500000" {...field} />
                </div>
                </FormControl>
                <FormDescription>Help us match you with vendors in your price range.</FormDescription>
                <FormMessage />
            </FormItem>
            )}
        />
      </div>

      {eventDate && (
        <div className="space-y-2">
            <Label className="text-muted-foreground">Countdown to your masterpiece</Label>
            <div className="p-6 rounded-2xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                <Countdown date={eventDate.toISOString()} />
            </div>
        </div>
      )}
    </div>
  );
}
