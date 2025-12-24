"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  eventCode: z.string().min(1, { message: "Event code is required." }),
  securityCode: z.string().min(1, { message: "Security code is required." }),
});

export function SecurityLoginForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventCode: "",
      securityCode: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Mock login logic
    toast({
      title: "Security Access Granted",
      description: "Redirecting to scanner interface...",
    });
    // This should redirect to a security-specific scanner page
    router.push('/security/scanner');
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="eventCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., WEO-O2CAP5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="securityCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Security Code</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Your unique security code" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Start Scanning
        </Button>
      </form>
    </Form>
  );
}
