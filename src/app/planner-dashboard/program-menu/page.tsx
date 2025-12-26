
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, ChefHat } from 'lucide-react';

export default function ProgramMenuHubPage() {
  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Program & Menu</h1>
            <p className="text-muted-foreground">Orchestrate the event's schedule and culinary experience.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Program Planner</CardTitle>
                    <CardDescription>Build the event's schedule, add notes for the MC, and get AI-powered drafts.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                    <Button asChild>
                        <Link href="/planner-dashboard/program-menu/program-planner">Go to Program Planner</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ChefHat /> Menu Planner</CardTitle>
                    <CardDescription>Design the menu course by course, detail each dish, and get AI-generated ideas.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow flex items-end">
                    <Button asChild>
                        <Link href="/planner-dashboard/program-menu/menu-planner">Go to Menu Planner</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
