import { VenueForm } from "@/components/forms/venue-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewVenuePage() {
    return (
        <div className="flex flex-col gap-8">
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Create a New Venue Listing</CardTitle>
                    <CardDescription>
                        Fill out the details below to add a new venue to the EvenTide marketplace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <VenueForm />
                </CardContent>
            </Card>
        </div>
    );
}
