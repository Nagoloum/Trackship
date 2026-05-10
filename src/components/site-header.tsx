"use client";

import { Menu, Package, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { NavLink } from "@/components/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "home", section: "hero" },
  { key: "services", section: "services" },
  { key: "about", section: "why-us" },
  { key: "testimonials", section: "testimonials" },
  { key: "faq", section: "faq" },
  { key: "contact", section: "contact" },
] as const;

const NAV_LINK_CLASSES =
  "hover:text-foreground hover:bg-muted text-muted-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors";
const NAV_LINK_MOBILE_CLASSES =
  "hover:bg-muted rounded-md px-3 py-2 text-sm font-medium block";

export function SiteHeader() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70 border-border/60 shadow-sm"
          : "bg-background/80 supports-backdrop-filter:bg-background/50 backdrop-blur border-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo priority width={140} height={36} className="h-8" />
        </Link>

        {/* Desktop nav */}
        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 md:flex"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              section={item.section}
              className={NAV_LINK_CLASSES}
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          {/* Track CTA — always visible. Short label on mobile, long on lg+. */}
          <Link
            href="/track"
            className={cn(buttonVariants({ size: "sm" }), "gap-2")}
          >
            <Package className="h-4 w-4" />
            <span className="lg:hidden">{tc("trackShort")}</span>
            <span className="hidden lg:inline">{tc("trackButton")}</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          {/* Mobile toggles */}
          <div className="md:hidden">
            <ThemeToggle />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "border-border/60 bg-background overflow-hidden border-t transition-[max-height] duration-300 md:hidden",
          open ? "max-h-112" : "max-h-0"
        )}
      >
        <nav
          aria-label="Mobile"
          className="container mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              section={item.section}
              className={NAV_LINK_MOBILE_CLASSES}
              onNavigate={() => setOpen(false)}
            >
              {t(item.key)}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center justify-between border-t pt-3">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
