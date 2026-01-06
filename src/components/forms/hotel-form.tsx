
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
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { Label } from '@/components/ui/label';

const amenityOptions = ["Wi-Fi", "Pool", "Gym", "Parking", "Restaurant", "Room Service", "Air Conditioning"];

const roomTypeSchema = z.object({
    name: z.string().min(2, "Room name is required."),
    price: z.coerce.number().min(1, "Price must be greater than 0."),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
});

const formSchema = z.object({
    name: z.string().min(3, "Hotel name must be at least 3 characters."),
    description: z.string().min(20, "Description must be at least 20 characters."),
    address: z.string().min(5, "Address is required."),
    state: z.string({ required_error: "Please select a state."}),
    city: z.string({ required_error: "Please select a city."}),
    imageUrls: z.array(z.string().url("Must be a valid URL.")).min(1, "At least one image URL is required."),
    amenities: z.array(z.string()).min(1, "Select at least one amenity."),
    roomTypes: z.array(roomTypeSchema).min(1, "At least one room type is required."),
});

type HotelFormProps = {
    hotelId?: string;
};

export function HotelForm({ hotelId }: HotelFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();

    const isEditMode = !!hotelId;

    const hotelDocRef = useMemoFirebase(() => {
        if (!firestore || !hotelId) return null;
        return doc(firestore, 'hotels', hotelId);
    }, [firestore, hotelId]);

    const { data: existingHotelData, isLoading: isLoadingHotel } = useDoc(hotelDocRef);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            address: "",
            imageUrls: [],
            amenities: [],
            roomTypes: [{ name: "Standard Room", price: 25000, capacity: 2 }],
        },
    });
    
    useEffect(() => {
        if (existingHotelData) {
            form.reset(existingHotelData);
        }
    }, [existingHotelData, form]);

    const { fields: roomTypeFields, append: appendRoomType, remove: removeRoomType } = useFieldArray({
        control: form.control,
        name: "roomTypes",
    });

     const { remove: removeImageUrl } = useFieldArray({
        control: form.control,
        name: "imageUrls",
    });

    const imageUrls = form.watch('imageUrls');

    const selectedState = form.watch('state');
    const cities = selectedState
        ? NigerianStatesAndCities.find((s) => s.state === selectedState)?.cities || []
        : [];

    useEffect(() => {
        if (form.formState.isDirty) {
            form.setValue('city', '');
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
        
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
            return;
        }
        setIsLoading(true);

        try {
            if (isEditMode && hotelDocRef) {
                await updateDoc(hotelDocRef, { ...values, updatedAt: serverTimestamp() });
                toast({
                    title: "Hotel Updated!",
                    description: `${values.name} has been successfully updated.`,
                });
            } else {
                const hotelData = {
                    ...values,
                    ownerId: user.uid,
                    createdAt: serverTimestamp(),
                };
                await addDoc(collection(firestore, "hotels"), hotelData);
                toast({
                    title: "Hotel Created!",
                    description: `${values.name} has been successfully listed.`,
                });
            }
            router.push('/hotelier-dashboard/my-hotels');
        } catch (error) {
            console.error("Error saving hotel:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was a problem saving your hotel. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    if (isLoadingHotel && isEditMode) {
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
                            <FormLabel>Hotel Name</FormLabel>
                            <FormControl><Input placeholder="e.g., The Grand Majestic Hotel" {...field} /></FormControl>
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
                            <FormControl><Textarea rows={4} placeholder="Tell us about your beautiful hotel..." {...field} /></FormControl>
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
                                <FormControl><Input placeholder="123 Serenity Lane" {...field} /></FormControl>
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
                </div>

                 <FormField
                    control={form.control}
                    name="amenities"
                    render={() => (
                        <FormItem>
                            <div className="mb-4">
                                <FormLabel className="text-base">Amenities</FormLabel>
                                <FormDescription>Select all amenities your hotel offers.</FormDescription>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {amenityOptions.map((item) => (
                                    <FormField
                                        key={item}
                                        control={form.control}
                                        name="amenities"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                    key={item}
                                                    className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value?.includes(item)}
                                                            onCheckedChange={(checked) => {
                                                                return checked
                                                                    ? field.onChange([...field.value, item])
                                                                    : field.onChange(
                                                                        field.value?.filter(
                                                                            (value) => value !== item
                                                                        )
                                                                    )
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{item}</FormLabel>
                                                </FormItem>
                                            )
                                        }}
                                    />
                                ))}
                            </div>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                
                 <div className="space-y-4">
                    <Label>Hotel Images</Label>
                    <FormDescription>Upload or add links to images of your property.</FormDescription>
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
                                    alt={`Hotel image ${index + 1}`}
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


                <Card>
                    <CardHeader>
                        <CardTitle>Room Types</CardTitle>
                        <FormDescription>Define the types of rooms available at your hotel.</FormDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {roomTypeFields.map((field, index) => (
                           <div key={field.id} className="grid md:grid-cols-8 gap-4 items-start border p-4 rounded-lg relative">
                                <FormField
                                    control={form.control}
                                    name={`roomTypes.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="col-span-8 md:col-span-3">
                                            <FormLabel>Room Name</FormLabel>
                                            <FormControl><Input placeholder="e.g., Standard Double" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`roomTypes.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem className="col-span-4 md:col-span-2">
                                            <FormLabel>Price (₦)</FormLabel>
                                            <FormControl><Input type="number" placeholder="25000" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`roomTypes.${index}.capacity`}
                                    render={({ field }) => (
                                        <FormItem className="col-span-4 md:col-span-2">
                                            <FormLabel>Capacity</FormLabel>
                                            <FormControl><Input type="number" placeholder="2" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="button" variant="ghost" size="icon" className="col-span-8 md:col-span-1 md:place-self-end" onClick={() => removeRoomType(index)} disabled={roomTypeFields.length <= 1}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                           </div>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendRoomType({ name: "", price: 0, capacity: 0 })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Room Type
                        </Button>
                    </CardContent>
                </Card>

                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? (isEditMode ? "Saving Changes..." : "Creating Listing...") : (isEditMode ? "Save Changes" : "Create Hotel Listing")}
                </Button>
            </form>
        </Form>
    );
}
