// Debug endpoint to check what cookies are available
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const allCookies = Array.from(cookieStore.getAll()).map(c => ({ 
    name: c.name, 
    value: c.value?.slice(0, 30) + '...',
    hasValue: !!c.value 
  }))
  
  const v2uToken = cookieStore.get('v2u-token')
  
  return NextResponse.json({
    success: true,
    message: 'Cookie debug info',
    cookies: allCookies,
    v2uToken: v2uToken ? {
      name: v2uToken.name,
      hasValue: !!v2uToken.value,
      valuePreview: v2uToken.value?.slice(0, 30) + '...'
    } : null,
    cookieCount: allCookies.length
  })
}