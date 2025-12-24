'use client';

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GuestLoginForm } from "@/components/auth/guest-login-form";

export default function GuestLoginPage() {
  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Guest Access</CardTitle>
        <CardDescription>
          Enter your event and guest codes to view the event details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GuestLoginForm />
        <div className="mt-4 text-center text-sm">
          Are you the event host?{" "}
          <Link href="/login" className="underline text-primary">
            Login here
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
