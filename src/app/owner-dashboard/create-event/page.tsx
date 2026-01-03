

'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Stepper, Step } from '@/components/wizards/stepper';
import { CoreDetailsStep, coreDetailsSchema } from '@/components/wizards/create-event/core-details-step';
import { ThemeAndAiStep, themeAndAiSchema } from '@/components/wizards/create-event/theme-ai-step';
import { LogisticsStep, logisticsSchema } from '@/components/wizards/create-event/logistics-step';
import { AssignPlannerStep, assignPlannerSchema } from '@/components/wizards/create-event/assign-planner-step';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useBeforeUnload } from '@/hooks/use-before-unload';


const steps: Step[] = [
  { id: '01', name: 'Core Details', fields: ['name', 'description'] },
  { id: '02', name: 'Theme & AI', fields: ['eventType', 'primaryColor', 'secondaryColor'] },
  { id: '03', name: 'Logistics', fields: ['location', 'eventDate'] },
  { id: '04', name: 'Assign Planner', fields: ['plannerId'] },
];

const fullSchema = coreDetailsSchema
  .merge(themeAndAiSchema)
  .merge(logisticsSchema)
  .merge(assignPlannerSchema);

type FormData = z.infer<typeof fullSchema>;

const getInitialValues = () => {
    if (typeof window !== 'undefined') {
        const savedData = localStorage.getItem('event-wizard-form');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.eventDate) {
                 parsedData.eventDate = new Date(parsedData.eventDate);
            }
            return parsedData;
        }
    }
    return {
        name: "",
        description: "",
        eventType: "Wedding",
        primaryColor: "#4169E1",
        secondaryColor: "#D4AF37",
        location: "",
        eventDate: undefined,
        plannerId: '',
    };
};

export default function CreateEventWizardPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [eventCode, setEventCode] = useState('');
    const { toast } = useToast();
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();

    const methods = useForm<FormData>({
        resolver: zodResolver(fullSchema),
        defaultValues: getInitialValues(),
    });

    const { trigger, watch, formState: { isDirty } } = methods;

    useBeforeUnload(isDirty, "You have unsaved changes. Are you sure you want to leave?");

    const eventType = watch('eventType');

    useEffect(() => {
        if (eventType) {
            const code = `${eventType.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            setEventCode(code);
        }
    }, [eventType]);

    useEffect(() => {
        const subscription = watch((value) => {
            localStorage.setItem('event-wizard-form', JSON.stringify(value));
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const handleNext = async () => {
        const fields = steps[currentStep].fields;
        const output = await trigger(fields as (keyof FormData)[], { shouldFocus: true });
        if (!output) return;

        if (currentStep < steps.length - 1) {
            setCurrentStep(step => step + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(step => step - 1);
        }
    };
    
    const onFinalSubmit = async (data: FormData) => {
        if (!firestore || !user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create an event." });
            return;
        }
        setIsSubmitting(true);

        const eventsCollection = collection(firestore, "events");
        const eventData = {
            ...data,
            ownerId: user.uid,
            eventCode: eventCode,
            createdAt: serverTimestamp(),
            eventDate: data.eventDate,
            guestCount: 0,
            guestLimit: 20, // Default for new events
            imageUrls: [`https://picsum.photos/seed/${eventCode}/1200/800`],
            plannerIds: data.plannerId ? [data.plannerId] : [],
        };
        
        try {
            const newEventRef = await addDoc(eventsCollection, eventData);
            
            // If a planner was assigned, send them a notification in a separate non-blocking write.
            if (data.plannerId) {
                const batch = writeBatch(firestore);
                const plannerAssignmentRef = doc(firestore, "events", newEventRef.id, "planners", data.plannerId);
                batch.set(plannerAssignmentRef, { status: 'pending' });

                const plannerNotificationRef = doc(collection(firestore, 'users', data.plannerId, 'notifications'));
                batch.set(plannerNotificationRef, {
                    message: `You've been invited by ${user.displayName || user.email} to plan the event: "${data.name}".`,
                    link: '/planner-dashboard/invitations',
                    read: false,
                    createdAt: serverTimestamp(),
                    userId: data.plannerId
                });
                // Commit this separately. It's not critical for event creation itself.
                batch.commit().catch(console.error);
            }
            
            toast({
                title: "Event Created!",
                description: `Your event "${data.name}" has been successfully created.`,
            });
            localStorage.removeItem('event-wizard-form');
            router.push(`/owner-dashboard/guests?walkthrough=true`);

        } catch (error: any) {
            console.error("Error creating event:", error);
            const contextualError = new FirestorePermissionError({
                path: 'events',
                operation: 'create',
                requestResourceData: eventData,
            });
            errorEmitter.emit('permission-error', contextualError);
        } finally {
            setIsSubmitting(false);
        }
    }


    return (
        <FormProvider {...methods}>
            <div className="space-y-8">
                <Stepper steps={steps} currentStep={currentStep} />
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-foreground">
                                Step {currentStep + 1}: {steps[currentStep].name}
                            </h2>
                            {currentStep === 1 && eventCode && (
                                <Badge variant="outline">Event Code: {eventCode}</Badge>
                            )}
                        </div>
                    </CardHeader>
                     <CardContent>
                        <form onSubmit={methods.handleSubmit(onFinalSubmit)}>
                            {currentStep === 0 && <CoreDetailsStep />}
                            {currentStep === 1 && <ThemeAndAiStep />}
                            {currentStep === 2 && <LogisticsStep />}
                            {currentStep === 3 && <AssignPlannerStep />}
                        </form>
                    </CardContent>
                </Card>

                <div className="flex justify-between">
                    <Button onClick={handlePrev} disabled={currentStep === 0} variant="outline">
                        Previous
                    </Button>
                    {currentStep < steps.length - 1 ? (
                        <Button onClick={handleNext}>Next</Button>
                    ) : (
                        <Button onClick={methods.handleSubmit(onFinalSubmit)} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Finalize & Create Event
                        </Button>
                    )}
                </div>
            </div>
        </FormProvider>
    );
}
