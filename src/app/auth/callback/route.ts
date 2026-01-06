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
        const forwardedHost = request.headers.get('x-forwarded-host');
        const host = forwardedHost || request.headers.get('host');
        const proto = request.headers.get('x-forwarded-proto') || 'https';

        if (host) {
          redirectUrl = `${proto}://${host}`;
        } else {
          redirectUrl = new URL(request.url).origin;
        }
      }

      console.log('Redirecting to:', `${redirectUrl}${next}`)

      // We use NextResponse.redirect but we must ensure cookies are sent.
      // Next.js 15 treats cookies().set() as a mutation that should persist
      // when the response is sent.
      return NextResponse.redirect(`${redirectUrl}${next}`)
    } else {
      console.error('Auth code exchange error:', error)
    }
  }

  const loginPath = '/login?error=auth_failed';
  let finalRedirect = siteUrl ? `${siteUrl}${loginPath}` : '';

  if (!finalRedirect) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    if (host) {
      finalRedirect = `${proto}://${host}${loginPath}`;
    } else {
      finalRedirect = new URL(loginPath, request.url).toString();
    }
  }

  console.warn('Auth callback failed, redirecting to login:', finalRedirect)
  return NextResponse.redirect(finalRedirect)
}
