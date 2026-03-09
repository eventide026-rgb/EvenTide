
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/layout/logo';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const signUpHref = redirectTo ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : '/signup';

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="items-center">
        <Link href="/">
          <Logo />
        </Link>
        <CardTitle className="text-2xl font-headline pt-4">Welcome Back</CardTitle>
        <CardDescription>Sign in to manage your events.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href={signUpHref} className="underline text-primary">
            Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
