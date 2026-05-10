import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Reads/refreshes the Supabase session by syncing cookies between the request
 * and the response. Returns both the (possibly mutated) response and the
 * authenticated user — the proxy then decides whether to redirect.
 *
 * The response argument MUST be a NextResponse instance whose cookies the
 * caller will pass back to the client. Don't create a new NextResponse after
 * this call without copying the cookies, or the session will be lost.
 */
export async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, response };
}
