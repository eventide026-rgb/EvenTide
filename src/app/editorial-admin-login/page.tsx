
import { LoginForm } from "@/components/auth/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function EditorialAdminLoginPage() {
  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader className="items-center">
        <BookOpen className="h-12 w-12 text-primary" />
        <CardTitle className="text-2xl font-headline pt-4">Editorial Admin Login</CardTitle>
        <CardDescription>
          Access the magazine curation workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm loginType="Editorial Admin"/>
         <div className="mt-4 text-center text-sm">
          Not an Editorial Admin?{" "}
          <Link href="/" className="underline text-primary">
            Return to homepage
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
