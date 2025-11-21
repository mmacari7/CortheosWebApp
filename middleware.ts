import { type NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  /*
   * Playwright starts the dev server and requires a 200 status to
   * begin the tests, so this ensures that the tests can start
   */
  if (pathname.startsWith("/ping")) {
    return new Response("pong", { status: 200 });
  }

  // Check for NextAuth session
  const response = NextResponse.next();
  const session = await auth();
  const hasSession = !!session;

  // Detect environment
  const isLocalDev = hostname.includes('localhost') || hostname.includes('127.0.0.1');
  const isChatSubdomain = hostname.startsWith('chat.');
  const isMainDomain = !isChatSubdomain && !isLocalDev;

  // Routes that require authentication (chat-specific)
  const protectedChatRoutes = ['/chat', '/api/chat', '/api/history', '/api/document', '/api/files', '/api/suggestions', '/api/vote'];
  const isProtectedChatRoute = protectedChatRoutes.some(route => pathname.startsWith(route));

  // PRODUCTION BEHAVIOR
  if (!isLocalDev) {
    // On chat subdomain (chat.cortheos.com)
    if (isChatSubdomain) {
      // Root path on chat subdomain shows chat app (requires auth)
      if (pathname === '/' && !hasSession) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Protect all chat routes
      if (isProtectedChatRoute && !hasSession) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // If authenticated and on login/register, redirect to chat
      if (hasSession && ['/login', '/register'].includes(pathname)) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      return response;
    }

    // On main domain (cortheos.com)
    if (isMainDomain) {
      // Root path shows marketing page
      if (pathname === '/') {
        return response;
      }

      // Redirect chat routes to chat subdomain
      if (isProtectedChatRoute) {
        const chatUrl = new URL(request.url);
        chatUrl.hostname = `chat.${hostname}`;
        return NextResponse.redirect(chatUrl);
      }

      // Allow public routes (login, register, about)
      return response;
    }
  }

  // LOCAL DEVELOPMENT BEHAVIOR (localhost)
  // Allow both marketing and chat from same origin for easier testing
  if (isLocalDev) {
    // Support chat.localhost:3000 subdomain in local dev
    if (isChatSubdomain) {
      // Root path on chat subdomain shows chat app (requires auth)
      if (pathname === '/' && !hasSession) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

      // Protect all chat routes
      if (isProtectedChatRoute && !hasSession) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('returnTo', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // If authenticated and on login/register, redirect to chat
      if (hasSession && ['/login', '/register'].includes(pathname)) {
        return NextResponse.redirect(new URL('/chat', request.url));
      }

      return response;
    }

    // On localhost without subdomain
    // Root path shows marketing page (no auth required)
    if (pathname === '/') {
      return response;
    }

    // Protect chat routes (require authentication)
    if (isProtectedChatRoute && !hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If authenticated and on login/register, redirect to /chat
    if (hasSession && ['/login', '/register'].includes(pathname)) {
      return NextResponse.redirect(new URL('/chat', request.url));
    }

    // Allow all other routes (public routes, authenticated chat routes)
    return response;
  }

  // Default: allow
  return response;
}

export const config = {
  matcher: [
    "/",
    "/chat/:id",
    "/api/:path*",
    "/auth/:path*",
    "/login",
    "/register",

    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
