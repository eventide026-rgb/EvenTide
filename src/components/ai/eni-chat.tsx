
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileOverview EniChat - A sophisticated AI interaction component.
 * Allows users to send messages to the Eni Brain and receive poetic, celebratory responses.
 */
export function EniChat() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function sendMessage() {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setReply("");
    
    try {
      const res = await fetch("/api/eni", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error("Eni is currently contemplating. Please try again.");
      }

      const data = await res.json();
      setReply(data.reply);
    } catch (error: any) {
      console.error("Eni Chat Error:", error);
      toast({
        variant: "destructive",
        title: "Communication Interrupted",
        description: error.message || "Eni is taking a quick rest. Please try again in a moment.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-none shadow-2xl bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden ring-1 ring-primary/10">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto bg-primary/10 p-3 rounded-2xl w-fit mb-4">
          <Sparkles className="h-6 w-6 text-[#D4AF37]" />
        </div>
        <CardTitle className="text-2xl font-headline font-bold">Ask Eni</CardTitle>
        <CardDescription className="max-w-md mx-auto text-sm">
          Get creative inspiration or coordination help from the AI soul of EvenTide.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Eni about your event theme, menu, or planning..."
            className="rounded-xl h-12 flex-1 border-primary/20 focus-visible:ring-primary shadow-inner"
            disabled={isLoading}
          />
          <Button 
            onClick={sendMessage} 
            disabled={isLoading || !message.trim()}
            className="rounded-xl h-12 px-6 font-bold shadow-lg transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            {isLoading ? "Thinking..." : "Send"}
          </Button>
        </div>

        {reply && (
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-500">
            <p className="text-base italic font-logo text-foreground/90 leading-relaxed">
              &quot;{reply}&quot;
            </p>
            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-primary/10">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">— Eni</p>
                <p className="text-[8px] text-muted-foreground uppercase tracking-tighter">Your Creative Director</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-[#D4AF37]" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
