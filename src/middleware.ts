import { NextResponse } from "next/server";
import { rateLimiter } from "@/lib/rate-limiter";
import { withAuth, type NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(req: NextRequestWithAuth) {
    const pathname = req.nextUrl.pathname;

    // rate limit API routes
    if (pathname.startsWith("/api")) {
      const ip = req.ip ?? "127.0.0.1";

      try {
        const { success } = await rateLimiter.limit(ip);

        if (!success) {
          return new NextResponse("Too many requests", { status: 429 });
        }
      } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
      }
    }

    // manage route protection
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/sign-in");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      return;
    }

    const sensitiveRoutes = ["/r/create", "/settings"];

    if (
      !isAuth &&
      (sensitiveRoutes.some((route) => pathname.startsWith(route)) ||
        pathname.match(/\/r\/[^/]+\/submit/))
    ) {
      let from = pathname;

      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/sign-in?from=${encodeURIComponent(from)}`, req.url)
      );
    }
  },
  {
    callbacks: {
      async authorized() {
        // this is so the middleware function above is always called
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/api/:path*",
    "/r/:path*/submit",
    "/r/create",
    "/settings",
    "/sign-in",
  ],
};
