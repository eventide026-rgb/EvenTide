import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, Mail, QrCode, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

const features = [
  {
    icon: <Mail className="h-8 w-8 text-primary" />,
    title: "AI Invitation Design",
    description: "Eni, our AI, dynamically generates beautiful invitation cards that reflect your event's theme and colors.",
  },
  {
    icon: <QrCode className="h-8 w-8 text-primary" />,
    title: "Secure GatePass System",
    description: "Generate unique QR codes for each guest, ensuring a secure and seamless check-in experience.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Event Chat Rooms",
    description: "Engage with your team and guests in event-specific chat rooms for seamless communication.",
  },
  {
    icon: <Calendar className="h-8 w-8 text-primary" />,
    title: "Dynamic Event Creation",
    description: "Easily create and manage your events. Our system handles the rest, from calendar updates to countdowns.",
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Real-time Announcements",
    description: "Instantly broadcast important announcements to all your event attendees with a single click.",
  },
];

const getImage = (id: string) => {
  return PlaceHolderImages.find((img) => img.id === id);
};

export default function Home() {
  const heroImage = getImage("eventHall");
  const africanPartyImage1 = getImage("africansFun1");
  const africanPartyImage2 = getImage("africansFun2");
  const gardenPartyImage = getImage("gardenParty");
  const invitationCardImage = getImage("invitationCard");
  const qrCodePassImage = getImage("qrCodePass");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">
        <section className="relative w-full h-[60vh] md:h-[80vh] text-white">
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
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center bg-black bg-opacity-50 p-4">
            <h1 className="text-4xl font-headline font-extrabold tracking-tight md:text-6xl lg:text-7xl text-shadow-lg">
              EvenTide
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl font-body">
              Your Event, Reimagined. AI-powered event management for unforgettable experiences.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                <Link href="/signup">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">
                  Owner Login
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold md:text-4xl text-foreground">
                Everything You Need, All in One Place
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                From AI-driven design to secure check-ins, EvenTide provides a robust suite of tools to make your event a success.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="bg-card hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center gap-4 pb-4">
                    {feature.icon}
                    <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="gallery" className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-headline font-bold md:text-4xl text-secondary-foreground">
                An Event Magazine
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                Showcasing beautiful moments from events powered by EvenTide.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="grid gap-4">
                {africanPartyImage1 && (
                  <div className="overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={africanPartyImage1.imageUrl}
                      alt={africanPartyImage1.description}
                      width={400}
                      height={600}
                      className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
                      data-ai-hint={africanPartyImage1.imageHint}
                    />
                  </div>
                )}
                {gardenPartyImage && (
                  <div className="overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={gardenPartyImage.imageUrl}
                      alt={gardenPartyImage.description}
                      width={400}
                      height={400}
                      className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
                      data-ai-hint={gardenPartyImage.imageHint}
                    />
                  </div>
                )}
              </div>
              <div className="grid gap-4">
                {invitationCardImage && (
                  <div className="overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={invitationCardImage.imageUrl}
                      alt={invitationCardImage.description}
                      width={400}
                      height={400}
                      className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
                      data-ai-hint={invitationCardImage.imageHint}
                    />
                  </div>
                )}
                {africanPartyImage2 && (
                  <div className="overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={africanPartyImage2.imageUrl}
                      alt={africanPartyImage2.description}
                      width={400}
                      height={600}
                      className="h-auto w-full object-cover transition-transform duration-300 hover:scale-105"
                      data-ai-hint={africanPartyImage2.imageHint}
                    />
                  </div>
                )}
              </div>
               <div className="grid gap-4 col-span-2 md:col-span-2">
                 {qrCodePassImage && (
                  <div className="overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={qrCodePassImage.imageUrl}
                      alt={qrCodePassImage.description}
                      width={800}
                      height={533}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      data-ai-hint={qrCodePassImage.imageHint}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-headline font-bold md:text-4xl text-foreground">
              Ready to Create an Unforgettable Event?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join EvenTide today and experience the future of event management.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
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
