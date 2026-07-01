import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const tokenUser = request.cookies.get("token_user")?.value;
  const tokenAdmin = request.cookies.get("token_admin")?.value;
  const tokenSuper = request.cookies.get("token_super_admin")?.value;

  // SUPER ADMIN ZONE
  if (pathname.startsWith("/super-admin")) {
    if (!tokenSuper)
      return NextResponse.redirect(new URL("/login", request.url));
  }

  // ADMIN ZONE
  if (pathname.startsWith("/admin")) {
    if (!tokenAdmin)
      return NextResponse.redirect(new URL("/login", request.url));
  }

  // USER ZONE
  if (
    pathname.startsWith("/profile") ||
    pathname.startsWith("/checkout")
  ) {
    if (!tokenUser)
      return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/super-admin/:path*",
    "/profile/:path*",
    "/checkout/:path*",
  ],
};