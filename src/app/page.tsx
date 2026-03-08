
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarPlus,
  ShieldCheck,
  Bot,
  Quote,
  Loader2,
  Sparkles,
  Users,
  CircleCheck,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        title: "Event Owners",
        roleTitle: "The Strategists",
        features: ["360-degree oversight of your event portfolio.", "Real-time KPI tracking for RSVPs and check-ins.", "Direct budget management and financial logging."]
    },
    {
        title: "Professional Planners",
        roleTitle: "The Orchestrators",
        features: ["AI-powered program and menu architecting.", "Conflict detection and high-performance task boards.", "Seamless vendor contracting and marketplace integration."]
    },
    {
        title: "Attendees & Guests",
        roleTitle: "The Celebrants",
        features: ["Personalized digital invitations and asset wallets.", "Interactive song requests and autograph walls.", "Real-time event broadcasts and live photo galleries."]
    },
    {
        title: "On-Site Security",
        roleTitle: "The Gatekeepers",
        features: ["QR-based digital gate pass validation.", "Live check-in monitoring and capacity control.", "Secure scanner activation with unique event codes."]
    }
];

const testimonials = [
  {
    quote: "EvenTide transformed how we manage our large-scale corporate events. The AI program architect is a total game-changer for our team.",
    author: "Amaka O.",
    role: "Professional Planner",
    avatar: "https://picsum.photos/seed/amaka/100/100"
  },
  {
    quote: "Planning my daughter's wedding was stress-free thanks to Eni. The invitation designs were stunning and reflected our culture perfectly.",
    author: "Mr. Adebayo",
    role: "Event Owner",
    avatar: "https://picsum.photos/seed/adebayo/100/100"
  },
  {
    quote: "The QR-based gate pass made entry management so smooth. No more paper lists or long queues at the door. Very professional.",
    author: "Chidi E.",
    role: "Security Coordinator",
    avatar: "https://picsum.photos/seed/chidi/100/100"
  }
];

const pricingTiers = [
    {
        name: "Free Starter",
        price: "₦0",
        description: "The boutique entrance for intimate gatherings.",
        features: ["Up to 20 Guests", "Basic Digital Registry", "Standard Validation", "Basic Media Library"],
        isPopular: false,
    },
    {
        name: "Standard Flow",
        price: "₦25,000",
        description: "The ecosystem benchmark for flawless planning.",
        features: ["Up to 250 Guests", "Full Marketplace Integration", "Advanced Budget Ledger", "Custom Event Codes"],
        isPopular: true,
    },
    {
        name: "Premium Edge",
        price: "₦50,000",
        description: "AI-enhanced legacy building and reporting.",
        features: ["Up to 500 Guests", "Eni AI Stationery Studio", "AI-curated Magazine", "Live Reporting & Metrics"],
        isPopular: false,
    },
];

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};

export default function Home() {
  const heroImage = getImage('eventHall');
  const missionImage = getImage('africansFun2');
  const eniDemoImage = getImage('magazineReader');
  const processImage = getImage('gardenParty');

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
              <Button asChild size="lg" className="font-bold w-full sm:w-auto h-12 px-8 text-lg rounded-full shadow-2xl shadow-primary/40">
                <Link href="/signup">
                  Create an Event <ArrowRight className="ml-2 h-5 w-5" />
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

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 md:py-32 bg-secondary/30 relative overflow-hidden border-y border-border/40">
          <div className="container mx-auto px-4">
            <div className="mb-16 max-w-3xl mx-auto text-center">
                <h2 className="text-4xl md:text-6xl font-headline font-bold text-foreground text-balance leading-tight">How It Works</h2>
                <p className="mt-6 text-xl text-muted-foreground text-balance font-body">
                    A simple, streamlined four-step lifecycle from abstract idea to flawless execution.
                </p>
            </div>
            <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 flex justify-center">
                    {processImage && (
                        <div className="relative aspect-[4/3] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border-2 border-border/40 group">
                            <Image src={processImage.imageUrl} alt={processImage.description} fill className="object-cover group-hover:scale-110 transition-transform duration-[2000ms]" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                    )}
                </div>
                <div className="lg:col-span-7">
                    <div className="grid gap-8 sm:grid-cols-2 relative">
                    {howItWorksSteps.map((step, index) => (
                        <Card key={index} className="border-2 border-border/40 bg-background/80 backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-primary/40 transition-all duration-500 rounded-3xl group overflow-hidden relative p-2 hover:-translate-y-3">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                        <CardHeader className="text-center items-center pb-4 pt-10">
                            <div className="mb-6 bg-primary/5 p-6 rounded-3xl group-hover:bg-primary/10 group-hover:rotate-6 transition-all duration-500 shadow-inner">
                            {step.icon}
                            </div>
                            <CardTitle className="font-headline text-2xl font-bold">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-sm text-muted-foreground leading-loose px-8 pb-10 font-body">
                            {step.description}
                        </CardContent>
                        </Card>
                    ))}
                    </div>
                </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section id="vision" className="py-24 md:py-32 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="mb-16 max-w-3xl mx-auto text-center">
                <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight text-balance">Bringing People Together, <br/><span className="text-primary">Beautifully.</span></h2>
                <p className="mt-6 text-xl text-muted-foreground font-body text-balance">
                    Our vision is to transform every gathering into a narrative masterpiece, leveraging technology to honor culture and connection.
                </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="flex justify-center">
                <div className="relative w-full max-w-[280px] aspect-square rounded-[3rem] overflow-hidden shadow-2xl ring-8 ring-background/50 transition-all duration-700 hover:scale-105">
                  {missionImage && (
                    <Image
                      src={missionImage.imageUrl}
                      alt={missionImage.description}
                      fill
                      className="object-cover"
                      data-ai-hint={missionImage.imageHint}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-white font-logo text-xl font-bold italic tracking-tight px-4 drop-shadow-md">"Masterpiece Moments"</p>
                  </div>
                </div>
              </div>
              <div className="space-y-8 text-left">
                <div className="grid gap-6">
                  {[
                    { title: "Poetic Precision", desc: "Every detail, from the stationery to the program, is curated to reflect cultural elegance." },
                    { title: "Effortless Harmony", desc: "We handle the complexity, allowing you to be fully present in the moments that matter." },
                    { title: "Living Archives", desc: "Beyond execution, we transform celebrations into lasting digital legacies." }
                  ].map((item, i) => (
                    <Card key={i} className="bg-secondary/20 border-2 border-border/40 hover:border-primary/40 shadow-sm hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 ease-out group rounded-2xl">
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors font-headline">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-2 font-body">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Eni Section */}
        <section id="meet-eni" className="py-24 md:py-40 bg-primary/[0.02] relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-50" />
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
                      <Button variant="ghost" size="sm" className="h-auto text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px] p-0" onClick={() => setEniMessage('')}>
                        Generate Another
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-6">
                      <div className="h-24 w-24 rounded-[2rem] bg-primary/5 flex items-center justify-center mx-auto mb-4 border border-primary/10 shadow-inner">
                        <Bot className="h-12 w-12 text-primary opacity-40 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-2xl font-headline font-bold text-foreground/80 text-balance">Eni is ready to welcome you.</p>
                        <p className="text-base mt-3 text-muted-foreground leading-relaxed font-body">Enter your details to receive a personalized celebratory note from our AI hostess.</p>
                      </div>
                    </div>
                  )}
                </Card>
                {eniDemoImage && (
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-background hidden xl:block animate-in fade-in zoom-in duration-1000 delay-500">
                        <Image src={eniDemoImage.imageUrl} alt={eniDemoImage.description} fill className="object-cover" />
                    </div>
                )}
              </div>
              <div className="order-1 lg:order-2 text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-[0.25em] border border-accent/10 mb-8">
                  <span className="animate-pulse">●</span> The AI Soul of EvenTide
                </div>
                <h2 className="text-5xl md:text-7xl font-headline font-bold mb-8 tracking-tight text-balance leading-tight">
                  Meet Eni, Your <br /><span className="text-primary">AI Partner</span>
                </h2>
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
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 md:py-32 bg-background border-t border-border/40">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-headline font-bold text-foreground text-balance leading-tight">Loved by Planners & Hosts</h2>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto font-body text-balance text-center">
                See what our users are saying about their experience with EvenTide.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <Card key={i} className="bg-secondary/20 border-2 border-accent shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col rounded-3xl overflow-hidden group">
                  <CardHeader className="flex-1 p-8">
                    <Quote className="h-8 w-8 text-primary/40 mb-4 group-hover:text-primary transition-colors" />
                    <p className="text-lg italic leading-relaxed text-foreground/90 font-body">&quot;{t.quote}&quot;</p>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-4 p-8 border-t border-border/10 mt-auto bg-muted/30 rounded-b-3xl">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-md">
                      <AvatarImage src={t.avatar} alt={t.author} />
                      <AvatarFallback>{t.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-bold text-sm tracking-tight">{t.author}</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t.role}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Ecosystem Section */}
        <section id="benefits" className="py-24 md:py-32 bg-secondary/10">
            <div className="container mx-auto px-4">
                <div className="mb-20 max-w-3xl mx-auto text-center">
                    <Badge variant="outline" className="mb-4 border-primary/20 text-primary font-bold uppercase tracking-widest px-4 py-1 rounded-full">The EvenTide Ecosystem</Badge>
                    <h2 className="text-4xl md:text-6xl font-headline font-bold text-foreground text-balance leading-tight">A Tool for Everyone</h2>
                    <p className="mt-6 text-xl text-muted-foreground text-balance font-body text-center">
                        EvenTide is designed to empower every role involved in making an event a success.
                    </p>
                </div>
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {roleBenefits.map((role) => (
                        <Card key={role.title} className="border-2 border-border/40 bg-background hover:bg-muted/30 transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] group shadow-sm hover:shadow-2xl hover:border-primary/20 flex flex-col p-6 rounded-3xl">
                            <div className="space-y-1 mb-6 text-center md:text-left">
                                <CardTitle className="font-headline text-2xl group-hover:text-primary transition-colors">{role.title}</CardTitle>
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">{role.roleTitle}</p>
                            </div>
                            <CardContent className="flex-1 p-0 text-left">
                                <ul className="space-y-4">
                                    {role.features.map((feature, i) => (
                                        <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-3">
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter className="pt-6 border-t border-border/10 p-0 mt-6">
                                <Button variant="ghost" size="sm" className="w-full text-xs font-bold uppercase tracking-widest group-hover:bg-primary group-hover:text-primary-foreground transition-all rounded-xl" asChild>
                                    <Link href="/signup">Explore Workspace</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 md:py-40 border-t border-border/40 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-headline font-bold text-foreground text-balance leading-tight">Ecosystem Subscription</h2>
              <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto text-balance font-body text-center">
                High-fidelity functional tiers designed to scale with your ambition.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto items-stretch">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn(
                  "flex flex-col transition-all duration-500 relative border-2 border-border/40 rounded-[2rem] overflow-visible",
                  tier.isPopular ? "border-primary/50 ring-1 ring-primary/20 shadow-2xl scale-105 z-10 bg-background" : "hover:scale-[1.02] bg-background/40 hover:bg-background/60 shadow-sm hover:border-primary/30"
                )}>
                  {tier.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="rounded-full shadow-lg px-6 py-1.5 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap border-4 border-background bg-primary text-primary-foreground">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="pt-10 pb-6 px-8 text-center">
                    <CardTitle className="font-headline text-2xl font-bold">{tier.name}</CardTitle>
                     <div className="flex items-baseline justify-center gap-1 mt-4">
                      <p className="text-4xl font-bold font-headline">{tier.price}</p>
                    </div>
                    <CardDescription className="min-h-[48px] text-xs mt-4 leading-relaxed font-medium font-body">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 px-8">
                    <ul className="space-y-4 pt-4 border-t border-border/10">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-[13px] text-muted-foreground font-body">
                          <CircleCheck className="h-4 w-4 text-green-500 mt-0.5" />
                          <span className="leading-snug text-left">{feature}</span>
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
        <section className="py-24 md:py-48 relative overflow-hidden bg-muted/30 border-t border-border/40 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -z-10" />
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-headline font-bold md:text-8xl text-foreground text-balance leading-[1.1] mb-10">
              Your Next Event, <br className="hidden md:block" /> <span className="italic font-logo text-primary">Reimagined.</span>
            </h2>
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button asChild size="lg" className="font-bold shadow-[0_20px_50px_rgba(var(--primary),0.3)] h-16 px-12 text-xl group rounded-[2rem] active:scale-[0.98] transition-all">
                <Link href="/signup">
                  Start Planning Now <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
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
