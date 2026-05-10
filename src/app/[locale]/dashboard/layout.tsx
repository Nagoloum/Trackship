import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Defense in depth: even though the proxy already redirects unauthenticated
  // users, we re-check here so a server component can safely use `user`.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="bg-muted/20 flex min-h-screen">
      <DashboardSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <DashboardTopbar email={user.email ?? ""} />
        <main className="flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
