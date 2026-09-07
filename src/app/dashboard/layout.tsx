import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return (
    <div className="flex min-h-screen gap-4 p-4">
      <Sidebar email={user.email} />
      <main className="min-w-0 flex-1" style={{ maxWidth: "calc(100% - 16rem)" }}>
        {children}
      </main>
    </div>
  );
}