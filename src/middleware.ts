import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  // user not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.nextUrl));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  // middleware will run only on the matched paths
  matcher: ["/r/:path*/submit", "/r/create"],
};
