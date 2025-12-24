import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const missionPillars = [
    {
        title: "Empowerment",
        description: "Providing intuitive tools for creators, planners, and hosts to bring their visions to life effortlessly."
    },
    {
        title: "Storytelling",
        description: "Transforming every event into a rich, compelling narrative that can be shared and preserved."
    },
    {
        title: "Innovation",
        description: "Leveraging cutting-edge AI to redefine what's possible in event design, management, and engagement."
    },
    {
        title: "Connection",
        description: "Building a vibrant community where guests, hosts, and vendors can connect and collaborate seamlessly."
    }
]

export default function WhatIsEvenTidePage() {
    return (
        <div className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-headline font-bold md:text-5xl">Our Manifesto</h1>
                    <p className="mt-4 text-lg text-muted-foreground">The &quot;why&quot; behind EvenTide.</p>
                </div>

                <Card className="mb-12 bg-background/30 border-border/50 backdrop-blur-sm">
                    <CardContent className="p-8 md:p-12">
                        <blockquote className="text-center text-2xl md:text-3xl font-headline italic text-foreground/90 leading-relaxed">
                            &quot;To be Nigeria’s premier event ecosystem — where technology, creativity, and culture converge to create unforgettable experiences and world‑class storytelling.&quot;
                        </blockquote>
                    </CardContent>
                </Card>

                <Card className="mb-12">
                    <CardHeader>
                        <CardTitle className="text-3xl font-headline">Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
                            {missionPillars.map((pillar) => (
                                <div key={pillar.title} className="flex items-start gap-4">
                                    <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-lg">{pillar.title}</h3>
                                        <p className="text-muted-foreground">{pillar.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                
                <div className="text-center">
                    <p className="text-xl md:text-2xl font-bold mb-6">EvenTide is not just an app — it’s a cultural archive and innovation hub.</p>
                    <div className="font-headline text-2xl md:text-3xl space-y-2">
                        <p>To turn every event into a masterpiece.</p>
                        <p>To turn every story into a legacy.</p>
                        <p className="font-bold bg-gradient-to-r from-blue-400 to-yellow-300 text-transparent bg-clip-text inline-block">To turn every moment into EvenTide.</p>
                    </div>
                </div>

            </div>
        </div>
    )
}
