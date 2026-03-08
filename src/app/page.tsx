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
    icon: <CalendarPlus className="h-8 w-8 text-primary" />,
    title: "Create Your Event",
    description: "Transition from abstract idea to digital entity. Receive a unique Event Code instantly."
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    title: "Design with AI",
    description: "Meet Eni, your AI director. Generate stunning invitation cards and a cohesive brand."
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Manage Your Guests",
    description: "Utilize your Command Center to categorize guests and monitor real-time RSVPs."
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary" />,
    title: "Execute Flawlessly",
    description: "Secure your venue with QR passes. Monitor live check-ins and broadcasts."
  }
];

const testimonials = [
  {
    quote: "EvenTide transformed how we manage our large-scale corporate events. The AI program architect is a game-changer.",
    author: "Amaka O.",
    role: "Professional Planner",
    avatar: "https://picsum.photos/seed/amaka/100/100"
  },
  {
    quote: "Planning my daughter's wedding was stress-free thanks to Eni. The designs reflected our culture perfectly.",
    author: "Mr. Adebayo",
    role: "Event Owner",
    avatar: "https://picsum.photos/seed/adebayo/100/100"
  },
  {
    quote: "The QR-based gate pass made entry management so smooth. No more paper lists or long queues at the door.",
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
        features: ["Up to 20 Guests", "Digital Registry", "Standard Validation", "Media Library"],
        isPopular: false,
    },
    {
        name: "Standard Flow",
        price: "₦25,000",
        description: "The ecosystem benchmark for flawless planning.",
        features: ["Up to 250 Guests", "Marketplace Integration", "Budget Ledger", "Custom Codes"],
        isPopular: true,
    },
    {
        name: "Premium Edge",
        price: "₦50,000",
        description: "AI-enhanced legacy building and reporting.",
        features: ["Up to 500 Guests", "AI Stationery Studio", "Curated Magazine", "Live Reporting"],
        isPopular: false,
    },
];

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};

export default function Home() {
  const heroImage = getImage('eventHall');
  const missionImage = getImage('africansFun2');
  const processImage = getImage('gardenParty');

  const [currentIndex, setCurrentIndex] = useState(0);
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
        <section className="relative w-full h-[60vh] md:h-[70vh] text-white flex items-center justify-center overflow-hidden">
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
            <p className="mt-4 max-w-xl mx-auto text-base md:text-lg font-body text-white/90 leading-relaxed text-balance">
              EvenTide is your AI-powered partner for flawless event management. From intimate gatherings to grand galas, we bring your vision to life.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="font-bold w-full sm:w-auto h-12 px-8 text-lg rounded-full shadow-2xl shadow-primary/40">
                <Link href="/signup">
                  Create an Event <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/20 w-full sm:w-auto h-12 px-8 text-lg rounded-full text-white">
                <Link href="/guest-login">
                  I am a Guest
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-6 md:py-10 bg-secondary/30 relative overflow-hidden border-y border-border/40">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 text-center space-y-6">
                    <div className="space-y-3">
                        <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground text-balance leading-tight">How It Works</h2>
                        <p className="text-lg text-muted-foreground text-balance font-body max-w-sm mx-auto">
                            A simple, streamlined four-step lifecycle from abstract idea to flawless execution.
                        </p>
                    </div>
                    {processImage && (
                        <div className="relative aspect-[4/3] w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl border border-border/40 group">
                            <Image src={processImage.imageUrl} alt={processImage.description} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                    )}
                </div>
                <div className="lg:col-span-7">
                    <div className="grid gap-4 sm:grid-cols-2 relative">
                    {howItWorksSteps.map((step, index) => (
                        <Card key={index} className="border border-border/40 bg-background/80 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl p-1">
                        <CardHeader className="text-center items-center pb-2 pt-6">
                            <div className="mb-4 bg-primary/5 p-4 rounded-2xl">
                            {step.icon}
                            </div>
                            <CardTitle className="font-headline text-xl font-bold">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center text-sm text-muted-foreground leading-relaxed px-6 pb-6 font-body">
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
        <section id="vision" className="py-6 md:py-10 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="mb-8 max-w-3xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight text-balance">Bringing People Together, <br/><span className="text-primary">Beautifully.</span></h2>
                <p className="mt-3 text-lg text-muted-foreground font-body text-balance">
                    Transforming gatherings into narrative masterpieces through poetic precision and harmony.
                </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="flex justify-center">
                <div className="relative w-full max-w-[260px] aspect-square rounded-[2rem] overflow-hidden shadow-xl ring-4 ring-background/50 transition-all duration-500 hover:scale-105">
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
                  <div className="absolute bottom-6 left-0 right-0 text-center px-4">
                    <p className="text-white font-logo text-lg font-bold italic tracking-tight drop-shadow-md">"Masterpiece Moments"</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                    { title: "Poetic Precision", desc: "Curated details that reflect cultural elegance." },
                    { title: "Effortless Harmony", desc: "We handle complexity so you can stay present." },
                    { title: "Living Archives", desc: "Transforming celebrations into digital legacies." }
                  ].map((item, i) => (
                    <Card key={i} className="bg-secondary/20 border border-border/40 hover:border-primary/40 shadow-sm hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 group rounded-xl">
                      <CardContent className="p-5">
                        <h3 className="font-bold text-base group-hover:text-primary transition-colors font-headline">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-1 font-body">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Meet Eni Section */}
        <section id="meet-eni" className="py-6 md:py-10 bg-primary/[0.02] relative overflow-hidden border-y border-border/20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="relative order-2 lg:order-1 flex justify-center">
                <Card className="border-none shadow-2xl bg-background/60 backdrop-blur-3xl min-h-[280px] w-full max-w-md flex flex-col justify-center p-8 relative overflow-hidden rounded-[2rem] border border-white/10">
                  <div className="absolute top-6 right-8">
                    <Quote className="h-12 w-12 text-primary/10 rotate-12" />
                  </div>
                  {eniMessage ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <p className="text-2xl md:text-3xl font-logo italic leading-snug text-foreground/90 text-balance tracking-tight">
                        &quot;{eniMessage}&quot;
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-[1px] w-10 bg-primary rounded-full" />
                        <p className="text-xs font-bold text-primary tracking-[0.3em] uppercase">Eni</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-auto text-muted-foreground hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px] p-0" onClick={() => setEniMessage('')}>
                        Generate Another
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="h-16 w-16 rounded-[1rem] bg-primary/5 flex items-center justify-center mx-auto mb-2 border border-primary/10">
                        <Bot className="h-8 w-8 text-primary opacity-40 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xl font-headline font-bold text-foreground/80">Eni is ready to welcome you.</p>
                        <p className="text-sm mt-2 text-muted-foreground leading-relaxed font-body">Get a personalized celebratory note from our AI hostess.</p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
              <div className="order-1 lg:order-2 text-center lg:text-left">
                <h2 className="text-4xl md:text-6xl font-headline font-bold mb-6 tracking-tight text-balance leading-tight">
                  Meet Eni, Your <br /><span className="text-primary">AI Partner</span>
                </h2>
                <div className="space-y-4 max-w-md mx-auto lg:mx-0">
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Guest Name</Label>
                    <Input
                      placeholder="e.g., Olumide"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="h-12 bg-background border-border/40 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Event Reference</Label>
                    <Input
                      placeholder="e.g., The Grand Reunion"
                      value={demoEventName}
                      onChange={(e) => setDemoEventName(e.target.value)}
                      className="h-12 bg-background border-border/40 rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateEni}
                    disabled={isGeneratingEni || !guestName || !demoEventName}
                    className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20 mt-2 active:scale-[0.98] transition-all"
                  >
                    {isGeneratingEni ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Experience Eni
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-6 md:py-10 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground text-balance leading-tight mb-8">Loved by Planners & Hosts</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <Card key={i} className="bg-secondary/20 border-2 border-accent shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col rounded-2xl overflow-hidden group">
                  <CardHeader className="flex-1 p-6">
                    <Quote className="h-6 w-6 text-primary/40 mb-3" />
                    <p className="text-base italic leading-relaxed text-foreground/90 font-body">&quot;{t.quote}&quot;</p>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-3 p-6 border-t border-border/10 mt-auto bg-muted/30">
                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                      <AvatarImage src={t.avatar} alt={t.author} />
                      <AvatarFallback>{t.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-bold text-xs tracking-tight">{t.author}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{t.role}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-6 md:py-10 border-t border-border/40 bg-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground text-balance leading-tight mb-10">Subscription Plans</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto items-stretch">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn(
                  "flex flex-col transition-all duration-300 relative border border-border/40 rounded-[1.5rem] overflow-visible",
                  tier.isPopular ? "border-primary/50 ring-1 ring-primary/20 shadow-xl scale-105 z-10 bg-background" : "hover:scale-[1.02] bg-background/40 shadow-sm"
                )}>
                  {tier.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="rounded-full shadow-md px-4 py-1 font-bold uppercase tracking-widest text-[9px] whitespace-nowrap border-2 border-background bg-primary text-primary-foreground">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="pt-8 pb-4 px-6 text-center">
                    <CardTitle className="font-headline text-xl font-bold">{tier.name}</CardTitle>
                     <div className="flex items-baseline justify-center gap-1 mt-2">
                      <p className="text-3xl font-bold font-headline">{tier.price}</p>
                    </div>
                    <CardDescription className="min-h-[40px] text-[10px] mt-2 leading-relaxed font-medium font-body">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 px-6">
                    <ul className="space-y-3 pt-4 border-t border-border/10">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground font-body text-left">
                          <CircleCheck className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6">
                     <Button className="w-full font-bold rounded-xl h-10 shadow-inner transition-all active:scale-[0.97]" variant={tier.isPopular ? "default" : "outline"}>
                        Select Path
                     </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-8 md:py-12 relative overflow-hidden bg-muted/30 border-t border-border/40 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-headline font-bold md:text-7xl text-foreground text-balance leading-[1.1] mb-8">
              Your Event, <br className="hidden md:block" /> <span className="italic font-logo text-primary">Reimagined.</span>
            </h2>
            <Button asChild size="lg" className="font-bold shadow-xl h-14 px-10 text-lg group rounded-[1.5rem] active:scale-[0.98] transition-all">
              <Link href="/signup">
                Start Planning Now <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}