
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function PricingPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing Plan Management</CardTitle>
        <CardDescription>Create, edit, and delete the subscription plans available to event owners.</CardDescription>
      </CardHeader>
      <CardContent>
         <p className="text-muted-foreground text-center py-16">Pricing plan management interface will be here.</p>
      </CardContent>
    </Card>
  );
}
