"use client";

import type { MouseEvent, ReactNode } from "react";

import { useRouter, usePathname } from "@/i18n/navigation";

const SCROLL_KEY = "ts:scroll-to";

type NavLinkProps = {
  section: string;
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
};

/**
 * Anchor link used in the public site header. On the home page it smoothly
 * scrolls to the matching landing-page section without triggering a
 * navigation. From any other page it soft-navigates back to the home with
 * `?to=<section>` — the `ScrollOnMount` companion picks the section up from
 * the query string and scrolls there once the page has hydrated. We also
 * mirror the value to sessionStorage as a belt-and-suspenders fallback.
 */
export function NavLink({
  section,
  children,
  className,
  onNavigate,
}: NavLinkProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    event.preventDefault();

    if (isHome) {
      scrollToSection(section);
    } else {
      try {
        sessionStorage.setItem(SCROLL_KEY, section);
      } catch {
        /* private mode — query string still carries the target */
      }
      router.push(`/?to=${encodeURIComponent(section)}`);
    }

    onNavigate?.();
  }

  return (
    <a
      href={isHome ? `#${section}` : `/?to=${encodeURIComponent(section)}`}
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  if (window.history.replaceState) {
    window.history.replaceState(null, "", `#${id}`);
  }
}

export const SCROLL_TO_KEY = SCROLL_KEY;
