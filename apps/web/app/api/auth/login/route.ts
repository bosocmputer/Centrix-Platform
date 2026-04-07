import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000'
  const res = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const data = await res.json()

  const response = NextResponse.json(data)
  // set cookie ฝั่ง server เพื่อให้ proxy.ts อ่านได้ทันที
  response.cookies.set('token', data.token, {
    httpOnly: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 วัน
    sameSite: 'lax',
  })

  return response
}
