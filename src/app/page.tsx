
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarPlus,
  ShieldCheck,
  Sparkles,
  Users,
  CircleCheck,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EniDemo } from '@/components/ai/eni-demo';

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
        slug: "starter",
        name: "Free Starter",
        price: "₦0",
        description: "The boutique entrance for intimate gatherings.",
        features: ["Up to 20 Guests", "Basic Digital Registry", "Standard Validation"],
        isPopular: false,
        buttonText: "Get Started"
    },
    {
        slug: "basic",
        name: "Basic Hub",
        price: "₦10,000",
        description: "Professional orchestration for growing events.",
        features: ["Up to 100 Guests", "Team Collaboration (Co-hosts)", "Standard Analytics"],
        isPopular: false,
        buttonText: "Choose Basic Hub"
    },
    {
        slug: "standard",
        name: "Standard Flow",
        price: "₦25,000",
        description: "The ecosystem benchmark for flawless planning.",
        features: ["Up to 250 Guests", "Full Marketplace Integration", "Advanced Budget Ledger"],
        isPopular: true,
        buttonText: "Choose Standard Flow"
    },
    {
        slug: "premium",
        name: "Premium Edge",
        price: "₦50,000",
        description: "AI-enhanced legacy building and reporting.",
        features: ["Up to 500 Guests", "Eni AI Stationery Studio", "AI-curated Magazine", "Live Reporting"],
        isPopular: false,
        buttonText: "Choose Premium Edge"
    },
    {
        slug: "enterprise",
        name: "Enterprise Elite",
        price: "₦100,000",
        description: "Maximum scale for grand galas.",
        features: ["Up to 5,000 Guests", "White-labeling & Custom Branding", "Dedicated Technical Concierge"],
        isPopular: false,
        buttonText: "Choose Enterprise Elite"
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
        <section className="relative w-full h-[90vh] text-white flex items-start justify-center overflow-visible pt-28 md:pt-36">
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
          {/* Gradient overlay creates the 'flow onto lower element' effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-background"></div>
          
          <div className="relative z-10 container mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-headline font-extrabold tracking-tight leading-[1.1] text-balance">
              Plan Your Event
              <br />
              <span className="bg-gradient-to-r from-[#60A5FA] to-[#FDE047] text-transparent bg-clip-text transition-all duration-500">
                {rotatingWords[currentIndex]}
              </span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto text-base md:text-lg font-body text-white/90 leading-relaxed text-balance">
              Welcome to EvenTide, your AI-powered partner for flawless event management. From intimate gatherings to grand galas, we bring your vision to life with intuitive tools and expert assistance.
            </p>
          </div>

          {/* Glassy Buttons - Slimmed down */}
          <div className="absolute bottom-0 left-0 right-0 z-30 translate-y-1/2 flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
              <Button asChild size="lg" className="font-bold w-full max-w-56 sm:w-auto h-11 px-8 text-base rounded-full shadow-2xl bg-primary/80 backdrop-blur-xl border border-white/20 hover:bg-primary transition-all active:scale-[0.98]">
                <Link href="/signup">
                  Create an Event <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="font-bold bg-white/10 border-white/20 backdrop-blur-xl hover:bg-primary hover:text-primary-foreground hover:border-primary w-full max-w-56 sm:w-auto h-11 px-8 text-base rounded-full text-white shadow-xl active:scale-[0.98] transition-all">
                <Link href="/guest-login">
                  I am a Guest
                </Link>
              </Button>
          </div>
        </section>

        {/* AI Demo Section */}
        <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-background relative border-b border-border/40">
            <div className="container mx-auto px-4 text-center">
                <EniDemo />
            </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-12 md:py-16 bg-secondary/30 relative border-b border-border/40">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground text-balance">How It Works</h2>
                <p className="mt-4 text-lg text-muted-foreground text-balance font-body max-w-2xl mx-auto">
                    Our platform streamlines the sophisticated event journey into four logical, manageable phases.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto text-left">
                <div className="lg:col-span-5">
                    {processImage && (
                        <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden shadow-2xl border border-border/40 group">
                            <Image src={processImage.imageUrl} alt={processImage.description} fill className="object-cover group-hover:scale-105 transition-transform duration-1000" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                    )}
                </div>
                <div className="lg:col-span-7">
                    <div className="grid gap-4 sm:grid-cols-2">
                    {howItWorksSteps.map((step, index) => (
                        <Card key={index} className="border-2 border-accent bg-background/80 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all duration-300 rounded-3xl overflow-hidden">
                        <CardHeader className="items-start pb-2">
                            <div className="mb-4 bg-primary/5 p-4 rounded-2xl">
                            {step.icon}
                            </div>
                            <CardTitle className="font-headline text-xl font-bold">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed font-body">
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
        <section id="vision" className="py-12 md:py-16 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight text-balance">Bringing People Together, <br/><span className="text-primary font-logo">Beautifully.</span></h2>
                <p className="mt-4 text-lg text-muted-foreground font-body text-balance max-w-2xl mx-auto">
                    Transforming gatherings into narrative masterpieces through poetic precision and technical harmony.
                </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
              <div className="flex justify-center order-2 lg:order-1">
                <div className="relative w-full max-w-[400px] aspect-square rounded-[3rem] overflow-hidden shadow-2xl ring-8 ring-secondary/20 transition-all duration-500 hover:scale-105">
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
                  <div className="absolute bottom-10 left-0 right-0 text-center px-4">
                    <p className="text-white font-logo text-2xl font-bold italic tracking-tight drop-shadow-md">"The Poetic Soul of Planning"</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 order-1 lg:order-2">
                {[
                    { title: "Empowerment", desc: "Intuitive tools that put the creator in control of every detail." },
                    { title: "Storytelling", desc: "Every celebration is a narrative; we help you archive it forever." },
                    { title: "Innovation", desc: "Leveraging cutting-edge AI to redefine what's possible." },
                    { title: "Connection", desc: "Building a community where culture and technology converge." }
                  ].map((item, i) => (
                    <Card key={i} className="bg-secondary/20 border-none shadow-sm hover:-translate-y-3 hover:shadow-xl transition-all duration-500 group rounded-2xl overflow-hidden">
                      <CardContent className="p-6 text-left">
                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors font-headline">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed mt-1 font-body">{item.desc}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-12 md:py-16 bg-muted/20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground text-balance">Loved by Planners & Hosts</h2>
                <p className="mt-4 text-lg text-muted-foreground font-body max-w-2xl mx-auto text-center">Hear from the community that brings EvenTide to life.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {testimonials.map((t, i) => (
                <Card key={i} className="bg-background border-2 border-accent shadow-xl flex flex-col rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  <CardHeader className="flex-1 p-8 text-center">
                    <Quote className="h-10 w-10 text-primary/20 mb-6 mx-auto" />
                    <p className="text-lg italic leading-relaxed text-foreground/90 font-body">&quot;{t.quote}&quot;</p>
                  </CardHeader>
                  <CardFooter className="flex items-center gap-4 p-8 border-t border-border/10 bg-muted/30">
                    <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                      <AvatarImage src={t.avatar} alt={t.author} />
                      <AvatarFallback>{t.author[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-bold text-base tracking-tight">{t.author}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{t.role}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 md:py-16 border-t border-border/40 bg-background">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-headline font-bold text-foreground text-balance">Pricing Plans for Every Event</h2>
                <p className="mt-4 text-lg text-muted-foreground font-body max-w-2xl mx-auto text-balance text-center">Choose the perfect plan that fits the scale of your event.</p>
            </div>
            
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto items-stretch">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn(
                  "flex flex-col transition-all duration-500 relative border border-border/40 rounded-[2.5rem] overflow-visible",
                  tier.isPopular ? "border-primary/50 ring-1 ring-primary/20 shadow-2xl scale-105 z-10 bg-background" : "hover:scale-[1.02] bg-background/40 shadow-sm"
                )}>
                  {tier.isPopular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                      <div className="rounded-full shadow-lg px-6 py-2 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap border-2 border-background bg-primary text-primary-foreground">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <CardHeader className="pt-12 pb-6 px-8 text-center">
                    <CardTitle className="font-headline text-xl font-bold line-clamp-1">{tier.name}</CardTitle>
                     <div className="flex items-baseline justify-center gap-1 mt-4">
                      <p className="text-3xl font-bold font-headline">{tier.price}</p>
                    </div>
                    <CardDescription className="mt-4 leading-relaxed font-medium font-body text-xs min-h-[3rem]">{tier.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 px-6 text-left">
                    <ul className="space-y-3 pt-6 border-t border-border/10">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground font-body">
                          <CircleCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-6">
                     <Button asChild className="w-full font-bold rounded-2xl h-12 shadow-lg transition-all active:scale-[0.97]" variant={tier.isPopular ? "default" : "outline"}>
                        <Link href={`/checkout?plan=${tier.slug}`}>
                            {tier.buttonText}
                        </Link>
                     </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 relative overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-headline font-bold md:text-7xl text-balance leading-[1.1] mb-10 text-center">
              Your Event, <br className="hidden md:block" /> <span className="italic font-logo text-accent">Reimagined.</span>
            </h2>
            <div className="flex justify-center">
                <Button asChild size="lg" variant="secondary" className="font-bold shadow-2xl h-16 px-12 text-xl group rounded-full active:scale-[0.98] transition-all">
                <Link href="/signup">
                    Start Planning Now <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
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
