import { NextResponse, type NextRequest } from "next/server";
import { companyFromPath } from "@/utils/company";
import { SESSION_COOKIE } from "@/utils/cookieNames";

const PUBLIC_PATHS = ["/login", "/invite", "/magic-login"];

// One portal serves every company under its own path: /ej/products is the
// /products page for EJ, and /ej/api/... its API routes. The path is
// rewritten and the company travels in x-company, so pages stay put.
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const company = companyFromPath(pathname);
  if (!company) {
    return new NextResponse("Not found", { status: 404 });
  }

  const headers = new Headers(request.headers);
  headers.set("x-company", company);
  const page = pathname.slice(company.length + 1) || "/";
  const target = request.nextUrl.clone();
  target.pathname = page;
  const rewrite = () => NextResponse.rewrite(target, { request: { headers } });

  // API routes answer 401 themselves. The session cookie is scoped to
  // /<company>, so only this company's session is ever sent here.
  if (page.startsWith("/api/") || PUBLIC_PATHS.some((path) => page.startsWith(path))) {
    return rewrite();
  }
  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    return NextResponse.redirect(new URL(`/${company}/login`, request.url));
  }
  return rewrite();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|ico|webp|mp4|webm|mov|avi|txt|xml|json)$).*)",
  ],
};
