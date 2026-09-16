import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { Sidebar } from "@/components/sidebar";
import { MockModeBanner } from "@/components/mock-banner";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return (
    <div className="flex min-h-screen gap-4 p-4">
      <Sidebar email={user.email} />
      <main className="flex min-w-0 flex-1 flex-col gap-4">
        <MockModeBanner />
        {children}
      </main>
    </div>
  );
}