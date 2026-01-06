import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  // Use SITE_URL from env or construction from headers
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  console.log('Auth callback triggered:', { code: !!code, next, siteUrl })

  // Determine the base URL for redirection
  let redirectBase = siteUrl;

  if (!redirectBase) {
    const forwardedHost = request.headers.get('x-forwarded-host');
    const host = forwardedHost || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';

    if (host) {
      redirectBase = `${proto}://${host}`;
    } else {
      redirectBase = new URL(request.url).origin;
    }
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('Auth code exchange successful', { user: data.user?.email })
    } else {
      console.error('Auth code exchange error:', error)
      // If code exchange fails, we might still want to try to go to 'next' 
      // but usually this means the code is invalid/expired.
      // For safety, let's redirect to login with error.
      return NextResponse.redirect(`${redirectBase}/login?error=auth_exchange_failed`)
    }
  } else {
    // If no code is present, it might be an Implicit Flow (tokens in fragments #)
    // The server doesn't see fragments, so we must redirect to the application
    // and let the client-side library handle it.
    console.log('No code present, proceeding to next destination (could be Implicit Flow)')
  }

  const finalUrl = `${redirectBase}${next}`;
  console.log('Redirecting to:', finalUrl)

  // Browsers usually preserve fragments (#) when following a 302 redirect 
  // to the same domain, which is crucial for Implicit Flow.
  return NextResponse.redirect(finalUrl)
}
