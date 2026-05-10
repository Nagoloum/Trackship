"use client";

import { useEffect } from "react";

import { SCROLL_TO_KEY } from "@/components/nav-link";

/**
 * On the home page, picks up the section the user wanted to reach when they
 * clicked a NavLink on another page. Reads `sessionStorage` set by NavLink,
 * scrolls to that section, then clears the marker.
 *
 * Renders nothing.
 */
export function ScrollOnMount() {
  useEffect(() => {
    let target: string | null = null;
    try {
      target = sessionStorage.getItem(SCROLL_TO_KEY);
      if (target) sessionStorage.removeItem(SCROLL_TO_KEY);
    } catch {
      target = null;
    }

    if (!target && window.location.hash) {
      target = window.location.hash.slice(1);
    }

    if (!target) return;

    // Wait one frame so layout is settled and Reveal-wrapped sections exist.
    const id = window.requestAnimationFrame(() => {
      const el = document.getElementById(target!);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (window.history.replaceState) {
          window.history.replaceState(null, "", `#${target}`);
        }
      }
    });

    return () => window.cancelAnimationFrame(id);
  }, []);

  return null;
}
