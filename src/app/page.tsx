
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle,
  Home as HomeIcon,
  Users,
  QrCode,
  Shield,
  Sparkles,
  ChevronRight,
  CalendarPlus,
  ShieldCheck,
  Heart,
  Palette as PaletteIcon,
  BookOpen,
  Bot,
  Quote,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { generateWelcomeMessage } from '@/ai/flows/ai-welcome-message';

const rotatingWords = ['Effortlessly', 'Stylishly', 'Beautifully', 'Perfectly'];

const howItWorksSteps = [
  {
    icon: <CalendarPlus className="h-10 w-10 text-primary" />,
    title: "Create Your Event",
    description: "Transition from abstract idea to digital entity. Provide core details—Date, Time, and Venue—and receive a unique Event Code instantly."
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: "Design with AI",
    description: "Meet Eni, your AI creative director. Generate stunning, unique invitation cards and a cohesive master brand based on your chosen theme."
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: "Manage Your Guests",
    description: "Utilize your dashboard as a centralized Command Center. Categorize guests, send digital invites, and monitor real-time RSVPs."
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: "Execute Flawlessly",
    description: "Secure your venue with QR-based digital gate passes. Monitor live check-ins and broadcast announcements for a perfect day-of operation."
  }
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
        title: "Attendees",
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
  const missionImage = getImage('africansFun2');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Eni Interactive Demo State
  const [guestName, setGuestName] = useState('');
  const [demoEventName, setDemoEventName] = useState('');
  const [eniMessage, setEniMessage] = useState('');
  const [isGeneratingEni, setIsGeneratingEni] = useState(false);

  const handleGenerateEni = async () => {
    if (!guestName || !demoEventName) return;
    setIsGeneratingEni(true);
    try {
      const result = await generateWelcomeMessage({ 
        guestName, 
        eventName: demoEventName 
      });
      setEniMessage(result.message);
    } catch (error) {
      console.error('Eni generation failed:', error);
    } finally {
      setIsGeneratingEni(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[80vh] md:h-[90vh] text-white flex items-center justify-center overflow-hidden">
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
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-headline font-extrabold tracking-tight leading-[1.1] text-balance">
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
              <Button asChild size="lg" className="font-bold w-full sm:w-auto h-12 px-8 text-lg rounded-full">
                <Link href="/signup">
                  Create an Event <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto h-12 px-8 text-lg rounded-full">
                <Link href="/shows">
                  Buy Tickets
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto h-12 px-8 text-lg rounded-full">
                <Link href="/guest-login">
                  I am a Guest
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Role-Based Benefits Section */}
        <section id="benefits" className="py-20 md:py-32">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-headline font-bold md:text-5xl text-foreground text-balance">A Tool for Every Stakeholder</h2>
                    <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                        EvenTide empowers every role in the celebration lifecycle with specialized dashboard experiences.
                    </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {roleBenefits.map((role) => (
                        <Card key={role.title} className="border-border/50 bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 hover:-translate-y-2">
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

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 md:py-32 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-bold md:text-5xl text-foreground text-balance">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                A simple, streamlined process from concept to execution.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorksSteps.map((step, index) => (
                <Card key={index} className="border-none bg-background/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="text-center items-center pb-2">
                    <div className="mb-4 bg-primary/10 p-4 rounded-full">
                      {step.icon}
                    </div>
                    <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 md:py-32 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
                    <div className="w-full lg:w-1/2 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                            <Heart className="h-3 w-3" /> Our Mission
                        </div>
                        <h2 className="text-4xl md:text-6xl font-headline font-bold leading-[1.1] text-balance">
                            Bringing People Together, <br />
                            <span className="bg-gradient-to-r from-[#60A5FA] to-[#FDE047] text-transparent bg-clip-text">Beautifully.</span>
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed text-balance">
                            EvenTide isn&apos;t just about logistics; it&apos;s about the heartbeat of celebration. We combine high-performance technology with the soul of African hospitality to ensure that your most precious moments are shared seamlessly and remembered forever.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <PaletteIcon className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Poetic Precision</h3>
                                <p className="text-sm text-muted-foreground">Every detail, from invitations to menus, is curated by Eni to reflect unparalleled elegance.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Cultural Resonance</h3>
                                <p className="text-sm text-muted-foreground">We celebrate the richness of heritage, using language and design that speaks to the heart of community.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Effortless Harmony</h3>
                                <p className="text-sm text-muted-foreground">Our technology works silently in the background, so you can be fully present with the people you love.</p>
                            </div>
                            <div className="space-y-3">
                                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg">Living Archives</h3>
                                <p className="text-sm text-muted-foreground">Transforming one-day events into lasting digital stories through curated galleries and magazines.</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 relative">
                        <div className="aspect-[4/5] relative rounded-[2rem] overflow-hidden shadow-2xl">
                            {missionImage && (
                                <Image 
                                    src={missionImage.imageUrl}
                                    alt="African celebration"
                                    fill
                                    className="object-cover"
                                    data-ai-hint="nigerian celebration"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute bottom-8 left-8 right-8">
                                <p className="text-white font-logo text-2xl font-bold italic leading-tight">
                                    &quot;To turn every moment into EvenTide.&quot;
                                </p>
                            </div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-[#FDE047]/20 rounded-full blur-3xl -z-10" />
                        <div className="absolute -top-6 -left-6 h-32 w-32 bg-[#60A5FA]/20 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </div>
        </section>

        {/* Meet Eni Section */}
        <section id="meet-eni" className="py-20 md:py-32 bg-primary/5 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-6">
                  <Sparkles className="h-3 w-3" /> The AI Soul of EvenTide
                </div>
                <h2 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight text-balance">
                  Meet Eni, Your <br />AI Assistant
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg text-balance">
                  Eni is your poetic creative director and meticulous logistical coordinator. Experience her warmth instantly by generating a personalized welcome message for your event.
                </p>
                <div className="space-y-4 max-w-sm">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Your Name" 
                      value={guestName} 
                      onChange={(e) => setGuestName(e.target.value)}
                      className="h-12 bg-background border-border/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input 
                      placeholder="Event Name (e.g., Funke's Gala)" 
                      value={demoEventName} 
                      onChange={(e) => setDemoEventName(e.target.value)}
                      className="h-12 bg-background border-border/60"
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateEni} 
                    disabled={isGeneratingEni || !guestName || !demoEventName}
                    className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20"
                  >
                    {isGeneratingEni ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Experience the Magic
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-sm min-h-[350px] flex flex-col justify-center p-10 relative overflow-hidden rounded-[2rem]">
                  <div className="absolute top-6 right-8">
                    <Quote className="h-16 w-16 text-primary/5" />
                  </div>
                  {eniMessage ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      <p className="text-2xl md:text-3xl font-logo italic leading-tight text-foreground/90 text-balance">
                        &quot;{eniMessage}&quot;
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-1 w-8 bg-primary rounded-full" />
                        <p className="text-sm font-bold text-primary tracking-widest uppercase">Eni</p>
                      </div>
                      <Button variant="ghost" size="sm" className="p-0 text-muted-foreground hover:text-primary" onClick={() => setEniMessage('')}>
                        Generate Another
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground space-y-4">
                      <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-2">
                        <Bot className="h-10 w-10 text-primary/20" />
                      </div>
                      <div>
                        <p className="text-xl font-headline font-medium text-foreground/60">Eni is ready to welcome you.</p>
                        <p className="text-sm mt-2 opacity-60 max-w-[250px] mx-auto">Enter your details to receive a personalized celebratory note from our AI hostess.</p>
                      </div>
                    </div>
                  )}
                </Card>
                {/* Decorative Elements */}
                <div className="absolute -z-10 -bottom-16 -right-16 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute -z-10 -top-16 -left-16 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-bold md:text-5xl text-foreground text-balance">Ecosystem Subscription Levels</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
                High-fidelity functional tiers designed to scale with your ambition.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-stretch">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn(
                  "flex flex-col transition-all duration-300 relative border-border/50 overflow-hidden", 
                  tier.isPopular ? "border-primary ring-1 ring-primary shadow-2xl scale-105 z-10 bg-background" : "hover:scale-[1.02] bg-background/80"
                )}>
                  {tier.isPopular && <Badge className="absolute -top-0 right-4 rounded-t-none rounded-b-lg shadow-lg">Most Popular</Badge>}
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
                     <Button className="w-full font-bold rounded-full" variant={tier.isPopular ? "default" : "outline"}>
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
              <Button asChild size="lg" className="font-bold shadow-xl h-14 px-10 text-lg group rounded-full">
                <Link href="/signup">
                  Start Planning Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold h-14 px-10 text-lg rounded-full">
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
