
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Shield } from "lucide-react";

export default function SuperAdminLoginPage() {
  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="items-center">
        <Shield className="h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-headline pt-4">Super Admin Login</CardTitle>
        <CardDescription>
          Access the platform's command center.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm loginType="Super Admin" />
        <div className="mt-4 text-center text-sm">
          Not a Super Admin?{" "}
          <Link href="/" className="underline text-primary">
            Return to homepage
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
