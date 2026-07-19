import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { getRedirectMap } from "@/lib/redirects-cache";

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!_next|api|images|uploads).*)"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicAdminPath = pathname === "/admin/login";

  if (pathname.startsWith("/admin") && !isPublicAdminPath) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const isValid = await verifySessionToken(token);
    if (!isValid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  const redirectMap = await getRedirectMap();
  const match = redirectMap.get(pathname);
  if (match) {
    return NextResponse.redirect(new URL(match.destination, request.url), match.statusCode);
  }

  return NextResponse.next();
}
