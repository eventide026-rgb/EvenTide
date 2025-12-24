
import { HotelForm } from "@/components/forms/hotel-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewHotelPage() {
    return (
        <div className="flex flex-col gap-8">
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Create a New Hotel Listing</CardTitle>
                    <CardDescription>
                        Fill out the details below to add a new property to the EvenTide marketplace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <HotelForm />
                </CardContent>
            </Card>
        </div>
    );
}
