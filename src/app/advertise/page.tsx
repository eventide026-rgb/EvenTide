import { AdRequestForm } from "@/components/forms/ad-request-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdvertisePage() {
    return (
        <section className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
                <Card className="max-w-2xl mx-auto bg-background/80 backdrop-blur-sm border-border/60">
                    <CardHeader className="items-center text-center">
                        <CardTitle className="text-4xl font-headline">Advertise with Us</CardTitle>
                        <CardDescription className="max-w-md">
                            Reach a dedicated audience of event professionals and attendees. Submit your proposal below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdRequestForm />
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
