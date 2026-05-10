import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "./i18n/routing";
import { refreshSupabaseSession } from "./lib/supabase/proxy";

const intlMiddleware = createIntlMiddleware(routing);

const LOCALE_PREFIX = `(?:${routing.locales.join("|")})`;
const DASHBOARD_RE = new RegExp(`^/${LOCALE_PREFIX}/dashboard(?:/|$)`);
const LOGIN_RE = new RegExp(`^/${LOCALE_PREFIX}/login(?:/|$)`);

export default async function proxy(request: NextRequest) {
  // 1) Run next-intl first so locale rewrites/redirects happen.
  const intlResponse = intlMiddleware(request);

  // 2) Sync the Supabase session cookies onto the response we'll return.
  const { user, response } = await refreshSupabaseSession(
    request,
    intlResponse
  );

  const pathname = request.nextUrl.pathname;
  const locale = extractLocale(pathname) ?? routing.defaultLocale;

  // 3) Protect /[locale]/dashboard/*
  if (DASHBOARD_RE.test(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // 4) Already signed in? Skip the login page, send to dashboard.
  if (LOGIN_RE.test(pathname) && user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

function extractLocale(pathname: string): string | null {
  const seg = pathname.split("/")[1];
  return (routing.locales as readonly string[]).includes(seg) ? seg : null;
}

export const config = {
  // Match everything except: API routes, Next.js internals, static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
