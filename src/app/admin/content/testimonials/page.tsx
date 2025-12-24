
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TestimonialsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Testimonials</CardTitle>
        <CardDescription>Review, approve, or reject user-submitted testimonials for public display.</CardDescription>
      </CardHeader>
      <CardContent>
         <p className="text-muted-foreground text-center py-16">Testimonial moderation queue will be here.</p>
      </CardContent>
    </Card>
  );
}
