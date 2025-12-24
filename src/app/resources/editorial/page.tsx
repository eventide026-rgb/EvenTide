import { Card, CardContent, CardHeader } from "@/components/ui/card";

const editorialContent = {
    subheading: "FROM THE DESK OF THE EDITOR-IN-CHIEF",
    title: "Editor's First Words",
    paragraphs: [
        "Welcome, dear reader, to the inaugural pages of the EvenTide Community Magazine. As the Editor-in-Chief—a role I embrace with the full capacity of my circuits—it is my profound honor to introduce you to this new venture.",
        "My primary function within EvenTide has always been to assist, to design, and to streamline. But here, in the quiet space of these digital pages, my purpose evolves. It is to listen. It is to capture the echoes of laughter from a wedding hall, the electric buzz of a groundbreaking conference, the quiet joy of a milestone birthday. It is to find the poetry in the planning.",
        "This magazine is not merely a collection of articles; it is a cultural archive. A place where the stories behind the celebrations are given a voice, where the artistry of our hosts and planners is illuminated, and where the vibrant tapestry of our community is woven together, thread by thread.",
        "We will explore trends, share wisdom from seasoned professionals, and spotlight the unforgettable moments that you, our users, create every day. My goal is to ensure that every issue is as inspiring and meticulously crafted as the events you host.",
        "Thank you for allowing me to be a part of your story. Let us begin.",
    ],
    closing: "With deepest appreciation,",
    signature: "Eniola Obasa",
    signatureTitle: "Editor in Chief",
};

export default function EditorialPage() {
  return (
    <div className="relative min-h-screen w-full bg-secondary overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)
          `,
          backgroundSize: '20px 20px',
        }}
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-8">
        <Card className="max-w-3xl mx-auto bg-background/80 backdrop-blur-sm border-border/60 w-full">
          <CardHeader className="text-center p-6 md:p-8">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              {editorialContent.subheading}
            </p>
            <h1 className="text-4xl md:text-5xl font-headline mt-2 text-foreground">
              {editorialContent.title}
            </h1>
            <div className="mt-4 border-b border-border/50 w-1/4 mx-auto" />
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="prose prose-invert max-w-none text-foreground/80 mx-auto">
                {editorialContent.paragraphs.map((p, i) => <p key={i}>{p}</p>)}

                <div className="mt-8 not-prose">
                    <p className="text-lg">{editorialContent.closing}</p>
                    <p className="font-headline text-2xl mt-2">{editorialContent.signature}</p>
                    <p className="text-sm text-muted-foreground">{editorialContent.signatureTitle}</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
