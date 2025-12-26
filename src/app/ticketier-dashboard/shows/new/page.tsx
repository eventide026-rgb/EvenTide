
import { EventForm } from "@/components/forms/event-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewShowPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/ticketier-dashboard/shows">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to My Shows</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">Create a New Show</h1>
            </div>
            <Card className="max-w-4xl mx-auto w-full">
                <CardHeader>
                    <CardTitle className="text-3xl font-headline">Create a New Show</CardTitle>
                    <CardDescription>
                        Fill out the details below to create your show. You'll be able to manage ticket tiers in the next step.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EventForm />
                </CardContent>
            </Card>
        </div>
    );
}
