import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center py-12 sm:px-6 lg:px-8">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
