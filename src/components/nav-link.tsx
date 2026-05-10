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
 * Anchor link used in the public site header. Smoothly scrolls to a
 * landing-page section without triggering a navigation when already on the
 * home page. From other pages it soft-navigates back to the home and the
 * `ScrollOnMount` companion picks the section up from sessionStorage.
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
    // Allow modifier-clicks (cmd/ctrl/shift) to behave like a normal link.
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
        /* private mode: fall back to hash */
      }
      router.push("/");
    }

    onNavigate?.();
  }

  return (
    <a
      href={isHome ? `#${section}` : "/"}
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
  // Reflect the section in the URL without triggering a navigation.
  if (window.history.replaceState) {
    window.history.replaceState(null, "", `#${id}`);
  }
}

export const SCROLL_TO_KEY = SCROLL_KEY;
