
'use client';

import { useState, useEffect } from 'react';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDebounce } from 'use-debounce';
import { useToast } from '@/hooks/use-toast';
import { generateMenuSuggestions } from '@/ai/flows/generate-menu-suggestions';
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
import { Label } from '@/components/ui/label';
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
import { Loader2, PlusCircle, Save, Sparkles, Trash2 } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

type Event = {
  id: string;
  name: string;
};

const dishSchema = z.object({
  name: z.string().min(2, 'Dish name is required.'),
  description: z.string().optional(),
});

const courseSchema = z.object({
  title: z.string().min(2, 'Course title is required.'),
  dishes: z.array(dishSchema),
});

const menuSchema = z.object({
  menuTitle: z.string().min(3, 'Menu title is required.'),
  courses: z.array(courseSchema),
  drinks: z.array(z.string()),
});

type MenuData = z.infer<typeof menuSchema>;

const aiFormSchema = z.object({
    cuisineStyle: z.string().min(3, "Cuisine style is required."),
    numberOfCourses: z.coerce.number().min(1).max(5),
    dietaryNotes: z.string().optional(),
});

type MenuPlannerClientProps = {
    eventId: string;
    isReadOnly?: boolean;
};

export function MenuPlannerClient({ eventId, isReadOnly = false }: MenuPlannerClientProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isGenerating, setIsGenerating] = useState(false);

  const eventDocRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'events', eventId)
  }, [firestore, eventId]);
  const { data: event, isLoading: isLoadingEvent } = useDoc<Event>(eventDocRef);

  const menuDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'events', eventId, 'menu', 'main');
  }, [firestore, eventId]);
  const { data: initialMenuData, isLoading: isLoadingMenu } = useDoc<MenuData>(menuDocRef);

  const form = useForm<MenuData>({
    resolver: zodResolver(menuSchema),
    defaultValues: { menuTitle: '', courses: [], drinks: [] },
  });

  const aiForm = useForm<z.infer<typeof aiFormSchema>>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: { cuisineStyle: 'Nigerian Fusion', numberOfCourses: 3, dietaryNotes: '' }
  });

  const { fields, append, remove, update } = useFieldArray({ control: form.control, name: 'courses' });
  const formValues = form.watch();
  const [debouncedFormValues] = useDebounce(formValues, 2000);

  useEffect(() => {
    if (initialMenuData) {
      form.reset(initialMenuData);
    } else {
        form.reset({ menuTitle: 'Event Menu', courses: [{title: 'Main Course', dishes: []}], drinks: [] });
    }
  }, [initialMenuData, form]);

  useEffect(() => {
    if (form.isDirty && !isReadOnly && menuDocRef) {
      const saveChanges = async () => {
        setSaveStatus('saving');
        try {
          await setDoc(menuDocRef, debouncedFormValues);
          setSaveStatus('saved');
          form.reset(debouncedFormValues); // Mark form as not dirty
        } catch (error) {
          console.error("Auto-save failed:", error);
          setSaveStatus('idle');
        }
      };
      saveChanges();
    }
  }, [debouncedFormValues, form, isReadOnly, menuDocRef]);
  
  const handleGenerateMenu = async (values: z.infer<typeof aiFormSchema>) => {
      setIsGenerating(true);
      try {
          const result = await generateMenuSuggestions(values);
          form.reset(result);
          toast({title: "AI Draft Created", description: "The AI-generated menu has been applied."});
      } catch (error) {
          console.error(error);
          toast({variant: 'destructive', title: "AI Generation Failed"});
      } finally {
          setIsGenerating(false);
      }
  }

  const addDish = (courseIndex: number) => {
    const courses = form.getValues('courses');
    const newDishes = [...courses[courseIndex].dishes, { name: '', description: '' }];
    update(courseIndex, { ...courses[courseIndex], dishes: newDishes });
  };
  
  const isLoading = isLoadingEvent || isLoadingMenu;

  const MainContent = () => (
    <Form {...form}>
        <form className='space-y-4'>
            <FormField control={form.control} name="menuTitle" render={({field}) => (
                 <FormItem><FormLabel>Menu Title</FormLabel><FormControl><Input {...field} readOnly={isReadOnly} /></FormControl><FormMessage /></FormItem>
            )}/>
            <Accordion type="multiple" defaultValue={['course-0']} className="w-full">
                {fields.map((field, index) => (
                    <AccordionItem key={field.id} value={`course-${index}`}>
                        <AccordionTrigger disabled={isReadOnly}>
                            <FormField control={form.control} name={`courses.${index}.title`} render={({field}) => (
                                <Input {...field} readOnly={isReadOnly} className="text-lg font-semibold border-none shadow-none focus-visible:ring-0 p-0" />
                            )}/>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 pl-2">
                            {form.getValues(`courses.${index}.dishes`).map((dish, dishIndex) => (
                                 <div key={dishIndex} className="grid grid-cols-12 gap-2">
                                    <FormField control={form.control} name={`courses.${index}.dishes.${dishIndex}.name`} render={({field}) => (
                                        <Input {...field} placeholder="Dish Name" className="col-span-5" readOnly={isReadOnly} />
                                    )}/>
                                    <FormField control={form.control} name={`courses.${index}.dishes.${dishIndex}.description`} render={({field}) => (
                                        <Input {...field} placeholder="Description" className="col-span-6" readOnly={isReadOnly} />
                                    )}/>
                                    {!isReadOnly && (
                                    <Button type="button" variant="ghost" size="icon" className="col-span-1" onClick={() => {
                                        const dishes = form.getValues(`courses.${index}.dishes`);
                                        dishes.splice(dishIndex, 1);
                                        update(index, {...form.getValues(`courses.${index}`), dishes});
                                    }}><Trash2 className="h-4 w-4" /></Button>
                                    )}
                                 </div>
                            ))}
                            {!isReadOnly && <Button type="button" variant="outline" size="sm" onClick={() => addDish(index)}><PlusCircle className="mr-2 h-4 w-4"/>Add Dish</Button>}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            {!isReadOnly && <Button type="button" variant="secondary" onClick={() => append({title: 'New Course', dishes: []})}><PlusCircle className="mr-2 h-4 w-4"/>Add Course</Button>}
        </form>
    </Form>
  );

  const PlannerView = () => (
     <div className="grid md:grid-cols-3 gap-8 items-start">
      <div className="md:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Menu Builder</CardTitle>
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
                <CardDescription>Let the AI assistant generate a complete menu draft for you.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...aiForm}>
                    <form onSubmit={aiForm.handleSubmit(handleGenerateMenu)} className="space-y-4">
                        <FormField control={aiForm.control} name="cuisineStyle" render={({field}) => (
                            <FormItem><FormLabel>Cuisine Style</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage/></FormItem>
                        )}/>
                         <FormField control={aiForm.control} name="numberOfCourses" render={({field}) => (
                            <FormItem><FormLabel>Number of Courses</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage/></FormItem>
                        )}/>
                        <FormField control={aiForm.control} name="dietaryNotes" render={({field}) => (
                            <FormItem><FormLabel>Dietary Notes</FormLabel><FormControl><Textarea {...field} placeholder="e.g., Vegetarian options, no nuts" /></FormControl><FormMessage/></FormItem>
                        )}/>
                         <Button type="submit" className="w-full" disabled={isGenerating}>
                            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            {isGenerating ? 'Generating...' : 'Generate Menu'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
         </Card>
      </div>
    </div>
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin"/></div>
  }

  return isReadOnly ? <MainContent /> : <PlannerView />;
}
