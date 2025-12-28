
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
import { useState, useEffect, useRef } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, Trash2, X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Image from 'next/image';

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
    imageUrls: z.array(z.string().url("Must be a valid URL.")).min(1, "At least one image is required."),
    amenities: z.array(z.string()).min(1, "Select at least one amenity."),
    roomTypes: z.array(roomTypeSchema).min(1, "At least one room type is required."),
});


export function HotelForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const firestore = useFirestore();
    const { user } = useUser();
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const { fields: roomTypeFields, append: appendRoomType, remove: removeRoomType } = useFieldArray({
        control: form.control,
        name: "roomTypes",
    });

    const imageUrls = form.watch('imageUrls');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            const newImageUrls = Array.from(files).map((file, index) => {
                // In a real app, you would upload the file and get a URL.
                // Here, we simulate it with a placeholder URL.
                return `https://picsum.photos/seed/${file.name}-${index}/${800}/${600}`;
            });
            form.setValue('imageUrls', [...imageUrls, ...newImageUrls]);
        }
    };
    
    const removeImage = (index: number) => {
        const newImageUrls = [...imageUrls];
        newImageUrls.splice(index, 1);
        form.setValue('imageUrls', newImageUrls);
    }


    const selectedState = form.watch('state');
    const cities = selectedState
        ? NigerianStatesAndCities.find((s) => s.state === selectedState)?.cities || []
        : [];

    useEffect(() => {
        form.setValue('city', '');
    }, [selectedState, form]);
        
    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!firestore || !user) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to create a hotel." });
            return;
        }
        setIsLoading(true);

        const hotelData = {
            ...values,
            ownerId: user.uid,
            createdAt: serverTimestamp(),
        };

        try {
            const hotelsCol = collection(firestore, "hotels");
            await addDoc(hotelsCol, hotelData);
            toast({
                title: "Hotel Created!",
                description: `${values.name} has been successfully listed.`,
            });
            router.push('/hotelier-dashboard/my-hotels');
        } catch (error) {
            console.error("Error creating hotel:", error);
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "There was a problem creating your hotel. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
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
                    <FormLabel>Hotel Images</FormLabel>
                    <FormDescription>Upload at least one high-quality image of your property.</FormDescription>
                    <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-accent"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">Click to browse or drag & drop files</p>
                        <Input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            multiple
                            onChange={handleFileChange}
                            accept="image/*"
                        />
                    </div>
                     <Controller
                        control={form.control}
                        name="imageUrls"
                        render={({ field }) => <FormMessage>{form.formState.errors.imageUrls?.message}</FormMessage>}
                     />
                    {imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {imageUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                    <Image
                                        src={url}
                                        alt={`Preview ${index + 1}`}
                                        width={200}
                                        height={150}
                                        className="rounded-md object-cover aspect-video"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
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
                    {isLoading ? "Creating Listing..." : "Create Hotel Listing"}
                </Button>
            </form>
        </Form>
    );
}
