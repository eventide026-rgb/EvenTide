
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, PlusCircle, Trash2, X, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
    name: z.string().min(3, "Venue name must be at least 3 characters."),
    description: z.string().min(20, "Description must be at least 20 characters."),
    address: z.string().min(5, "Address is required."),
    state: z.string({ required_error: "Please select a state."}),
    city: z.string({ required_error: "Please select a city."}),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
    imageUrls: z.array(z.string().url("Must be a valid URL.")).min(1, "At least one image URL is required."),
    amenities: z.array(z.string()).min(1, "Select at least one amenity."),
    features: z.array(z.string()).min(1, "Select at least one feature."),
});

type VenueFormProps = {
    venueId?: string;
};

export function VenueForm({ venueId }: VenueFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();

    const isEditMode = !!venueId;

    const [amenityInput, setAmenityInput] = useState("");
    const [featureInput, setFeatureInput] = useState("");

    const venueDocRef = useMemoFirebase(() => {
        if (!firestore || !venueId) return null;
        return doc(firestore, 'venues', venueId);
    }, [firestore, venueId]);

    const { data: existingVenueData, isLoading: isLoadingVenue } = useDoc(venueDocRef);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            address: "",
            capacity: 100,
            imageUrls: [],
            amenities: [],
            features: [],
        },
    });

    useEffect(() => {
        if (existingVenueData) {
            form.reset(existingVenueData);
        }
    }, [existingVenueData, form]);

    const { fields: imageUrlFields, remove: removeImg } = useFieldArray({
        control: form.control,
        name: "imageUrls",
    });

    const amenities = form.watch('amenities');
    const features = form.watch('features');

    const handleAddTag = (type: 'amenities' | 'features', value: string) => {
        if (value.trim() === "") return;
        const currentTags = form.getValues(type);
        if (!currentTags.includes(value.trim())) {
            form.setValue(type, [...currentTags, value.trim()]);
        }
        if (type === 'amenities') setAmenityInput("");
        if (type === 'features') setFeatureInput("");
    };
    
    const handleRemoveTag = (type: 'amenities' | 'features', tagToRemove: string) => {
        const currentTags = form.getValues(type);
        form.setValue(type, currentTags.filter(tag => tag !== tagToRemove));
    };

    const selectedState = form.watch('state');
    const cities = selectedState
        ? NigerianStatesAndCities.find((s) => s.state === selectedState)?.cities || []
        : [];

    useEffect(() => {
        if (form.formState.isDirty) {
            form.setValue('city', '');
        }
    }, [selectedState, form]);
        
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
            return;
        }
        setIsLoading(true);

        try {
            if (isEditMode && venueDocRef) {
                await updateDoc(venueDocRef, { ...values, updatedAt: serverTimestamp() });
                toast({
                    title: "Venue Updated!",
                    description: `${values.name} has been successfully updated.`,
                });
            } else {
                const venueData = {
                    ...values,
                    ownerId: user.uid,
                    createdAt: serverTimestamp(),
                };
                await addDoc(collection(firestore, "venues"), venueData);
                toast({
                    title: "Venue Created!",
                    description: `${values.name} has been successfully listed.`,
                });
            }
            router.push('/hall-owner-dashboard/my-venues');
        } catch (error) {
            console.error("Error saving venue:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was a problem saving your venue. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }
    
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

    if (isLoadingVenue && isEditMode) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Venue Name</FormLabel>
                            <FormControl><Input placeholder="e.g., The Grand Atrium" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea rows={4} placeholder="Tell us about your beautiful venue..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid md:grid-cols-3 gap-6">
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem className="md:col-span-3">
                                <FormLabel>Street Address</FormLabel>
                                <FormControl><Input placeholder="123 Celebration Avenue" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="state"
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
                        name="city"
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
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Guest Capacity</FormLabel>
                                <FormControl><Input type="number" placeholder="500" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                 <div className="space-y-4">
                    <FormLabel>Venue Images</FormLabel>
                    <FormDescription>Upload at least one high-quality image of your property.</FormDescription>
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
                        {form.watch('imageUrls').map((url, index) => (
                            <div key={index} className="relative group aspect-video">
                                <Image
                                    src={url}
                                    alt={`Venue image ${index + 1}`}
                                    fill
                                    className="object-cover rounded-md border"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImg(index)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <FormLabel htmlFor="amenities-input">Amenities</FormLabel>
                        <FormDescription>List the amenities available (e.g., Parking, Wi-Fi).</FormDescription>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="amenities-input"
                                value={amenityInput}
                                onChange={(e) => setAmenityInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag('amenities', amenityInput);
                                    }
                                }}
                                placeholder="Type an amenity and press Enter"
                            />
                            <Button type="button" onClick={() => handleAddTag('amenities', amenityInput)}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {amenities.map(tag => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                    {tag}
                                    <button type="button" onClick={() => handleRemoveTag('amenities', tag)} className="rounded-full hover:bg-muted-foreground/20">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <FormLabel htmlFor="features-input">Features</FormLabel>
                        <FormDescription>List special features (e.g., Projector, Stage).</FormDescription>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="features-input"
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag('features', featureInput);
                                    }
                                }}
                                placeholder="Type a feature and press Enter"
                            />
                            <Button type="button" onClick={() => handleAddTag('features', featureInput)}>Add</Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {features.map(tag => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                    {tag}
                                    <button type="button" onClick={() => handleRemoveTag('features', tag)} className="rounded-full hover:bg-muted-foreground/20">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? (isEditMode ? "Saving..." : "Creating...") : (isEditMode ? "Save Changes" : "Create Venue Listing")}
                </Button>
            </form>
        </Form>
    );
}
