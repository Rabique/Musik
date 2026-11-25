import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could cause users to be logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /workspace: redirect to /auth if not logged in
  if (!user && request.nextUrl.pathname.startsWith("/workspace")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users visiting /auth to /workspace
  if (user && request.nextUrl.pathname === "/auth") {
    const nextPath = request.nextUrl.searchParams.get("next") || "/workspace";
    const url = request.nextUrl.clone();
    url.pathname = nextPath;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
