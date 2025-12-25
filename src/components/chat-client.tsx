
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Sparkles, MessageSquare } from 'lucide-react';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';

// Types
type Event = {
  id: string;
  name: string;
  ownerId: string;
};

type FashionContract = {
  id: string;
  designerId: string;
};

type ChatRoom = {
  id: string;
  name: string;
  path: string;
};

type Message = {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: any;
};

const chatFormSchema = z.object({
  text: z.string().min(1, 'Message cannot be empty.'),
});

export function ChatClient() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: { text: '' },
  });

  // Fetch owner's events
  const eventsQuery = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return query(collection(firestore, 'events'), where('ownerId', '==', user.uid));
  }, [firestore, user?.uid]);
  const { data: events, isLoading: isLoadingEvents } = useCollection<Event>(eventsQuery);

  // Fetch contracts for the selected event to build chat rooms
  const contractsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedEventId) return null;
    return query(collection(firestore, 'events', selectedEventId, 'fashionContracts'));
  }, [firestore, selectedEventId]);
  const { data: contracts } = useCollection<FashionContract>(contractsQuery);

  // Dynamically generate chat rooms based on event and contracts
  const chatRooms = useMemo((): ChatRoom[] => {
    if (!selectedEventId) return [];
    const rooms: ChatRoom[] = [
      {
        id: 'main',
        name: 'Main Team Chat',
        path: `events/${selectedEventId}/chat_messages`,
      },
    ];
    if (contracts) {
      contracts.forEach((contract) => {
        // In a real app, you'd fetch the designer's name
        const designerName = `Designer ${contract.designerId.substring(0, 6)}`;
        rooms.push({
          id: contract.id,
          name: `Contract: ${designerName}`,
          path: `events/${selectedEventId}/fashionContracts/${contract.id}/messages`,
        });
      });
    }
    return rooms;
  }, [selectedEventId, contracts]);
  
  useEffect(() => {
    // When rooms change, select the first one by default
    if (chatRooms.length > 0) {
        setSelectedRoom(chatRooms[0]);
    } else {
        setSelectedRoom(null);
    }
  }, [chatRooms]);

  // Fetch messages for the selected room
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedRoom) return null;
    return query(collection(firestore, selectedRoom.path), orderBy('timestamp', 'asc'));
  }, [firestore, selectedRoom]);
  const { data: messages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (values: z.infer<typeof chatFormSchema>) => {
    if (!firestore || !user || !selectedRoom) return;

    const messageData = {
      senderId: user.uid,
      senderName: user.displayName || user.email,
      senderAvatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/40`,
      text: values.text,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(firestore, selectedRoom.path), messageData);
      form.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' });
    }
  };
  
  const handleAskEni = () => {
    const eventName = events?.find(e => e.id === selectedEventId)?.name;
    const starter = `Team, what are our top priorities for the '${eventName || 'event'}' this week?`;
    form.setValue('text', starter);
  }

  const isLoading = isUserLoading || isLoadingEvents;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="grid h-full grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="md:col-span-1 flex flex-col">
        <CardHeader>
          <CardTitle>Chat Rooms</CardTitle>
          <div className="space-y-2 pt-2">
            <Label>Select Event</Label>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Select onValueChange={setSelectedEventId} value={selectedEventId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 space-y-2">
            {selectedEventId && chatRooms.map(room => (
                <Button key={room.id} variant={selectedRoom?.id === room.id ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedRoom(room)}>
                   <MessageSquare className='mr-2 h-4 w-4' /> {room.name}
                </Button>
            ))}
        </CardContent>
      </Card>

      <Card className="md:col-span-3 flex flex-col h-[85vh]">
        <CardHeader>
          <CardTitle>{selectedRoom?.name || 'Chat'}</CardTitle>
          <CardDescription>
            {selectedEventId ? 'Real-time messaging with your team' : 'Select an event to start chatting'}
          </CardDescription>
        </CardHeader>
        <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4">
            {isLoadingMessages ? (
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
                messages?.map(msg => (
                <div key={msg.id} className={cn('flex items-end gap-2', msg.senderId === user?.uid ? 'justify-end' : 'justify-start')}>
                    {msg.senderId !== user?.uid && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.senderAvatar} />
                            <AvatarFallback>{msg.senderName?.[0]}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn('max-w-xs md:max-w-md rounded-lg px-4 py-2', msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                        <p className="text-sm font-bold">{msg.senderName}</p>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.senderId === user?.uid && (
                         <Avatar className="h-8 w-8">
                            <AvatarImage src={msg.senderAvatar} />
                            <AvatarFallback>{msg.senderName?.[0]}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
                ))
            )}
             {!isLoadingMessages && messages?.length === 0 && (
                <div className="text-center text-muted-foreground py-16">
                    No messages yet. Start the conversation!
                </div>
             )}
            </div>
        </ScrollArea>
        <CardContent className="pt-4 border-t">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSendMessage)} className="space-y-4">
               <Button type="button" variant="outline" size="sm" onClick={handleAskEni} disabled={!selectedEventId}>
                    <Sparkles className="mr-2 h-4 w-4" /> Ask Eni for a conversation starter
               </Button>
               <div className='flex gap-2'>
                    <FormField control={form.control} name="text" render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormControl>
                                <Input placeholder="Type your message..." {...field} disabled={!selectedRoom || isSubmitting} autoComplete='off' />
                            </FormControl>
                        </FormItem>
                    )}/>
                    <Button type="submit" disabled={!selectedRoom || isSubmitting}>
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
               </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
