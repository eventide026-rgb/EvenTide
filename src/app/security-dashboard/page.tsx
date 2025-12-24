
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';

// Sample data - in a real app, this would be fetched from Firestore based on the user's assignments
const assignedEvents = [
    {
        id: 'evt_123',
        name: "Adebayo & Funke's Wedding",
        date: "2024-12-15",
    },
    {
        id: 'evt_456',
        name: "Lagos Tech Summit 2024",
        date: "2024-11-02",
    }
];

export default function SecurityEventSelectionPage() {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <Card>
                <CardHeader className="text-center items-center">
                    <Shield className="h-12 w-12 text-primary" />
                    <CardTitle className="text-3xl font-headline pt-2">Security Assignments</CardTitle>
                    <CardDescription>Select the event you are currently working at to activate the scanner.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {assignedEvents.map(event => (
                        <Card key={event.id} className="p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">{event.name}</h3>
                                <p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                            <Button asChild>
                                <Link href={`/security-dashboard/${event.id}/activate`}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Activate Scanner
                                </Link>
                            </Button>
                        </Card>
                    ))}
                     {assignedEvents.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">You have no event assignments.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
