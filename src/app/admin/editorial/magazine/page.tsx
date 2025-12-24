
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function MagazineCurationPage() {
  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Magazine Curation</h1>
            <p className="text-muted-foreground">The creative workspace for the EvenTide Community Magazine.</p>
        </div>
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <div>
                    <CardTitle>Generate New Issue</CardTitle>
                    <CardDescription>Let Eni, the AI Editor-in-Chief, automatically generate a complete draft.</CardDescription>
                </div>
                <Button>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Draft with AI
                </Button>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-center py-16">The AI-generated magazine draft will appear here for review and editing.</p>
            </CardContent>
        </Card>
    </div>
  );
}
