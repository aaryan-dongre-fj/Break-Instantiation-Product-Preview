import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/utils/cookieNames";

const PUBLIC_PATHS = ["/login", "/invite", "/magic-login"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoggedIn = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|mp4|webm|mov|avi)$).*)",
  ],
};
