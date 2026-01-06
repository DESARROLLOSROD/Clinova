import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Use SITE_URL from env or construction from headers
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  console.log('Auth callback triggered:', { code: !!code, next, siteUrl })

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('Auth code exchange successful', { user: data.user?.email })

      let redirectUrl = siteUrl;

      if (!redirectUrl) {
        // Fallback to origin construction if SITE_URL is not set
        const origin = new URL(request.url).origin;
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        redirectUrl = origin;
        if (!isLocalEnv && forwardedHost) {
          redirectUrl = `https://${forwardedHost}`;
        }
      }

      console.log('Redirecting to:', `${redirectUrl}${next}`)
      return NextResponse.redirect(`${redirectUrl}${next}`)
    } else {
      console.error('Auth code exchange error:', error)
    }
  }

  const finalRedirect = siteUrl ? `${siteUrl}/login?error=auth_failed` : `/login?error=auth_failed`;
  console.warn('Auth callback failed, redirecting to login:', finalRedirect)
  return NextResponse.redirect(new URL(finalRedirect, request.url))
}
