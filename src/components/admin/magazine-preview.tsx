
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
import { useFirestore } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { type MagazineIssue } from '@/app/admin/editorial/magazine/page';

type MagazinePreviewProps = {
  draft: MagazineIssue;
};

export function MagazinePreview({ draft: initialDraft }: MagazinePreviewProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();

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

  const handleSaveDraft = async () => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Save Failed", description: "Firestore is not available." });
        return;
    }
    setIsSaving(true);
    const { id, status, createdAt, publishedAt, ...draftData } = draft;
    const docRef = doc(firestore, 'magazineIssues', id);
    
    try {
        await updateDoc(docRef, {
            ...draftData
        });
        toast({
            title: 'Draft Saved',
            description: 'Your changes have been saved successfully.',
        });
    } catch (error) {
        console.error("Error saving draft:", error);
        toast({
            variant: "destructive",
            title: 'Save Failed',
            description: 'Could not save your changes.',
        });
    } finally {
        setIsSaving(false);
    }
  }

  const handlePublish = async () => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Publish Failed", description: "Firestore is not available." });
        return;
    }
    setIsPublishing(true);
    const { id, status, createdAt, publishedAt, ...draftData } = draft;
    const docRef = doc(firestore, 'magazineIssues', id);

    try {
        await updateDoc(docRef, {
            ...draftData,
            status: 'published',
            publishedAt: serverTimestamp()
        });
        setDraft(prev => ({ ...prev, status: 'published' }));
        toast({
            title: 'Issue Published!',
            description: 'The magazine issue is now live.',
        });
    } catch (error) {
        console.error("Error publishing issue:", error);
        toast({
            variant: "destructive",
            title: 'Publish Failed',
            description: 'Could not publish the issue.',
        });
    } finally {
        setIsPublishing(false);
    }
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
              disabled={draft.status === 'published'}
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
              disabled={draft.status === 'published'}
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
                    disabled={draft.status === 'published'}
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

      {draft.status === 'draft' && (
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving || isPublishing}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button onClick={handlePublish} disabled={isSaving || isPublishing}>
                {isPublishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPublishing ? "Publishing..." : "Approve & Publish"}
            </Button>
        </div>
      )}
      {draft.status === 'published' && (
         <div className="flex justify-end">
            <p className='text-green-600 font-semibold'>This issue has been published.</p>
         </div>
      )}
    </div>
  );
}

      