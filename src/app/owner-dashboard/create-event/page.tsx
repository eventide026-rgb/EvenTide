
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PrivateEventForm } from "@/components/forms/private-event-form";

export default function CreateEventPage() {
    return (
        <div className="flex flex-col gap-8">
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Create a New Event</CardTitle>
                    <CardDescription>
                        Fill out the details below to create your private event.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PrivateEventForm />
                </CardContent>
            </Card>
        </div>
    );
}
