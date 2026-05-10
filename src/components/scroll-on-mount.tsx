"use client";

import { useEffect } from "react";

import { SCROLL_TO_KEY } from "@/components/nav-link";

/**
 * On the home page, picks up the section the user wanted to reach when they
 * clicked a NavLink on another page. Looks at, in order:
 *   1. `?to=<section>` query param (set by NavLink — primary, survives every
 *      navigation mode including hard reloads and back/forward).
 *   2. `sessionStorage["ts:scroll-to"]` — fallback for the same NavLink path.
 *   3. The URL hash — for direct anchor links shared externally.
 *
 * The element may not be in the DOM on the first frame after a soft
 * navigation, so we retry a few times with a short delay. After scrolling we
 * strip the marker from the URL so reloads don't keep snapping back.
 *
 * Renders nothing.
 */
export function ScrollOnMount() {
  useEffect(() => {
    let target: string | null = null;

    // 1. Query string — primary signal, set by NavLink for off-home clicks.
    try {
      const params = new URLSearchParams(window.location.search);
      const fromQuery = params.get("to");
      if (fromQuery) {
        target = fromQuery;
      }
    } catch {
      /* ignore */
    }

    // 2. sessionStorage fallback (same writer as NavLink).
    if (!target) {
      try {
        target = sessionStorage.getItem(SCROLL_TO_KEY);
        if (target) sessionStorage.removeItem(SCROLL_TO_KEY);
      } catch {
        target = null;
      }
    }

    // 3. URL hash — direct anchor links from elsewhere.
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
        // Replace the URL so the marker disappears (no ?to= or #anchor in the
        // address bar) — but the same history entry, so back/forward still
        // returns to the previous page.
        if (window.history.replaceState) {
          window.history.replaceState(
            null,
            "",
            `${window.location.pathname}#${target}`
          );
        }
        // Clear sessionStorage too in case both signals were set.
        try {
          sessionStorage.removeItem(SCROLL_TO_KEY);
        } catch {
          /* ignore */
        }
        return;
      }
      if (attempts < 16) {
        timer = window.setTimeout(tryScroll, 80);
      }
    };

    timer = window.setTimeout(tryScroll, 50);

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  return null;
}
