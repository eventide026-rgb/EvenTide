
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
  Sparkles,
  Zap,
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
            "Standard Validation",
            "Basic Media Library"
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
            "Standard Analytics",
            "Advanced RSVP Tracking"
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
            "Advanced Budget Ledger",
            "Custom Event Codes"
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
            "Live Reporting & Metrics"
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
            "Dedicated Technical Concierge",
            "Multi-event Management"
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
        <section className="relative w-full h-[80vh] md:h-[90vh] text-white flex items-center justify-center">
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
          <div className="absolute inset-0 bg-black/70 via-black/40 to-transparent"></div>
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-headline font-extrabold tracking-tight text-shadow-lg leading-[1.1] text-balance">
              Plan Your Event
              <br />
              <span className="bg-gradient-to-r from-[#60A5FA] to-[#FDE047] text-transparent bg-clip-text transition-all duration-500">
                {rotatingWords[currentIndex]}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl font-body text-white/90 leading-relaxed text-balance">
              Welcome to EvenTide, your AI-powered partner for flawless event management. From intimate gatherings to grand galas, we bring your vision to life with intuitive tools and expert assistance.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="font-bold w-full sm:w-auto h-12 px-8 text-lg">
                <Link href="/signup">
                  Create an Event <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto h-12 px-8 text-lg">
                <Link href="/shows">
                  Buy Tickets
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto h-12 px-8 text-lg">
                <Link href="/guest-login">
                  I am a Guest
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-bold md:text-5xl text-foreground">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                A streamlined, ecosystem-wide process from initial concept to digital legacy.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step) => (
                <Card key={step.title} className="text-center border-none bg-background/50 backdrop-blur shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="items-center pb-2">
                    <div className="bg-primary/10 p-5 rounded-2xl mb-4 text-primary">
                      {step.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Role-Based Benefits Section */}
        <section id="benefits" className="py-20 md:py-32 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-headline font-bold md:text-5xl text-foreground">A Tool for Every Stakeholder</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                        EvenTide empowers every role in the celebration lifecycle with specialized dashboard experiences.
                    </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {roleBenefits.map((role) => (
                        <Card key={role.title} className="border-accent/20 bg-primary/5 hover:bg-primary/10 transition-all duration-300 hover:-translate-y-2">
                            <CardHeader className="flex-row items-center gap-4">
                                <div className="p-3 bg-background rounded-xl shadow-sm">
                                    {role.icon}
                                </div>
                                <CardTitle className="font-headline text-2xl">{role.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-muted-foreground">
                                    {role.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <CheckCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
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
        <section id="pricing" className="py-20 md:py-32 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-bold md:text-5xl text-foreground">The Ecosystem Subscriptions</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                High-fidelity functional levels designed to scale with your ambition.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-stretch">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn(
                  "flex flex-col transition-all duration-300 relative border-border/50", 
                  tier.isPopular ? "border-primary ring-1 ring-primary shadow-2xl scale-105 z-10 bg-background" : "hover:scale-[1.02] bg-background/80"
                )}>
                  {tier.isPopular && <Badge className="absolute -top-3 right-4 shadow-lg">Most Popular</Badge>}
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">{tier.name}</CardTitle>
                     <div className="flex items-baseline gap-1 mt-2">
                      <p className="text-3xl font-bold">{tier.price}</p>
                    </div>
                    <CardDescription className="min-h-[48px] text-xs mt-2">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-[13px] text-muted-foreground">
                          <ChevronRight className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="pt-6">
                     <Button className="w-full font-bold" variant={tier.isPopular ? "default" : "outline"}>
                        {tier.name === "Free Starter" ? "Get Started" : "Select Plan"}
                     </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 md:py-40 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
          <div className="container mx-auto px-4 text-center">
            <Sparkles className="h-12 w-12 text-accent mx-auto mb-6" />
            <h2 className="text-4xl font-headline font-bold md:text-6xl text-foreground text-balance">
              Transform Your Next Event <br className="hidden md:block" /> into a Masterpiece
            </h2>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Join the EvenTide ecosystem today and experience the convergence of technology, creativity, and culture.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="font-bold shadow-xl h-14 px-10 text-lg group">
                <Link href="/signup">
                  Start Planning Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold h-14 px-10 text-lg">
                <Link href="/contact">
                  Speak to an Expert
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
