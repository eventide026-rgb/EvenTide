'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CircleCheck,
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
import { Label } from '@/components/ui/label';
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
        title: "Event Owners",
        roleTitle: "The Strategists",
        features: ["360-degree oversight of your event portfolio.", "Real-time KPI tracking for RSVPs and check-ins.", "Direct budget management and financial logging."]
    },
    {
        icon: <Users className="h-8 w-8 text-primary" />,
        title: "Professional Planners",
        roleTitle: "The Orchestrators",
        features: ["AI-powered program and menu architecting.", "Conflict detection and high-performance task boards.", "Seamless vendor contracting and marketplace integration."]
    },
    {
        icon: <QrCode className="h-8 w-8 text-primary" />,
        title: "Attendees & Guests",
        roleTitle: "The Celebrants",
        features: ["Personalized digital invitations and asset wallets.", "Interactive song requests and autograph walls.", "Real-time event broadcasts and live photo galleries."]
    },
    {
        icon: <Shield className="h-8 w-8 text-primary" />,
        title: "On-Site Security",
        roleTitle: "The Gatekeepers",
        features: ["QR-based digital gate pass validation.", "Live check-in monitoring and capacity control.", "Secure scanner activation with unique event codes."]
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

        {/* A Tool for Everyone on the Team */}
        <section id="benefits" className="py-24 md:py-32 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <Badge variant="outline" className="mb-4 border-primary/20 text-primary font-bold uppercase tracking-widest px-4 py-1 rounded-full">The EvenTide Ecosystem</Badge>
                    <h2 className="text-4xl md:text-6xl font-headline font-bold text-foreground text-balance leading-tight">A Tool for Everyone on the Team</h2>
                    <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto text-balance font-body">
                        EvenTide is designed to empower every role involved in making an event a success. From strategic oversight to secure execution, we provide the tools needed for excellence at every touchpoint.
                    </p>
                </div>
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {roleBenefits.map((role) => (
                        <Card key={role.title} className="border border-border/40 bg-secondary/20 hover:bg-secondary/40 transition-all duration-500 hover:-translate-y-2 group shadow-sm hover:shadow-xl hover:border-primary/20 flex flex-col">
                            <CardHeader className="flex-row items-center gap-5 pb-6">
                                <div className="p-4 bg-background rounded-2xl shadow-md group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-500">
                                    {role.icon}
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">{role.title}</CardTitle>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">{role.roleTitle}</p>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <ul className="space-y-4">
                                    {role.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-4 text-sm text-muted-foreground leading-relaxed">
                                            <div className="mt-1 flex-shrink-0">
                                                <CircleCheck className="h-4 w-4 text-primary group-hover:text-accent transition-colors" />
                                            </div>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-6 border-t border-border/10">
                                <Button variant="ghost" size="sm" className="w-full text-xs font-bold uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground transition-all" asChild>
                                    <Link href="/signup">Explore Workspace</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-headline font-bold text-foreground text-balance">How It Works</h2>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                A simple, streamlined four-step lifecycle from abstract idea to flawless execution.
              </p>
            </div>
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorksSteps.map((step, index) => (
                <Card key={index} className="border-2 border-primary/20 bg-background/80 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-500 rounded-3xl group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  <CardHeader className="text-center items-center pb-4 pt-10">
                    <div className="mb-6 bg-primary/5 p-6 rounded-3xl group-hover:bg-primary/10 group-hover:rotate-6 transition-all duration-500">
                      {step.icon}
                    </div>
                    <CardTitle className="font-headline text-2xl font-bold">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center text-sm text-muted-foreground leading-loose px-8 pb-10">
                    {step.description}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-24 md:py-40 overflow-hidden relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
                    <div className="w-full lg:w-1/2 space-y-10">
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-[0.25em] border border-primary/10">
                            <Heart className="h-3.5 w-3.5" /> Our Mission
                        </div>
                        <h2 className="text-5xl md:text-7xl font-headline font-bold leading-[1.05] text-balance">
                            Bringing People Together, <br />
                            <span className="bg-gradient-to-r from-[#60A5FA] to-[#FDE047] text-transparent bg-clip-text">Beautifully.</span>
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed text-balance font-body max-w-xl">
                            EvenTide is n&apos;t just about logistics; it&apos;s about the heartbeat of celebration. We combine high-performance technology with the soul of African hospitality to ensure that your most precious moments are shared seamlessly and remembered forever.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-inner">
                                    <PaletteIcon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-xl font-headline">Poetic Precision</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">Every detail, from invitations to menus, is curated by Eni to reflect unparalleled elegance.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-inner">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-xl font-headline">Cultural Resonance</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">We celebrate heritage, using language and design that speaks to the heart of community.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-inner">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-xl font-headline">Effortless Harmony</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">Our technology works silently, so you can be fully present with the people you love.</p>
                            </div>
                            <div className="space-y-4">
                                <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center shadow-inner">
                                    <BookOpen className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="font-bold text-xl font-headline">Living Archives</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">Transforming one-day events into lasting digital stories through curated galleries and magazines.</p>
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 relative">
                        <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border-8 border-background">
                            {missionImage && (
                                <Image 
                                    src={missionImage.imageUrl}
                                    alt="African celebration"
                                    fill
                                    className="object-cover transition-transform duration-10000 hover:scale-110"
                                    data-ai-hint="nigerian wedding"
                                />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-12 left-12 right-12">
                                <p className="text-white font-logo text-3xl font-bold italic leading-tight text-balance drop-shadow-lg">
                                    &quot;To turn every moment into EvenTide.&quot;
                                </p>
                            </div>
                        </div>
                        <div className="absolute -bottom-12 -right-12 h-64 w-64 bg-[#FDE047]/10 rounded-full blur-[100px] -z-10" />
                        <div className="absolute -top-12 -left-12 h-64 w-64 bg-[#60A5FA]/10 rounded-full blur-[100px] -z-10" />
                    </div>
                </div>
            </div>
        </section>

        {/* Meet Eni Section */}
        <section id="meet-eni" className="py-24 md:py-40 bg-primary/[0.02] relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-[0.25em] border border-accent/10 mb-8">
                  <Sparkles className="h-3.5 w-3.5" /> The AI Soul of EvenTide
                </div>
                <h2 className="text-5xl md:text-7xl font-headline font-bold mb-8 tracking-tight text-balance leading-tight">
                  Meet Eni, Your <br /><span className="text-primary">AI Partner</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg text-balance font-body">
                  Experience the power of AI. Eni is your poetic creative director and meticulous logistical coordinator. Experience her warmth instantly by generating a personalized welcome message for your event.
                </p>
                <div className="space-y-5 max-w-md">
                  <div className="space-y-3">
                    <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Guest Name</Label>
                    <Input 
                      placeholder="e.g., Olumide" 
                      value={guestName} 
                      onChange={(e) => setGuestName(e.target.value)}
                      className="h-14 bg-background border-border/40 focus:border-primary/50 transition-colors text-lg px-6 rounded-2xl"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground ml-1">Event Reference</Label>
                    <Input 
                      placeholder="e.g., The Grand Reunion" 
                      value={demoEventName} 
                      onChange={(e) => setDemoEventName(e.target.value)}
                      className="h-14 bg-background border-border/40 focus:border-primary/50 transition-colors text-lg px-6 rounded-2xl"
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateEni} 
                    disabled={isGeneratingEni || !guestName || !demoEventName}
                    className="w-full h-14 rounded-2xl font-bold text-lg shadow-2xl shadow-primary/30 mt-4 active:scale-[0.98] transition-all"
                  >
                    {isGeneratingEni ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Experience Eni
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Card className="border-none shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] bg-background/60 backdrop-blur-3xl min-h-[450px] flex flex-col justify-center p-12 relative overflow-hidden rounded-[3rem] border border-white/10">
                  <div className="absolute top-10 right-12">
                    <Quote className="h-24 w-24 text-primary/5 rotate-12" />
                  </div>
                  {eniMessage ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <p className="text-3xl md:text-4xl font-logo italic leading-[1.3] text-foreground/90 text-balance tracking-tight">
                        &quot;{eniMessage}&quot;
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="h-[2px] w-12 bg-primary rounded-full" />
                        <p className="text-sm font-bold text-primary tracking-[0.3em] uppercase">Eni</p>
                      </div>
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]" onClick={() => setEniMessage('')}>
                        Generate Another
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="h-24 w-24 rounded-[2rem] bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10">
                        <Bot className="h-12 w-12 text-primary opacity-40 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-2xl font-headline font-bold text-foreground/80">Eni is ready to welcome you.</p>
                        <p className="text-base mt-3 text-muted-foreground max-w-[280px] mx-auto leading-relaxed">Enter your details to receive a personalized celebratory note from our AI hostess.</p>
                      </div>
                    </div>
                  )}
                </Card>
                {/* Decorative Elements */}
                <div className="absolute -z-10 -bottom-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute -z-10 -top-24 -left-24 w-80 h-80 bg-accent/10 rounded-full blur-[120px]" />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-headline font-bold text-foreground text-balance leading-tight">Ecosystem Subscription Levels</h2>
              <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto text-balance font-body">
                High-fidelity functional tiers designed to scale with your ambition, from intimate gatherings to massive cultural spectacles.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 items-stretch">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn(
                  "flex flex-col transition-all duration-500 relative border-2 border-primary/10 overflow-hidden rounded-[2rem]", 
                  tier.isPopular ? "border-primary/50 ring-1 ring-primary/20 shadow-[0_32px_64px_-12px_rgba(var(--primary),0.3)] scale-105 z-10 bg-background" : "hover:scale-[1.02] bg-background/40 hover:bg-background/60 shadow-sm hover:border-primary/30"
                )}>
                  {tier.isPopular && <Badge className="absolute -top-0 right-6 rounded-t-none rounded-b-xl shadow-lg px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">Standard Entry</Badge>}
                  <CardHeader className="pt-10 pb-6 px-8">
                    <CardTitle className="font-headline text-2xl font-bold">{tier.name}</CardTitle>
                     <div className="flex items-baseline gap-1 mt-4">
                      <p className="text-4xl font-bold font-headline">{tier.price}</p>
                    </div>
                    <CardDescription className="min-h-[48px] text-xs mt-4 leading-relaxed font-medium">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 px-8">
                    <ul className="space-y-4 pt-4 border-t border-border/10">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-[13px] text-muted-foreground">
                          <div className="mt-1 flex-shrink-0">
                            <ChevronRight className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-8">
                     <Button className="w-full font-bold rounded-2xl h-12 shadow-inner transition-all active:scale-[0.97]" variant={tier.isPopular ? "default" : "outline"}>
                        {tier.name === "Free Starter" ? "Get Started" : "Select Path"}
                     </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 md:py-48 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 mb-10 px-6 py-2 rounded-full bg-background border shadow-sm">
                <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-[0.2em]">Ready to begin?</span>
            </div>
            <h2 className="text-5xl font-headline font-bold md:text-8xl text-foreground text-balance leading-[1.1] mb-10">
              Transform Your Next Event <br className="hidden md:block" /> into a <span className="italic font-logo text-primary">Masterpiece</span>
            </h2>
            <p className="mt-8 text-2xl text-muted-foreground max-w-3xl mx-auto text-balance leading-relaxed font-body">
              Join the EvenTide ecosystem today and experience the convergence of technology, creativity, and culture.
            </p>
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button asChild size="lg" className="font-bold shadow-[0_20px_50px_rgba(var(--primary),0.3)] h-16 px-12 text-xl group rounded-[2rem] active:scale-[0.98] transition-all">
                <Link href="/signup">
                  Start Planning Now <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold h-16 px-12 text-xl rounded-[2rem] border-2 bg-background/50 backdrop-blur hover:bg-background transition-all active:scale-[0.98]">
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
