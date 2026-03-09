
'use client';

import Link from "next/link";
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpForm } from "@/components/auth/signup-form";
import { Logo } from "@/components/layout/logo";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const loginHref = redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login';

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="items-center">
        <Link href="/">
          <Logo />
        </Link>
        <CardTitle className="text-2xl font-headline pt-4">Create an Account</CardTitle>
        <CardDescription>
          Join EvenTide to start planning your perfect event.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignUpForm />
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href={loginHref} className="underline text-primary">
            Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin" />}>
      <SignUpContent />
    </Suspense>
  );
}
