import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  // อนุญาต public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    // ถ้า login อยู่แล้วให้ redirect ไป inbox
    if (token) return NextResponse.redirect(new URL('/inbox', req.url))
    return NextResponse.next()
  }

  // ถ้าไม่มี token ให้ไป login
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
