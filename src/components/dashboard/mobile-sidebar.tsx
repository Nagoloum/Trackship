"use client";

import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";

import { useUiStore } from "@/stores/ui-store";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileSidebar() {
  const t = useTranslations("dashboard.topbar");
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();

  return (
    <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("openMenu")}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b">
          <SheetTitle>{t("menu")}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav onNavigate={() => setMobileSidebarOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
