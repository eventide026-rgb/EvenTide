
import { CarForm } from "@/components/forms/car-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCarPage() {
    return (
        <div className="flex flex-col gap-4">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/car-hire-dashboard/my-cars">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to My Cars</span>
                    </Link>
                </Button>
                <h1 className="text-xl font-semibold">List a New Vehicle</h1>
            </div>
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
