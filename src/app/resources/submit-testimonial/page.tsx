import { TestimonialForm } from "@/components/forms/testimonial-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenSquare } from "lucide-react";

export default function SubmitTestimonialPage() {
    return (
        <section className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
                <Card className="max-w-2xl mx-auto bg-background/80 backdrop-blur-sm border-border/60">
                    <CardHeader className="items-center text-center">
                        <PenSquare className="h-12 w-12 mb-4 text-primary" />
                        <CardTitle className="text-4xl font-headline">Share Your Experience</CardTitle>
                        <CardDescription>
                            Loved using EvenTide? We'd be honored if you shared a testimonial.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TestimonialForm />
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
