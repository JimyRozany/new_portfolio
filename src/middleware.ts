import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/ar";
    return NextResponse.redirect(url);
  }

  // /admin/**: first gate (cheap signature check). Pages/actions still call requireAdmin().
  const authed = !!(await verifySession(req.cookies.get(COOKIE)?.value));
  const isLogin = pathname === "/admin/login";
  let res: NextResponse;
  if (!authed && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    res = NextResponse.redirect(url);
  } else if (authed && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin";
    res = NextResponse.redirect(url);
  } else {
    res = NextResponse.next();
  }
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  return res;
}
export const config = { matcher: ["/", "/admin", "/admin/:path*"] };
