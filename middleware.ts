import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 保护 /admin 路径（排除 /admin/login）
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminSession = request.cookies.get("admin_session")
    if (!adminSession) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("from", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
