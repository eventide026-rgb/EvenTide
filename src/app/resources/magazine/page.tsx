
"use client";

import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const initialIssues = [
    {
        href: "#",
        date: "October 2024",
        title: "The Art of the Gathering",
        image: PlaceHolderImages.find(img => img.id === 'africansFun1')
    },
    {
        href: "#",
        date: "September 2024",
        title: "Harvest of Connections",
        image: PlaceHolderImages.find(img => img.id === 'gardenParty')
    },
    {
        href: "#",
        date: "August 2024",
        title: "Summer Soirees & City Lights",
        image: PlaceHolderImages.find(img => img.id === 'eventHall')
    },
    {
        href: "#",
        date: "July 2024",
        title: "Aso-Ebi & Allegiance",
        image: PlaceHolderImages.find(img => img.id === 'africansFun2')
    },
];

const olderIssues = [
    {
        href: "#",
        date: "June 2024",
        title: "The Chairman's Gala",
        image: {
            "id": "olderGala",
            "description": "An elegant gala event with dramatic lighting.",
            "imageUrl": "https://picsum.photos/seed/gala/400/600",
            "imageHint": "elegant gala"
        }
    },
    {
        href: "#",
        date: "May 2024",
        title: "Vendor Spotlight: The Culinary Artists",
        image: {
            "id": "olderFood",
            "description": "A close up of beautifully plated food at an event.",
            "imageUrl": "https://picsum.photos/seed/eventfood/400/600",
            "imageHint": "event food"
        }
    }
]


export default function MagazinePage() {
    const [issues, setIssues] = useState(initialIssues);
    const [isLoading, setIsLoading] = useState(false);
    const [hasLoadedMore, setHasLoadedMore] = useState(false);

    const handleLoadMore = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIssues(prev => [...prev, ...olderIssues]);
            setIsLoading(false);
            setHasLoadedMore(true);
        }, 1500);
    }

    return (
        <section className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-headline font-bold md:text-5xl">The EvenTide Magazine</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        A celebration of community, connection, and unforgettable moments. Curated by our AI Editor-in-Chief, Eni.
                    </p>
                    <div className="mt-6">
                        <Button asChild variant="outline">
                            <Link href="/resources/editorial">A Word from the Editor</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {issues.map((issue, index) => (
                        <Link href={issue.href} key={index} className="group block">
                            <div className="overflow-hidden rounded-lg shadow-md group-hover:shadow-2xl transition-shadow duration-300">
                                {issue.image && (
                                    <Image
                                        src={issue.image.imageUrl}
                                        alt={issue.image.description}
                                        width={400}
                                        height={600}
                                        className="w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint={issue.image.imageHint}
                                    />
                                )}
                            </div>
                            <div className="mt-4">
                                <p className="text-sm text-muted-foreground">{issue.date}</p>
                                <h3 className="text-lg font-bold font-headline mt-1 group-hover:text-primary transition-colors">{issue.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {!hasLoadedMore && (
                    <div className="text-center mt-12">
                        <Button onClick={handleLoadMore} disabled={isLoading} size="lg">
                            {isLoading ? "Loading..." : "Load More Issues"}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}
