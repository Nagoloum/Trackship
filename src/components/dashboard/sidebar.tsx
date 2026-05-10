import { Logo } from "@/components/logo";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Link } from "@/i18n/navigation";

export function DashboardSidebar() {
  return (
    <aside className="bg-card hidden h-screen w-64 shrink-0 flex-col border-r md:sticky md:top-0 md:flex">
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Logo width={130} height={32} />
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <SidebarNav />
      </div>
    </aside>
  );
}
