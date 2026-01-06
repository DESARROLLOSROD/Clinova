import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback triggered:', { code: !!code, next, origin })

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('Auth code exchange successful', { user: data.user?.email })

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      let redirectUrl = origin
      if (!isLocalEnv && forwardedHost) {
        redirectUrl = `https://${forwardedHost}`
      }

      console.log('Redirecting to:', `${redirectUrl}${next}`)
      return NextResponse.redirect(`${redirectUrl}${next}`)
    } else {
      console.error('Auth code exchange error:', error)
    }
  }

  console.warn('Auth callback failed or no code present, redirecting to login')
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
