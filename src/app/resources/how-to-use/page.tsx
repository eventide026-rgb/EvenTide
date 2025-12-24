import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, CalendarPlus, Palette, ScanLine, Users } from "lucide-react";

const steps = [
    {
        icon: <CalendarPlus className="h-6 w-6 text-primary flex-shrink-0" />,
        title: "Step 1: Create Your Event",
        content: [
            "Your journey begins in the Event Creation Hub. As an Owner or a designated Planner, you'll provide the essential details for your event: the name, date, time, and venue. This is also where you'll select the two primary colors for your event's theme—for example, Royal Blue and Gold.",
            "Once you submit, Eni, our AI assistant, instantly generates a unique Event Code. This code is the master key to your event, tying everything together from guest invitations to security check-ins."
        ]
    },
    {
        icon: <Palette className="h-6 w-6 text-primary flex-shrink-0" />,
        title: "Step 2: Design Your Stationery",
        content: [
            "With your event created, you'll head to the Invitation Studio. Here, you'll establish a 'master theme' for all your event stationery. Choose from a library of stunning backgrounds, select your preferred fonts, and let Eni work its magic.",
            "Your choices are automatically applied to create a cohesive look for your invitation cards, gate passes, and other digital assets, ensuring a professional and consistent brand identity."
        ]
    },
    {
        icon: <Users className="h-6 w-6 text-primary flex-shrink-0" />,
        title: "Step 3: Build Your Team & Invite Guests",
        content: [
            "Event management is a team sport. From your dashboard, you can easily invite Planners and Co-hosts by searching for their profiles on the EvenTide network. Once they accept, they become part of your event team.",
            "Simultaneously, you'll build your guest list. As you add each attendee, our system automatically generates a unique Guest Code for them. This code, paired with the Event Code, is their personal key to the event."
        ]
    },
    {
        icon: <Briefcase className="h-6 w-6 text-primary flex-shrink-0" />,
        title: "Step 4: Plan, Collaborate, and Hire",
        content: [
            "This is where the detailed planning comes to life. Planners can access the Vendor Marketplace to hire photographers, caterers, and other professionals. Inside the event's workspace, your team will collaborate on the event program, design the menu, and create a seating chart.",
            "All communication happens seamlessly within the integrated chat, keeping conversations organized and accessible to the entire team."
        ]
    },
    {
        icon: <ScanLine className="h-6 w-6 text-primary flex-shrink-0" />,
        title: "Step 5: Execute on Event Day",
        content: [
            "On the day of the event, EvenTide ensures a flawless experience. Security personnel use a dedicated scanner interface to validate guests' digital gate passes. A quick scan of the QR code confirms their identity and grants them access.",
            "Upon successful check-in, guests unlock additional interactive features within their dashboard, such as live photo sharing and real-time announcements. Meanwhile, event managers monitor everything from the Check-in Monitor, which provides live data on guest arrivals and overall event capacity."
        ]
    }
]

export default function HowToUsePage() {
    return (
        <div className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl font-headline font-bold md:text-5xl">How to Use EvenTide</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        A step-by-step guide to planning and executing your perfect event on our platform.
                    </p>
                </div>
                
                <Card className="max-w-4xl mx-auto bg-background/30 border-border/50 backdrop-blur-sm">
                    <CardContent className="p-6 md:p-8">
                         <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                            {steps.map((step, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-left hover:no-underline">
                                        <div className="flex items-start md:items-center gap-4">
                                            {step.icon}
                                            <span className="text-xl font-headline">{step.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pl-12 pt-2">
                                        <div className="space-y-4 text-muted-foreground">
                                            {step.content.map((paragraph, pIndex) => (
                                                <p key={pIndex}>{paragraph}</p>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>

                 <div className="text-center mt-12 max-w-3xl mx-auto">
                    <p className="text-xl md:text-2xl font-bold">
                        From initial idea to the final moment, every aspect of your event is managed smoothly, collaboratively, and with a touch of AI-powered magic.
                    </p>
                </div>

            </div>
        </div>
    )
}
