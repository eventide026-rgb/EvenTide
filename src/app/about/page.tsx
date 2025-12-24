import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building } from "lucide-react";

export default function AboutUsPage() {
    return (
        <section className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
                <Card className="max-w-3xl mx-auto bg-background/80 backdrop-blur-sm border-border/60">
                    <CardHeader className="items-center text-center">
                        <Building className="h-12 w-12 mb-4 text-primary" />
                        <CardTitle className="text-4xl font-headline">About Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-invert max-w-none text-foreground/80 mx-auto">
                            <p>
                                EvenTide was born from a simple, yet powerful idea: event management in Nigeria could be better. Much better. Our founding team is a hybrid of seasoned event planners who have orchestrated everything from intimate weddings to massive corporate functions, and tech innovators who build scalable, beautiful software.
                            </p>
                            <p>
                                We’ve lived the headaches firsthand—the scattered spreadsheets, the endless WhatsApp groups, the last-minute panics, and the gnawing feeling that there had to be a more elegant way. We saw a gap between the world-class events our culture is known for and the tools available to manage them.
                            </p>
                            <p>
                                So, we decided to build it ourselves. We envisioned a seamless, all-in-one solution that was not only powerful enough for professional planners but also intuitive enough for a first-time host. A platform that celebrates our culture, empowers creators, and uses technology to enhance human connection, not replace it.
                            </p>
                             <p>
                                EvenTide is the result of that vision. It’s a tool built by event people, for event people. We are deeply committed to our community, and we are constantly listening, learning, and iterating to make this the single best platform for creating unforgettable moments.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
