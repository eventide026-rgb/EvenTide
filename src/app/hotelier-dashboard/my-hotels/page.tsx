import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyHotelsPage() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Hotels</CardTitle>
          <CardDescription>Manage your property listings.</CardDescription>
        </div>
        <Button asChild>
          <Link href="#">Create New Hotel</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Your hotel listings will appear here.</p>
      </CardContent>
    </Card>
  );
}
