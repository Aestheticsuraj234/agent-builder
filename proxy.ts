import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/modules/auth/lib/auth";
import { AUTH_ROUTES } from "@/modules/auth/lib/routes";

function isPublicRoute(pathname: string) {
  return pathname.startsWith("/auth") || pathname.startsWith("/api/auth");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicRoute(pathname)) {
    if (pathname === AUTH_ROUTES.signIn) {
      const session = await auth.api.getSession({
        headers: await headers(),
      });

      if (session) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.signIn, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
