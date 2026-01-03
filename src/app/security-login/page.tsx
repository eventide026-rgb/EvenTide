'use client';
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SecurityLoginForm } from "@/components/auth/security-login-form";
import { Logo } from "@/components/layout/logo";

export default function SecurityLoginPage() {
  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="items-center">
        <Link href="/">
            <Logo />
        </Link>
        <CardTitle className="text-2xl font-headline pt-4">Security Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your event assignments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SecurityLoginForm />
         <div className="mt-4 text-center text-sm">
          Not security?{" "}
          <Link href="/login" className="underline text-primary">
            Login here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
