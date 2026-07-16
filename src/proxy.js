import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("ratri_admin_session")?.value;

    if (!adminToken || adminToken !== "authenticated_luxury_session") {
      const loginUrl = new URL("/admin-gate", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
