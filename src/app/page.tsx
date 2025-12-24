
'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  CheckCircle,
  Home as HomeIcon,
  Palette,
  ShieldCheck,
  Ticket,
  Users,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { generateWelcomeMessage } from '@/ai/flows/ai-welcome-message';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const rotatingWords = ['Effortlessly', 'Stylishly', 'Beautifully', 'Perfectly'];

const howItWorks = [
  {
    icon: <CalendarPlus className="h-8 w-8 text-primary" />,
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
    icon: <CalendarCheck className="h-8 w-8 text-primary" />,
    title: '4. Execute Flawlessly',
    description: 'Use our tools for secure check-ins, real-time announcements, and seamless day-of coordination.',
  },
];

const testimonials = [
  {
    quote: 'EvenTide transformed how we manage our annual conference. The AI features are a game-changer!',
    name: 'Tunde Adebayo',
    role: 'Event Owner',
    avatar: 'https://picsum.photos/seed/tunde/100/100',
  },
  {
    quote: 'As a planner, the ability to collaborate with vendors and my team in one place is invaluable. Highly recommended!',
    name: 'Chioma Nwosu',
    role: 'Planner',
    avatar: 'https://picsum.photos/seed/chioma/100/100',
  },
  {
    quote: "The secure gate pass system was incredibly smooth. Our guests felt safe and the check-in process was lightning fast.",
    name: 'David Okon',
    role: 'Head of Security',
    avatar: 'https://picsum.photos/seed/david/100/100',
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
        features: ["Collaborate with vendors and co-hosts.", "Utilize AI for design and content creation.", "Manage guest lists and communication seamlessly."]
    },
    {
        icon: <Palette className="h-8 w-8 text-primary" />,
        title: "Vendors & Designers",
        features: ["Showcase your portfolio to event owners.", "Receive and manage job invitations.", "Communicate directly with planners."]
    },
    {
        icon: <ShieldCheck className="h-8 w-8 text-primary" />,
        title: "Guests & Security",
        features: ["Receive personalized digital invitations.", "Securely check-in with a unique QR code.", "Stay updated with real-time announcements."]
    }
];

const pricingTiers = [
    {
        name: "Free",
        price: "₦0",
        period: "/month",
        guestCapacity: "Up to 50 Guests",
        features: ["1 Event", "Basic AI Design", "Guest List Management"],
        isPopular: false,
    },
    {
        name: "Standard",
        price: "₦25,000",
        period: "/month",
        guestCapacity: "Up to 300 Guests",
        features: ["5 Events", "Advanced AI Design", "Team Collaboration", "Vendor Marketplace"],
        isPopular: true,
    },
    {
        name: "Gold",
        price: "₦75,000",
        period: "/month",
        guestCapacity: "Up to 1000 Guests",
        features: ["Unlimited Events", "Full AI Suite", "Priority Support", "Advanced Analytics"],
        isPopular: false,
    },
    {
        name: "Platinum",
        price: "Contact Us",
        period: "",
        guestCapacity: "Enterprise Scale",
        features: ["Custom Solutions", "Dedicated Account Manager", "White-labeling Options", "API Access"],
        isPopular: false,
    }
]

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};

export default function Home() {
  const heroImage = getImage('eventHall');
  const partyTableImage = getImage('nigerianPartyTable');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [eventType, setEventType] = useState('Wedding');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % rotatingWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateText = async () => {
    setIsLoading(true);
    setGeneratedMessage('');
    try {
      const result = await generateWelcomeMessage({
        guestName: 'Alex',
        eventName: `a ${eventType}`,
      });
      setGeneratedMessage(result.message);
    } catch (error) {
      console.error('Error generating welcome message:', error);
      setGeneratedMessage('Sorry, I had trouble generating a message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center p-4">
            <h1 className="text-4xl font-headline font-extrabold tracking-tight md:text-6xl lg:text-7xl text-shadow-lg leading-tight">
              Plan Your Event
              <br />
              <span className="text-primary transition-all duration-300">
                {rotatingWords[currentIndex]}
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl font-body text-white/90">
              Welcome to EvenTide, your AI-powered partner for flawless event management. From intimate gatherings to grand galas, we bring your vision to life with intuitive tools and expert assistance.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="font-bold">
                <Link href="/signup">
                  Create an Event <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/events">
                  Buy Tickets
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold md:text-4xl">How It Works</h2>
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

        {/* Bringing People Together Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="relative max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden">
                {partyTableImage && (
                    <Image
                        src={partyTableImage.imageUrl}
                        alt={partyTableImage.description}
                        fill
                        className="object-cover"
                        data-ai-hint={partyTableImage.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h2 className="text-4xl md:text-5xl font-headline font-bold text-white text-center shadow-lg">
                        Bringing People Together, Beautifully.
                    </h2>
                </div>
            </div>
          </div>
        </section>


        {/* Interactive AI Demo Section */}
        <section id="ai-demo" className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold md:text-4xl">Meet Eni, Your AI Assistant</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Experience the power of AI. Generate a personalized welcome message instantly.
              </p>
            </div>
            <Card className="max-w-2xl mx-auto p-6 sm:p-8">
              <div className="grid sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2 space-y-2">
                   <Label htmlFor="eventType">Event Type</Label>
                   <Select value={eventType} onValueChange={setEventType}>
                    <SelectTrigger id="eventType" className="w-full">
                      <SelectValue placeholder="Select an event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Wedding">Wedding</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Birthday Party">Birthday Party</SelectItem>
                      <SelectItem value="Corporate Gala">Corporate Gala</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleGenerateText} disabled={isLoading} className="w-full">
                  <Wand2 className="mr-2 h-4 w-4" />
                  {isLoading ? 'Generating...' : 'Generate Text'}
                </Button>
              </div>
              <Textarea
                className="mt-4 h-32"
                placeholder="Eni's message will appear here..."
                value={generatedMessage}
                readOnly
              />
            </Card>
          </div>
        </section>

        {/* Social Proof Section */}
        <section id="testimonials" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold md:text-4xl">Loved by Planners & Hosts</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                See what our users are saying about their experience with EvenTide.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="flex flex-col transition-transform transition-shadow duration-300 hover:scale-105 hover:-translate-y-2 hover:shadow-lg">
                  <CardContent className="pt-6 flex-1">
                    <p className="text-muted-foreground italic">&quot;{testimonial.quote}&quot;</p>
                  </CardContent>
                   <CardHeader className="flex-row gap-4 items-center pt-4">
                    <Avatar>
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-bold">{testimonial.name}</CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Role-Based Benefits Section */}
        <section id="benefits" className="py-16 md:py-24 bg-secondary">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-headline font-bold md:text-4xl">A Tool for Everyone on the Team</h2>
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
        <section id="pricing" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold md:text-4xl">Find the Perfect Plan</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Choose the plan that fits your needs, from small gatherings to large-scale enterprise events.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 items-end">
              {pricingTiers.map((tier) => (
                <Card key={tier.name} className={cn(
                  "flex flex-col transition-transform transition-shadow duration-300 hover:scale-105 hover:shadow-2xl", 
                  tier.isPopular && "border-primary ring-2 ring-primary shadow-lg hover:shadow-accent/20"
                )}>
                  {tier.isPopular && <Badge className="absolute -top-3 right-4">Popular</Badge>}
                  <CardHeader>
                    <CardTitle className="font-headline text-xl">{tier.name}</CardTitle>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                    </div>
                    <CardDescription>{tier.guestCapacity}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardContent>
                     <Button className="w-full" variant={tier.isPopular ? "default" : "outline"}>
                        {tier.price === "Contact Us" ? "Contact Sales" : "Get Started"}
                     </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-headline font-bold md:text-4xl text-foreground">
              Ready to Create an Unforgettable Event?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join EvenTide today and experience the future of event management.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="font-bold">
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
