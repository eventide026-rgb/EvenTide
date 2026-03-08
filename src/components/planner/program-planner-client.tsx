
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { generateProgramSuggestions } from '@/ai/flows/generate-program-suggestions';
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
import { Label } from '@/components/ui/label';
import { Loader2, CirclePlus, Save, Sparkles, Trash2 } from 'lucide-react';

type Event = {
  id: string;
  name: string;
  eventType: string;
};

const programItemSchema = z.object({
  title: z.string().min(2, 'Title is required.'),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:MM format.'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  notes: z.string().optional(),
  status: z.enum(['Upcoming', 'In Progress', 'Completed']),
});

const programSchema = z.object({
  program: z.array(programItemSchema),
});

type ProgramData = z.infer<typeof programSchema>;

const aiFormSchema = z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:MM format.'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Use HH:MM format.'),
    mcName: z.string().optional(),
});

type ProgramPlannerClientProps = {
    eventId: string;
    isReadOnly?: boolean;
}

export function ProgramPlannerClient({ eventId, isReadOnly = false }: ProgramPlannerClientProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isGenerating, setIsGenerating] = useState(false);

  const eventDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'events', eventId);
  }, [firestore, eventId]);
  const { data: event, isLoading: isLoadingEvent } = useDoc<Event>(eventDocRef);

  const programDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'events', eventId, 'program', 'main');
  }, [firestore, eventId]);
  const { data: initialProgramData, isLoading: isLoadingProgram } = useDoc<ProgramData>(programDocRef);

  const form = useForm<ProgramData>({
    resolver: zodResolver(programSchema),
    defaultValues: { program: [] },
  });

  const aiForm = useForm<z.infer<typeof aiFormSchema>>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: { startTime: '14:00', endTime: '20:00' }
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'program' });
  const formValues = form.watch();
  const [debouncedFormValues] = useDebounce(formValues, 2000);

  useEffect(() => {
    if (initialProgramData) {
      form.reset(initialProgramData);
    } else {
        form.reset({program: []});
    }
  }, [initialProgramData, form]);

  useEffect(() => {
    // Correct access to formState.isDirty
    if (form.formState.isDirty && programDocRef && !isReadOnly) {
      const saveChanges = async () => {
        setSaveStatus('saving');
        try {
          await setDoc(programDocRef, debouncedFormValues, { merge: true });
          setSaveStatus('saved');
          form.reset(debouncedFormValues); 
        } catch (error) {
          console.error("Auto-save failed:", error);
          setSaveStatus('idle');
        }
      };
      saveChanges();
    }
  }, [debouncedFormValues, form.formState.isDirty, programDocRef, isReadOnly, form]);
  
  const handleGenerateProgram = async (values: z.infer<typeof aiFormSchema>): Promise<void> => {
      if(!event) return;
      setIsGenerating(true);
      try {
          const result = await generateProgramSuggestions({
              ...values,
              eventType: event.eventType
          });
          const programWithStatus = result.program.map(item => ({...item, status: 'Upcoming' as const}));
          form.setValue('program', programWithStatus);
          toast({title: "AI Draft Created", description: "The AI-generated program has been applied."});
      } catch (error) {
          console.error(error);
          toast({variant: 'destructive', title: "AI Generation Failed"});
      } finally {
          setIsGenerating(false);
      }
  }

  const isLoading = isLoadingEvent || isLoadingProgram;

  const MainContent = () => (
    <Form {...form}>
        <form className='space-y-4'>
            {fields.map((field, index) => (
                <Card key={field.id} className={isReadOnly ? "bg-muted/30" : ""}>
                    <CardContent className="p-4 grid grid-cols-12 gap-4">
                         <FormField control={form.control} name={`program.${index}.title`} render={({field}) => (
                            <FormItem className="col-span-12"><FormLabel>Title</FormLabel><FormControl><Input {...field} readOnly={isReadOnly} /></FormControl><FormMessage/></FormItem>
                         )}/>
                          <FormField control={form.control} name={`program.${index}.startTime`} render={({field}) => (
                            <FormItem className="col-span-3"><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} readOnly={isReadOnly} /></FormControl><FormMessage/></FormItem>
                         )}/>
                          <FormField control={form.control} name={`program.${index}.duration`} render={({field}) => (
                            <FormItem className="col-span-3"><FormLabel>Duration (min)</FormLabel><FormControl><Input type="number" {...field} readOnly={isReadOnly} /></FormControl><FormMessage/></FormItem>
                         )}/>
                          <FormField control={form.control} name={`program.${index}.status`} render={({field}) => (
                            <FormItem className="col-span-4"><FormLabel>Status</FormLabel>
                             <Select onValueChange={field.onChange} value={field.value} disabled={isReadOnly}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent><SelectItem value="Upcoming">Upcoming</SelectItem><SelectItem value="In Progress">In Progress</SelectItem><SelectItem value="Completed">Completed</SelectItem></SelectContent>
                             </Select>
                            <FormMessage/></FormItem>
                         )}/>
                         {!isReadOnly && (
                         <div className="col-span-2 flex items-end">
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4/"></Trash2></Button>
                         </div>
                         )}
                          <FormField control={form.control} name={`program.${index}.notes`} render={({field}) => (
                            <FormItem className="col-span-12"><FormLabel>Notes for MC</FormLabel><FormControl><Textarea {...field} rows={2} readOnly={isReadOnly}/></FormControl><FormMessage/></FormItem>
                         )}/>
                    </CardContent>
                </Card>
            ))}
            {!isReadOnly && (
                <Button type="button" variant="outline" onClick={() => append({ title: '', startTime: '00:00', duration: 10, notes: '', status: 'Upcoming' })}>
                   <CirclePlus className="mr-2 h-4 w-4" /> Add Program Item
                </Button>
            )}
        </form>
    </Form>
  );

  const PlannerView = () => (
     <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Order of Events</CardTitle>
             <div className="flex items-center justify-between">
                 <Label>{event?.name || 'Loading...'}</Label>
                 {saveStatus === 'saving' && <span className="text-sm flex items-center gap-1 text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin"/>Saving...</span>}
                 {saveStatus === 'saved' && <span className="text-sm flex items-center gap-1 text-green-600"><Save className="h-3 w-3"/>All changes saved</span>}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : <MainContent />}
          </CardContent>
        </Card>
      </div>
       <div className="md:col-span-1">
         <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-accent"/> Ask Eni for a Draft</CardTitle>
                <CardDescription>Let the AI assistant generate a complete program draft for you.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...aiForm}>
                    <form onSubmit={aiForm.handleSubmit(handleGenerateProgram)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={aiForm.control} name="startTime" render={({field}) => (
                                <FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage/></FormItem>
                            )}/>
                            <FormField control={aiForm.control} name="endTime" render={({field}) => (
                                <FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
                            )}/>
                        </div>
                        <FormField control={aiForm.control} name="mcName" render={({field}) => (
                            <FormItem><FormLabel>MC Name (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )}/>
                         <Button type="submit" className="w-full" disabled={isGenerating}>
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {isGenerating ? 'Generating...' : 'Generate Program'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
         </Card>
      </div>
    </div>
  );

  if (isLoading && !isReadOnly) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }
  
  return isReadOnly ? <MainContent /> : <PlannerView />;
}
