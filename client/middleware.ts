import { NextRequest, NextResponse } from "next/server";
import { publicRoutes, authRoutes, DEFAULT_LOGIN_REDIRECT } from "./routes";
export function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get("userAccount");
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(req.nextUrl.pathname);
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, req.url));
    }
    if (req.nextUrl.pathname == "/register") {
      return NextResponse.redirect(new URL("/register/patient", req.url));
    }
    return;
  }
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
