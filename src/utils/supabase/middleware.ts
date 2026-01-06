
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

    // Helper to get the correct redirect URL
    const getRedirectUrl = (path: string) => {
        if (siteUrl) return `${siteUrl}${path}`;

        // Fallback to construction from request headers
        const forwardedHost = request.headers.get('x-forwarded-host');
        const host = forwardedHost || request.headers.get('host');
        const proto = request.headers.get('x-forwarded-proto') || 'https';

        if (host) return `${proto}://${host}${path}`;
        return new URL(path, request.url).toString();
    };

    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(getRedirectUrl('/login'))
    }

    if (request.nextUrl.pathname === '/' && !user) {
        return NextResponse.redirect(getRedirectUrl('/login'))
    }

    if (request.nextUrl.pathname.startsWith('/login') && user) {
        return NextResponse.redirect(getRedirectUrl('/dashboard'))
    }

    return response
}
