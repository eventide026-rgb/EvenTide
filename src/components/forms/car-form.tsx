
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NigerianStatesAndCities } from '@/lib/nigerian-states';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, Trash2, X } from 'lucide-react';
import { Badge } from '../ui/badge';

const formSchema = z.object({
    make: z.string().min(2, "Car make is required."),
    model: z.string().min(1, "Car model is required."),
    year: z.coerce.number().min(1990, "Year must be 1990 or newer.").max(new Date().getFullYear() + 1),
    pricePerDay: z.coerce.number().min(1000, "Price must be at least ₦1,000."),
    location: z.object({
        state: z.string({ required_error: "Please select a state."}),
        city: z.string({ required_error: "Please select a city."}),
    }),
    imageUrls: z.array(z.string().url("Must be a valid URL.")).min(1, "At least one image URL is required."),
    features: z.array(z.string()).min(1, "Select at least one feature."),
});


export function CarForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();

    const [featureInput, setFeatureInput] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            make: "",
            model: "",
            year: new Date().getFullYear(),
            pricePerDay: 50000,
            location: { state: '', city: ''},
            imageUrls: [""],
            features: [],
        },
    });

    const { fields: imageUrlFields, append: appendImageUrl, remove: removeImageUrl } = useFieldArray({
        control: form.control,
        name: "imageUrls",
    });

    const features = form.watch('features');

    const handleAddTag = (value: string) => {
        if (value.trim() === "") return;
        const currentTags = form.getValues('features');
        if (!currentTags.includes(value.trim())) {
            form.setValue('features', [...currentTags, value.trim()]);
        }
        setFeatureInput("");
    };
    
    const handleRemoveTag = (tagToRemove: string) => {
        const currentTags = form.getValues('features');
        form.setValue('features', currentTags.filter(tag => tag !== tagToRemove));
    };

    const selectedState = form.watch('location.state');
    const cities = selectedState
        ? NigerianStatesAndCities.find((s) => s.state === selectedState)?.cities || []
        : [];

    useEffect(() => {
        form.setValue('location.city', '');
    }, [selectedState, form]);
        
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a listing." });
            return;
        }
        setIsLoading(true);

        const carData = {
            ...values,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
        };

        try {
            const carsCol = collection(firestore, "cars");
            await addDoc(carsCol, carData);
            toast({
                title: "Vehicle Listed!",
                description: `${values.make} ${values.model} has been successfully listed.`,
            });
            router.push('/car-hire-dashboard/my-cars');
        } catch (error) {
            console.error("Error creating car listing:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was a problem creating your listing. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="make"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Make</FormLabel>
                                <FormControl><Input placeholder="e.g., Toyota" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="model"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Model</FormLabel>
                                <FormControl><Input placeholder="e.g., Land Cruiser" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="year"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Year</FormLabel>
                                <FormControl><Input type="number" placeholder="2023" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <div className="grid md:grid-cols-3 gap-6">
                     <FormField
                        control={form.control}
                        name="location.state"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>State</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {NigerianStatesAndCities.map(s => <SelectItem key={s.state} value={s.state}>{s.state}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="location.city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>City</FormLabel>
                                 <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select City" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="pricePerDay"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price Per Day (₦)</FormLabel>
                                <FormControl><Input type="number" placeholder="50000" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                 <div className="space-y-2">
                    <FormLabel>Image URLs</FormLabel>
                    <FormDescription>Add at least one link to an image of the vehicle.</FormDescription>
                     {imageUrlFields.map((field, index) => (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`imageUrls.${index}`}
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2">
                                        <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(index)} disabled={imageUrlFields.length <= 1}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendImageUrl("")}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Image URL
                    </Button>
                </div>
                
                 <div className="space-y-2">
                    <FormLabel htmlFor="features-input">Vehicle Features</FormLabel>
                    <FormDescription>List key features (e.g., Air Conditioning, Automatic, Bluetooth).</FormDescription>
                    <div className="flex items-center gap-2">
                        <Input 
                            id="features-input"
                            value={featureInput}
                            onChange={(e) => setFeatureInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag(featureInput);
                                }
                            }}
                            placeholder="Type a feature and press Enter"
                        />
                        <Button type="button" onClick={() => handleAddTag(featureInput)}>Add</Button>
                    </div>
                     <Controller
                        control={form.control}
                        name="features"
                        render={({ field }) => <FormMessage>{form.formState.errors.features?.message}</FormMessage>}
                     />
                    <div className="flex flex-wrap gap-2 pt-2">
                        {features.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <button type="button" onClick={() => handleRemoveTag(tag)} className="rounded-full hover:bg-muted-foreground/20">
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>


                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Creating Listing..." : "Create Car Listing"}
                </Button>
            </form>
        </Form>
    );
}
