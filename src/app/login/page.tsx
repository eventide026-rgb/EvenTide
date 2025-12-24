
'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/layout/logo';

export default function LoginPage() {
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
          <Link href="/signup" className="underline text-primary">
            Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
