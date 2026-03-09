'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, Send, X, MessageCircle, Loader2 } from 'lucide-react';
import { askEniAssistant } from '@/ai/flows/eni-guest-assistant';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Message = {
    role: 'user' | 'eni';
    text: string;
};

export function EniAssistantChat({ eventId, guestId, guestName }: { eventId: string, guestId: string, guestName: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'eni', text: `Greetings, ${guestName}. I am Eni. How may I assist you in enjoying this beautiful celebration today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            const result = await askEniAssistant({
                eventId,
                guestId,
                guestName,
                question: userMsg
            });
            setMessages(prev => [...prev, { role: 'eni', text: result.answer }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'eni', text: "I apologize, but my creative circuits encountered a brief pause. Please try asking me again in a moment." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 p-0 transition-all duration-500",
                    isOpen ? "rotate-90 scale-90" : "hover:scale-110"
                )}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6 text-accent animate-pulse" />}
            </Button>

            {/* Chat Window */}
            <div className={cn(
                "fixed bottom-24 right-6 w-[calc(100vw-3rem)] sm:w-96 z-50 transition-all duration-500 origin-bottom-right",
                isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"
            )}>
                <Card className="border-none shadow-2xl bg-background/80 backdrop-blur-xl overflow-hidden ring-1 ring-primary/20">
                    <CardHeader className="bg-primary/5 border-b py-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-sm font-headline font-bold">Ask Eni</CardTitle>
                                <p className="text-[10px] uppercase font-bold tracking-widest text-primary opacity-70">Your AI Hostess</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-80 p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.map((msg, i) => (
                                    <div key={i} className={cn(
                                        "flex gap-3",
                                        msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                                    )}>
                                        <Avatar className="h-8 w-8 flex-shrink-0">
                                            {msg.role === 'eni' ? (
                                                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-[10px]">ENI</AvatarFallback>
                                            ) : (
                                                <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">{guestName[0]}</AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className={cn(
                                            "rounded-2xl px-4 py-2 text-sm leading-relaxed",
                                            msg.role === 'user' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none text-foreground/90"
                                        )}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                        </div>
                                        <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2">
                                            <span className="flex gap-1">
                                                <span className="animate-bounce">.</span>
                                                <span className="animate-bounce delay-75">.</span>
                                                <span className="animate-bounce delay-150">.</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-4 bg-muted/30 border-t flex gap-2">
                            <Input 
                                placeholder="Where is my seat?" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                className="rounded-xl border-none shadow-inner bg-background/50 h-10"
                            />
                            <Button 
                                size="icon" 
                                className="rounded-xl h-10 w-10 flex-shrink-0"
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
