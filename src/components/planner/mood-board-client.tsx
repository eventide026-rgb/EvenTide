
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from 'use-debounce';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { suggestMoodboardItems } from '@/ai/flows/suggest-moodboard-items';

type Event = {
  id: string;
  name: string;
  eventType: string;
};

type MoodboardItem = {
  id: string;
  type: 'image' | 'color' | 'note' | 'aiSuggestion';
  value: string;
  reason?: string;
};

type MoodboardData = {
  items: MoodboardItem[];
};

type MoodBoardClientProps = {
  isReadOnly: boolean;
};

export function MoodBoardClient({ isReadOnly }: MoodBoardClientProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<MoodboardData>({ items: [] });
  const [debouncedBoardData] = useDebounce(boardData, 2000);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [newItem, setNewItem] = useState({ type: 'image' as 'image' | 'color' | 'note', value: '' });

  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  const moodboardDocRef = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return doc(firestore, 'events', selectedEventId, 'moodboard', 'main');
  }, [firestore, selectedEventId]);

  const { data: initialData, isLoading: isLoadingBoard } = useDoc<MoodboardData>(moodboardDocRef);

  useEffect(() => {
    if (initialData) {
      setBoardData(initialData);
    } else {
      setBoardData({ items: [] });
    }
  }, [initialData]);

  useEffect(() => {
    if (JSON.stringify(debouncedBoardData) !== JSON.stringify(initialData)) {
      if (!isReadOnly && moodboardDocRef) {
        const saveChanges = async () => {
          setSaveStatus('saving');
          try {
            await setDoc(moodboardDocRef, debouncedBoardData, { merge: true });
            setSaveStatus('saved');
          } catch (error) {
            console.error('Auto-save failed:', error);
            setSaveStatus('idle');
          }
        };
        saveChanges();
      }
    }
  }, [debouncedBoardData, initialData, isReadOnly, moodboardDocRef]);

  const handleAddItem = () => {
    if (newItem.value.trim() === '') return;
    const newBoardItem: MoodboardItem = {
      id: new Date().toISOString(),
      ...newItem,
    };
    setBoardData(prev => ({ items: [...prev.items, newBoardItem] }));
    setNewItem({ type: 'image', value: '' });
  };
  
  const handleRemoveItem = (id: string) => {
    setBoardData(prev => ({ items: prev.items.filter(item => item.id !== id) }));
  }

  const handleGenerateSuggestions = async () => {
      const currentEvent = events?.find(e => e.id === selectedEventId);
      if (!currentEvent) return;

      setIsGenerating(true);
      try {
        const currentItemsForAI = boardData.items.map(({id, reason, ...rest}) => rest);
        const result = await suggestMoodboardItems({
            eventTheme: currentEvent.eventType,
            currentItems: currentItemsForAI,
        });
        
        const newItems: MoodboardItem[] = result.suggestions.map(s => ({
            id: new Date().toISOString() + Math.random(),
            type: 'aiSuggestion',
            value: s.value,
            reason: s.reason,
        }));
        
        setBoardData(prev => ({items: [...prev.items, ...newItems]}));
        toast({ title: "Eni added new ideas to your board!" });
      } catch (error) {
          console.error(error);
          toast({variant: 'destructive', title: 'AI Suggestion Failed' });
      } finally {
          setIsGenerating(false);
      }
  }

  const isLoading = isLoadingEvents || (selectedEventId && isLoadingBoard);

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-3 h-full">
        <Card className="h-full">
          <CardContent className="p-4 h-full">
            {isLoading ? (
              <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : boardData.items.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {boardData.items.map(item => (
                  <div key={item.id} className="group relative aspect-square">
                    {item.type === 'image' && <Image src={item.value} alt="moodboard item" fill className="object-cover rounded-lg" />}
                    {item.type === 'color' && <div className="h-full w-full rounded-lg" style={{ backgroundColor: item.value }} />}
                    {item.type === 'note' && <div className="h-full w-full rounded-lg bg-yellow-200 p-4 text-yellow-800 flex items-center justify-center text-center">{item.value}</div>}
                    {item.type === 'aiSuggestion' && (
                        <div className="h-full w-full rounded-lg bg-blue-100 p-4 text-blue-800 border-2 border-dashed border-blue-400">
                             <Sparkles className="h-4 w-4 text-blue-500 mb-2" />
                            <p className="font-semibold text-sm">{item.value}</p>
                            <p className="text-xs italic mt-1">&quot;{item.reason}&quot;</p>
                        </div>
                    )}
                    {!isReadOnly && (
                        <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleRemoveItem(item.id)}>
                            <X className="h-4 w-4"/>
                        </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <div>
                  <h3 className="text-xl font-semibold">Your canvas is empty.</h3>
                  <p>Start by selecting an event and adding items.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-1 flex flex-col gap-4">
         <Card>
            <CardHeader><CardTitle>Controls</CardTitle></CardHeader>
            <CardContent className='space-y-4'>
                <div>
                    <Label>Event</Label>
                    <Select onValueChange={setSelectedEventId} value={selectedEventId || ''} disabled={isLoadingEvents}>
                        <SelectTrigger><SelectValue placeholder="Select an Event" /></SelectTrigger>
                        <SelectContent>
                            {events?.map(event => <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                {saveStatus === 'saving' && <span className="text-xs flex items-center gap-1 text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin"/>Saving...</span>}
                {saveStatus === 'saved' && <span className="text-xs flex items-center gap-1 text-green-600"><Save className="h-3 w-3"/>All changes saved</span>}
            </CardContent>
        </Card>
        {!isReadOnly && (
            <Card>
                <CardHeader><CardTitle>Add to Board</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Select value={newItem.type} onValueChange={(v) => setNewItem({type: v as any, value: ''})}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="image">Image URL</SelectItem>
                            <SelectItem value="color">Color</SelectItem>
                            <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                    </Select>
                    {newItem.type === 'color' ? (
                         <Input type="color" value={newItem.value} onChange={(e) => setNewItem({...newItem, value: e.target.value})} className="h-12"/>
                    ) : (
                        <Input value={newItem.value} onChange={(e) => setNewItem({...newItem, value: e.target.value})} placeholder={
                            newItem.type === 'image' ? "https://..." : "Type your note..."
                        } />
                    )}
                    <Button className="w-full" onClick={handleAddItem} disabled={!selectedEventId}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
                </CardContent>
            </Card>
        )}
         {!isReadOnly && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent h-5 w-5"/> AI Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" variant="outline" onClick={handleGenerateSuggestions} disabled={!selectedEventId || isGenerating}>
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isGenerating ? "Eni is thinking..." : "Ask Eni for Ideas"}
                    </Button>
                </CardContent>
             </Card>
         )}
      </div>
    </div>
  );
}
