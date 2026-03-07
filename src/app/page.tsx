
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Home as HomeIcon,
  Palette,
  ShieldCheck,
  Users,
  Wand2,
  ChevronRight,
  Shield,
  QrCode,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const rotatingWords = ['Effortlessly', 'Stylishly', 'Beautifully', 'Perfectly'];

const howItWorks = [
  {
    icon: <Wand2 className="h-8 w-8 text-primary" />,
    title: '1. Create Your Event',
    description: 'Start by setting up your event details, date, and venue. Our intuitive interface makes it a breeze.',
  },
  {
    icon: <Palette className="h-8 w-8 text-primary" />,
    title: '2. Design with AI',
    description: "Let Eni, our AI assistant, help you design stunning invitations and branding for your event's theme.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: '3. Manage Your Guests',
    description: 'Easily import, categorize, and communicate with your guests, all from one central dashboard.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: '4. Execute Flawlessly',
    description: 'Use our tools for secure check-ins, real-time announcements, and seamless day-of coordination.',
  },
];

const roleBenefits = [
    {
        icon: <HomeIcon className="h-8 w-8 text-primary" />,
        title: "Owners",
        features: ["Oversee all events from a master dashboard.", "Manage budgets and track revenue in real-time.", "Assign roles and permissions to your team."]
    },
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "Planners",
        features: ["Collaborate with team members and co-hosts.", "Utilize AI for design and content creation.", "Manage guest lists and communication."]
    },
    {
        icon: <QrCode className="h-8 w-8 text-primary" />,
        title: "Guests",
        features: ["Receive personalized digital invitations.", "RSVP effortlessly and view event details.", "Stay updated with real-time announcements."]
    },
    {
        icon: <Shield className="h-8 w-8 text-primary" />,
        title: "Security",
        features: ["Validate guest passes with QR scanning.", "Monitor live check-ins and capacity.", "Access control with secure activation codes."]
    }
];

const pricingTiers = [
    {
        name: "Free Starter",
        price: "₦0",
        description: "The boutique entrance for intimate gatherings.",
        features: [
            "Up to 20 Guests", 
            "Basic Digital Registry", 
            "Standard Validation"
        ],
        isPopular: false,
    },
    {
        name: "Basic Hub",
        price: "₦10,000",
        description: "Professional orchestration for growing events.",
        features: [
            "Up to 100 Guests", 
            "Team Collaboration (Co-hosts)", 
            "Standard Analytics"
        ],
        isPopular: false,
    },
    {
        name: "Standard Flow",
        price: "₦25,000",
        description: "The ecosystem benchmark for flawless planning.",
        features: [
            "Up to 250 Guests", 
            "Full Marketplace Integration", 
            "Advanced Budget Ledger"
        ],
        isPopular: true,
    },
    {
        name: "Premium Edge",
        price: "₦50,000",
        description: "AI-enhanced legacy building and reporting.",
        features: [
            "Up to 500 Guests", 
            "Eni AI Stationery Studio", 
            "AI-curated Magazine",
            "Live Reporting"
        ],
        isPopular: false,
    },
    {
        name: "Enterprise Elite",
        price: "₦100,000",
        description: "Maximum scale for grand galas.",
        features: [
            "Up to 5,000 Guests", 
            "White-labeling & Custom Branding", 
            "Dedicated Technical Concierge"
        ],
        isPopular: false,
    },
];

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};

export default function Home() {
  const heroImage = getImage('eventHall');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[70vh] md:h-[90vh] text-white">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/80 via-black/50 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
            <h1 className="text-4xl font-headline font-extrabold tracking-tight md:text-6xl lg:text-7xl text-shadow-lg leading-tight">
              Plan Your Event
              <br />
              <span className="bg-gradient-to-r from-[#60A5FA] to-[#FDE047] text-transparent bg-clip-text transition-all duration-300">
                {rotatingWords[currentIndex]}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl font-body text-white/90">
              Welcome to EvenTide, your AI-powered partner for flawless event management. From intimate gatherings to grand galas, we bring your vision to life with intuitive tools and expert assistance.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="font-bold w-full sm:w-auto">
                <Link href="/signup">
                  Create an Event <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold bg-white/10 border-white/20 hover:bg-white/20 w-full sm:w-auto">
                <Link href="/shows">
                  Buy Tickets
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold bg-white/10 border-white/20 hover:bg-white/20 w-full sm:w-auto">
                <Link href="/guest-login">
                  I am a Guest
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold md:text-4xl text-foreground">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                A simple, streamlined process from concept to execution.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step) => (
                <Card key={step.title} className="text-center">
                  <CardHeader className="items-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                      {step.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Role-Based Benefits Section */}
        <section id="benefits" className="py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold md:text-4xl text-foreground">A Tool for Everyone on the Team</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        EvenTide is designed to empower every role involved in making an event a success.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {roleBenefits.map((role) => (
                        <Card key={role.title} className="border-accent border-2 bg-primary/20 transition-transform transition-shadow duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl hover:shadow-accent/20">
                            <CardHeader className="flex-row items-center gap-4">
                                {role.icon}
                                <CardTitle className="font-headline text-xl">{role.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-muted-foreground">
                                    {role.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold md:text-4xl text-foreground">Pricing Plans for Every Event</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Choose the perfect plan that fits the scale of your event.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5 items-start">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn(
                  "flex flex-col transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl relative h-full", 
                  tier.isPopular && "border-2 border-primary shadow-lg shadow-primary/20"
                )}>
                  {tier.isPopular && <Badge className="absolute -top-3 right-4">Popular</Badge>}
                  <CardHeader>
                    <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
                     <div className="flex items-baseline gap-1">
                      <p className="text-4xl font-bold">{tier.price}</p>
                    </div>
                    <CardDescription className="min-h-[40px]">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-6">
                     <Button className="w-full font-bold" variant={tier.isPopular ? "default" : "outline"}>
                        {tier.name === "Free Starter" ? "Get Started" : "Choose " + tier.name}
                     </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-headline font-bold md:text-4xl text-foreground">
              Ready to Create an Unforgettable Event?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join EvenTide today and experience the future of event management.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="font-bold shadow-lg">
                <Link href="/signup">
                  Start Planning Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
