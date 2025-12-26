
'use client';

import { use, useMemo } from 'react';
import { doc, collection, query, where } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Globe, Instagram, Facebook } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type PlannerProfile } from '@/components/planner-card';
import { TikTokIcon } from '@/components/icons/tiktok';
import { Button } from '@/components/ui/button';

export default function PlannerPublicPage({ params }: { params: Promise<{ plannerId: string }> }) {
    const { plannerId } = use(params);
    const firestore = useFirestore();

    const plannerRef = useMemoFirebase(() => {
        if (!firestore || !plannerId) return null;
        return doc(firestore, 'plannerProfiles', plannerId);
    }, [firestore, plannerId]);

    const { data: planner, isLoading } = useDoc<PlannerProfile>(plannerRef);

    if (isLoading) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )
    }

    if (!planner) {
        return notFound();
    }

    const socialLinks = [
        { href: planner.websiteUrl, icon: Globe, label: 'Website' },
        { href: planner.instagramUrl, icon: Instagram, label: 'Instagram' },
        { href: planner.tiktokUrl, icon: TikTokIcon, label: 'TikTok' },
        { href: planner.facebookUrl, icon: Facebook, label: 'Facebook' },
    ].filter(link => link.href);

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <PublicHeader />
            <main className="flex-1">
                <section className="bg-secondary/50 border-b">
                    <div className="container mx-auto px-4 py-8 md:py-16">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <Avatar className="h-32 w-32 border-4 border-primary">
                                <AvatarImage src={planner.avatarUrl} alt={planner.name} />
                                <AvatarFallback>{planner.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl font-headline font-bold md:text-5xl">{planner.name}</h1>
                                {(planner.city || planner.state) && (
                                     <p className="mt-2 text-lg text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                        <MapPin className="h-5 w-5"/>
                                        {planner.city}, {planner.state}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                <section className="container mx-auto px-4 py-8 md:py-12">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2">
                             <Card>
                                <CardHeader>
                                    <CardTitle>About Me</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{planner.bio || "This planner hasn't written a bio yet."}</p>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="md:col-span-1 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Contact</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Button asChild className="w-full">
                                        <a href={`mailto:${planner.email}`}>Contact {planner.name.split(' ')[0]}</a>
                                    </Button>
                                </CardContent>
                            </Card>
                             {socialLinks.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Follow Me</CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex gap-2">
                                        {socialLinks.map(link => (
                                            <Button key={link.label} asChild variant="outline" size="icon">
                                                <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                                                    <link.icon className="h-5 w-5" />
                                                </a>
                                            </Button>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </section>
            </main>
            <PublicFooter />
        </div>
    )
}
