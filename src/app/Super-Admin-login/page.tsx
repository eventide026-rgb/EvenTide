import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function SuperAdminLoginPage() {
  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Super Admin Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the master control panel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
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
