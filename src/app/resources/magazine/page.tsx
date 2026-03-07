"use client";

import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

type Issue = {
    id: string;
    title: string;
    introduction: string;
    status: 'draft' | 'published';
    eventSummaries: { eventName: string; summary: string }[];
    createdAt: any;
};

function MagazineCover({ issue }: { issue: Issue }) {
    // In a real app, the cover image would be a dedicated field.
    // For now, we'll generate a consistent one based on the ID.
    const imageUrl = `https://picsum.photos/seed/${issue.id}/400/600`;
    
    const formattedDate = issue.createdAt?.toDate 
        ? new Date(issue.createdAt.toDate()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        : 'Recent Issue';

    return (
         <Link href={`/resources/magazine/${issue.id}`} key={issue.id} className="group block">
            <div className="overflow-hidden rounded-lg shadow-md group-hover:shadow-2xl transition-shadow duration-300">
                <Image
                    src={imageUrl}
                    alt={issue.title}
                    width={400}
                    height={600}
                    className="w-full object-cover aspect-[3/4] transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                    {formattedDate}
                </p>
                <h3 className="text-lg font-bold font-headline mt-1 group-hover:text-primary transition-colors">{issue.title}</h3>
            </div>
        </Link>
    )
}


export default function MagazinePage() {
    const firestore = useFirestore();
    
    const issuesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "magazineIssues"), where('status', '==', 'published'));
    }, [firestore]);

    const { data: issues, isLoading } = useCollection<Issue>(issuesQuery);
    
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
                
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                           <div key={i} className="space-y-2">
                             <Skeleton className="w-full aspect-[3/4]" />
                             <Skeleton className="h-4 w-1/3" />
                             <Skeleton className="h-6 w-2/3" />
                           </div>
                        ))}
                    </div>
                ) : issues && issues.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {issues.map((issue) => <MagazineCover key={issue.id} issue={issue} />)}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-16">No issues have been published yet.</p>
                )}

            </div>
        </section>
    );
}
