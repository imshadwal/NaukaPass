import { NextResponse, type NextRequest } from "next/server";
import {
  LOCAL_SESSION_COOKIE,
  readLocalSessionUser,
} from "@/lib/local-auth";

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isLogin = pathname === "/login";
  const isPublic = isLogin || pathname === "/";
  const username = readLocalSessionUser(
    request.cookies.get(LOCAL_SESSION_COOKIE)?.value,
  );

  if (!username && !isPublic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (username && isLogin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next({ request });
}
