import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("vb_session")?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!session && !isAuthPage) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (session && isAuthPage) {
    return NextResponse.redirect(new URL("/plays", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/plays/:path*", "/teams/:path*", "/film/:path*", "/login", "/signup"],
};
