import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth required
  const publicPatterns = ["/gallery", "/login", "/register"];
  if (
    publicPatterns.some((p) => pathname === p || pathname.startsWith(p + "/"))
  ) {
    return NextResponse.next();
  }

  // Let Neon Auth session verifier callback through (OAuth completion)
  if (request.nextUrl.searchParams.has("neon_auth_session_verifier")) {
    return NextResponse.next();
  }

  // Check session
  const { data: session } = await auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.svg|icon\\.svg|logo.*\\.svg|logo.*\\.png|chan_logo\\.svg).*)",
  ],
};
