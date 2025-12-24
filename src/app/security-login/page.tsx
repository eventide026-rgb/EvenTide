import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SecurityLoginForm } from "@/components/auth/security-login-form";

export default function SecurityLoginPage() {
  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Security Check-in</CardTitle>
        <CardDescription>
          Enter event and security codes to start scanning.
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
