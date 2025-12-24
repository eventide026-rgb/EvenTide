import { EventForm } from "@/components/forms/event-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewEventPage() {
    return (
        <div className="flex flex-col gap-8">
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Create a New Event</CardTitle>
                    <CardDescription>
                        Fill out the details below to create your event. You'll be able to manage ticket tiers in the next step.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EventForm />
                </CardContent>
            </Card>
        </div>
    );
}
