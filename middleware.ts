import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  const isLoginPage = pathname === "/login";
  const isOnboardingPage = pathname === "/onboarding";
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/products");

  if (!token && (isProtectedRoute || isOnboardingPage)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token) {
    if (isLoginPage) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (
      isProtectedRoute &&
      !token.onboardingCompleted &&
      !isOnboardingPage
    ) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    if (isOnboardingPage && token.onboardingCompleted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/products/:path*", "/onboarding", "/login"],
};
