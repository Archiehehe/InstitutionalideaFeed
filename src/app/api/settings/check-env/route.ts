import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')
  if (!name) return Response.json({ configured: false })

  const value = process.env[name]
  return Response.json({
    name,
    configured: !!value && value.length > 0,
  })
}
