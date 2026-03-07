
'use client';

import { useForm } from 'react-hook-form';
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
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, X, Upload } from 'lucide-react';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

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

type CarFormProps = {
    carId?: string;
};

export function CarForm({ carId }: CarFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();

    const isEditMode = !!carId;

    const carDocRef = useMemoFirebase(() => {
        if (!firestore || !carId) return null;
        return doc(firestore, 'cars', carId);
    }, [firestore, carId]);

    const { data: existingCarData, isLoading: isLoadingCar } = useDoc(carDocRef);

    const [featureInput, setFeatureInput] = useState("");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            make: "",
            model: "",
            year: new Date().getFullYear(),
            pricePerDay: 50000,
            location: { state: '', city: ''},
            imageUrls: [],
            features: [],
        },
    });

    useEffect(() => {
        if (existingCarData) {
            form.reset(existingCarData);
        }
    }, [existingCarData, form]);

    const imageUrls = form.watch('imageUrls');
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
        if (form.formState.isDirty) {
            form.setValue('location.city', '');
        }
    }, [selectedState, form]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        const newImageUrls: string[] = [];
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                 if (typeof e.target?.result === 'string') {
                    newImageUrls.push(e.target.result);
                    if(newImageUrls.length === files.length) {
                        form.setValue('imageUrls', [...form.getValues('imageUrls'), ...newImageUrls]);
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImageUrl = (indexToRemove: number) => {
        const currentImages = form.getValues('imageUrls');
        form.setValue('imageUrls', currentImages.filter((_, index) => index !== indexToRemove));
    }
        
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a listing." });
            return;
        }
        setIsLoading(true);

        try {
            if (isEditMode && carDocRef) {
                await updateDoc(carDocRef, {
                    ...values,
                    updatedAt: serverTimestamp(),
                });
                toast({
                    title: "Vehicle Updated!",
                    description: `${values.make} ${values.model} has been successfully updated.`,
                });
            } else {
                const carData = {
                    ...values,
                    ownerId: user.uid,
                    createdAt: serverTimestamp(),
                };
                await addDoc(collection(firestore, "cars"), carData);
                toast({
                    title: "Vehicle Listed!",
                    description: `${values.make} ${values.model} has been successfully listed.`,
                });
            }
            router.push('/car-hire-dashboard/my-cars');
        } catch (error) {
            console.error("Error saving car listing:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was a problem saving your listing. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoadingCar && isEditMode) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
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
                                <Select onValueChange={field.onChange} value={field.value}>
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

                <div className="space-y-4">
                    <Label>Vehicle Images</Label>
                    <FormDescription>Upload at least one high-quality image of your vehicle.</FormDescription>
                    <FormControl>
                        <Input id="image-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </FormControl>
                    <Button type="button" variant="outline" asChild>
                        <Label htmlFor="image-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Choose Images
                        </Label>
                    </Button>
                     <FormField
                        control={form.control}
                        name="imageUrls"
                        render={() => <FormMessage />}
                    />
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="relative group aspect-video">
                                <Image
                                    src={url}
                                    alt={`Vehicle image ${index + 1}`}
                                    fill
                                    className="object-cover rounded-md border"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImageUrl(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                
                 <div className="space-y-2">
                    <Label htmlFor="features-input">Vehicle Features</Label>
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
                     <FormField
                        control={form.control}
                        name="features"
                        render={() => <FormMessage />}
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
                    {isLoading ? "Saving..." : (isEditMode ? "Save Changes" : "Create Car Listing")}
                </Button>
            </form>
        </Form>
    );
}
