'use client';

import { useState } from 'react';
import { type MagazineCurationOutput } from '@/ai/flows/curate-community-magazine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type MagazinePreviewProps = {
  draft: MagazineCurationOutput;
};

export function MagazinePreview({ draft: initialDraft }: MagazinePreviewProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof MagazineCurationOutput, value: string) => {
    setDraft(prev => ({ ...prev!, [field]: value }));
  };

  const handleSummaryChange = (index: number, value: string) => {
     setDraft(prev => {
        const newSummaries = [...prev!.eventSummaries];
        newSummaries[index].summary = value;
        return { ...prev!, eventSummaries: newSummaries };
    });
  }

  const handleSave = () => {
    setIsSaving(true);
    // Here you would typically save the draft to Firestore
    console.log('Saving draft:', draft);
    setTimeout(() => {
        toast({
            title: 'Draft Saved',
            description: 'Your changes have been saved successfully.',
        });
        setIsSaving(false);
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issueTitle">Issue Title</Label>
            <Input
              id="issueTitle"
              value={draft.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-lg font-bold"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="introduction">Editor's Introduction</Label>
            <Textarea
              id="introduction"
              value={draft.introduction}
              onChange={(e) => handleInputChange('introduction', e.target.value)}
              rows={5}
              className="leading-relaxed"
            />
          </div>
        </CardContent>
      </Card>

      {draft.eventSummaries.map((event, index) => (
        <Card key={event.eventName}>
          <CardHeader>
            <CardTitle>{event.eventName}</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-2">
                <Label htmlFor={`summary-${index}`}>Event Summary</Label>
                <Textarea
                    id={`summary-${index}`}
                    value={event.summary}
                    onChange={(e) => handleSummaryChange(index, e.target.value)}
                    rows={4}
                />
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="bg-muted/30">
         <CardHeader>
            <CardTitle>Internal Advertisement</CardTitle>
            <CardDescription>Generated ad concept for this issue.</CardDescription>
         </CardHeader>
         <CardContent>
            <p className="font-semibold text-primary">{draft.advertisement.product}</p>
            <p className="text-muted-foreground italic">&quot;{draft.advertisement.concept}&quot;</p>
         </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Save as Draft</Button>
         <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSaving ? "Publishing..." : "Approve & Publish"}
         </Button>
      </div>
    </div>
  );
}
