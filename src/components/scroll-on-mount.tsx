"use client";

import { useEffect } from "react";

import { SCROLL_TO_KEY } from "@/components/nav-link";

/**
 * On the home page, picks up the section the user wanted to reach when they
 * clicked a NavLink on another page. Reads `sessionStorage` set by NavLink
 * (with `window.location.hash` as a fallback), scrolls there, then clears
 * the marker.
 *
 * The element may not be in the DOM on the very first frame after a soft
 * navigation, so we retry a few times with a short delay.
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

    let attempts = 0;
    let timer: number | null = null;

    const tryScroll = () => {
      attempts += 1;
      const el = document.getElementById(target!);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        if (window.history.replaceState) {
          window.history.replaceState(null, "", `#${target}`);
        }
        return;
      }
      if (attempts < 12) {
        timer = window.setTimeout(tryScroll, 80);
      }
    };

    // One frame to let the layout settle, then start trying.
    timer = window.setTimeout(tryScroll, 50);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return null;
}
