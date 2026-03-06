
'use client';

import { use, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { notFound, useRouter } from 'next/navigation';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MapPin, Globe, Instagram, Facebook, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Vendor } from '@/lib/types';
import { TikTokIcon } from '@/components/icons/tiktok';
import { Button } from '@/components/ui/button';
import { VendorProposalDialog } from '@/components/vendor-proposal-dialog';
import Image from 'next/image';

export default function PlannerVendorDetailPage({ params }: { params: Promise<{ vendorId: string }> }) {
    const { vendorId } = use(params);
    const firestore = useFirestore();
    const router = useRouter();

    const vendorRef = useMemoFirebase(() => {
        if (!firestore || !vendorId) return null;
        return doc(firestore, 'vendors', vendorId);
    }, [firestore, vendorId]);

    const { data: vendor, isLoading } = useDoc<Vendor>(vendorRef);

    if (isLoading) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-background">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        )
    }

    if (!vendor) {
        return notFound();
    }
    
    const socialLinks = [
        { href: vendor.websiteUrl, icon: Globe, label: 'Website' },
        { href: vendor.instagramUrl, icon: Instagram, label: 'Instagram' },
        { href: vendor.tiktokUrl, icon: TikTokIcon, label: 'TikTok' },
        { href: vendor.facebookUrl, icon: Facebook, label: 'Facebook' },
    ].filter(link => link.href);

    return (
        <div className="space-y-6">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Vendor Hub
            </Button>

             <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row items-center gap-6">
                            <Avatar className="h-24 w-24 border-2 border-primary">
                                <AvatarImage src={vendor.avatarUrl} alt={vendor.name} />
                                <AvatarFallback>{vendor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                             <div className="text-center md:text-left">
                                <h1 className="text-3xl font-headline font-bold">{vendor.name}</h1>
                                <p className="text-lg font-semibold text-primary mt-1">{vendor.specialty}</p>
                                {(vendor.city || vendor.state) && (
                                        <p className="mt-2 text-md text-muted-foreground flex items-center justify-center md:justify-start gap-2">
                                        <MapPin className="h-4 w-4"/>
                                        {vendor.city}, {vendor.state}
                                    </p>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                             <p className="text-muted-foreground whitespace-pre-wrap">{vendor.bio || "This vendor hasn't written a bio yet."}</p>
                        </CardContent>
                    </Card>

                        {vendor.portfolio && vendor.portfolio.length > 0 && (
                            <Card>
                            <CardHeader>
                                <CardTitle>Portfolio</CardTitle>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vendor.portfolio.map((item, index) => (
                                    <div key={index} className="group relative aspect-square">
                                        <Image src={item.imageUrl} alt={item.description || `Portfolio item ${index + 1}`} fill className="object-cover rounded-md"/>
                                        {item.description && (
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white text-center text-sm">{item.description}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                </div>
                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact or Propose</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button asChild className="w-full" variant="outline">
                                <a href={`mailto:${vendor.email}`}>Contact {vendor.name.split(' ')[0]}</a>
                            </Button>
                            <VendorProposalDialog vendor={vendor} />
                        </CardContent>
                    </Card>
                        {socialLinks.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Follow</CardTitle>
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
        </div>
    )
}
