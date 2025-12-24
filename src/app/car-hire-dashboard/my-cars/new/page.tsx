
import { CarForm } from "@/components/forms/car-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewCarPage() {
    return (
        <div className="flex flex-col gap-8">
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Create a New Car Listing</CardTitle>
                    <CardDescription>
                        Fill out the details below to add a new vehicle to the EvenTide marketplace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CarForm />
                </CardContent>
            </Card>
        </div>
    );
}
