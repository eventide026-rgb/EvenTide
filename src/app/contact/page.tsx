import { ContactForm } from "@/components/forms/contact-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
    return (
        <section className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
                <Card className="max-w-2xl mx-auto bg-background/80 backdrop-blur-sm border-border/60">
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-4xl font-headline">Contact Us</CardTitle>
                        <CardDescription>
                            Have a question or need assistance? Fill out the form below and our team will get back to you.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ContactForm />
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
