import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, isLocale } from "@/i18n.config";

/**
 * Detect locale from path, cookie, or Accept-Language header.
 * Adds missing locale prefix and sets NEXT_LOCALE cookie.
 *
 * Adding a new locale only requires updating i18n.config.ts — no code changes.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/product-images") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if the first path segment is a locale
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && isLocale(firstSegment)) {
    // Locale present — set cookie and continue
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", firstSegment, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
    return response;
  }

  // No locale prefix — detect and redirect
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  const acceptLang = request.headers.get("accept-language") ?? "";
  const browserLocale = acceptLang.startsWith("zh") ? "zh" : defaultLocale;
  const locale = cookieLocale && isLocale(cookieLocale) ? cookieLocale : browserLocale;

  // Build locale-prefixed URL
  const newUrl = new URL(
    `/${locale}${pathname === "/" ? "" : pathname}${request.nextUrl.search}`,
    request.url,
  );

  const response = NextResponse.redirect(newUrl);
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|static|product-images|favicon.ico|file.svg|globe.svg|next.svg|vercel.svg|window.svg).*)"],
};
