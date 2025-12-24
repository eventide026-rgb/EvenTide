
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function CreateEventPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-headline">Create New Event</CardTitle>
        <CardDescription>A multi-step wizard to guide you through creating your event.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground py-16">The Event Creation Wizard will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
