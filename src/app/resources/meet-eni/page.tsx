
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Bot, Brush, ChefHat, LayoutGrid, Sparkles, Users, Quote, PenTool, Zap } from "lucide-react";

const eniCapabilities = [
    {
        persona: "Creative & Communications Director",
        description: "Eni handles the creative heavy-lifting, ensuring every piece of event communication is beautiful, poetic, and culturally resonant.",
        features: [
            {
                icon: <Brush className="h-6 -6 text-primary" />,
                title: "The Invitation Designer",
                details: "Eni analyzes your event theme and colors to generate a stunning, unique, and culturally relevant background for your invitation cards and digital stationery."
            },
            {
                icon: <BookOpen className="h-6 w-6 text-primary" />,
                title: "The Wordsmith",
                details: "From crafting poetic and celebratory invitation text to writing personalized welcome messages for guests, Eni ensures your event's tone is just right."
            }
        ]
    },
    {
        persona: "Editor-in-Chief",
        description: "After the confetti settles, Eni helps you tell the story of your event, transforming memories into a shareable, digital legacy.",
        features: [
            {
                icon: <Bot className="h-6 w-6 text-primary" />,
                title: "The Content Curator",
                details: "Eni can automatically generate a draft article for the EvenTide Community Magazine by summarizing the highlights of recent public events."
            },
            {
                icon: <LayoutGrid className="h-6 w-6 text-primary" />,
                title: "The Photo Editor",
                details: "Eni analyzes all photos uploaded by guests, identifies a visual theme, and curates a beautiful, cohesive gallery that tells your event's story."
            }
        ]
    },
    {
        persona: "Logistics & Planning Expert",
        description: "Eni is your trusted partner for the intricate details, providing intelligent suggestions to make your planning process smoother.",
        features: [
            {
                icon: <ChefHat className="h-6 w-6 text-primary" />,
                title: "The Menu Planner",
                details: "Based on your chosen cuisine style and dietary notes, Eni can generate a full, multi-course menu draft for your caterers to review."
            },
            {
                icon: <Users className="h-6 w-6 text-primary" />,
                title: "The Seating Hostess",
                details: "Eni can create an intelligent seating chart draft, following social etiquette and placement rules to ensure your guests have a wonderful experience."
            },
             {
                icon: <Sparkles className="h-6 w-6 text-primary" />,
                title: "The Mood Board Creative",
                details: "Analyze a mood board of your event's visual theme, and Eni will suggest new, complementary items to add, helping you refine your aesthetic."
            }
        ]
    }
]

const voiceTraits = [
    {
        title: "Poetic & Celebratory",
        description: "Eni avoids dry, functional text. Whether she's writing an invitation or a welcome note, her prose is evocative, uplifting, and celebratory of human connection.",
        icon: <Quote className="h-5 w-5 text-accent" />
    },
    {
        title: "Culturally Resonant",
        description: "Deeply rooted in Nigerian and African richness, Eni understands the importance of heritage, using language that is both sophisticated and culturally relevant.",
        icon: <PenTool className="h-5 w-5 text-accent" />
    },
    {
        title: "Role-Adaptive",
        description: "Eni shifts her 'voice' to fit the task. She can be your warm event hostess, your world-class executive chef, or your meticulous logistical coordinator.",
        icon: <Zap className="h-5 w-5 text-accent" />
    }
]

export default function MeetEniPage() {
    return (
        <div className="bg-secondary py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <Sparkles className="h-12 w-12 text-accent" />
                    </div>
                    <h1 className="text-4xl font-headline font-bold md:text-5xl">Meet Eni, The AI Soul of EvenTide</h1>
                    <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
                        Eni is more than just an algorithm. It's a sophisticated creative partner designed to bring intelligence, efficiency, and a touch of Nigerian poetic flair to your event planning experience.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">
                    {voiceTraits.map((trait) => (
                        <Card key={trait.title} className="bg-background/50 border-accent/20">
                            <CardHeader className="flex-row items-center gap-3">
                                {trait.icon}
                                <CardTitle className="text-xl font-headline">{trait.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground leading-relaxed">{trait.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                <div className="space-y-12 max-w-4xl mx-auto">
                    {eniCapabilities.map((capability) => (
                        <Card key={capability.persona} className="bg-background/30 border-border/50 backdrop-blur-sm shadow-xl">
                            <CardHeader>
                                <CardTitle className="text-3xl font-headline">{capability.persona}</CardTitle>
                                <CardDescription className="text-base">{capability.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {capability.features.map((feature) => (
                                     <div key={feature.title} className="flex items-start gap-4">
                                        <div className="bg-primary/10 p-3 rounded-full flex-shrink-0">
                                            {feature.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{feature.title}</h3>
                                            <p className="text-muted-foreground">{feature.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                 <Card className="max-w-4xl mx-auto mt-12 bg-primary/10 border-primary/20">
                    <CardContent className="p-8 text-center text-xl font-medium text-foreground/80 leading-relaxed">
                        <p>Eni is woven into the fabric of EvenTide, acting as a tireless, creative, and intelligent partner, allowing you to focus on what you do best: creating unforgettable moments.</p>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
