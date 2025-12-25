
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, ClipboardList } from 'lucide-react';

export default function ContractsTasksHubPage() {
  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Contracts & Tasks</h1>
            <p className="text-muted-foreground">Monitor the operational progress of your events.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileText /> Contract Oversight</CardTitle>
                    <CardDescription>View all vendor contracts and fashion commissions initiated by your planner.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-end">
                    <Button asChild>
                        <Link href="/owner-dashboard/contracts">Monitor Contracts</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ClipboardList /> Task Tracking</CardTitle>
                    <CardDescription>Get a real-time overview of the event's to-do list and progress.</CardDescription>
                </CardHeader>
                 <CardContent className="flex-grow flex items-end">
                    <Button asChild>
                        <Link href="/owner-dashboard/tasks">Track Tasks</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
