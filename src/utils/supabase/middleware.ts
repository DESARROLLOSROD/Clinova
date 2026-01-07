
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { UserRole } from '@/types/roles'

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

    // Get user role from metadata
    const getUserRole = (): UserRole | null => {
        if (!user) return null
        const metadataRole = user.user_metadata?.role as UserRole
        if (metadataRole && Object.values(UserRole).includes(metadataRole)) {
            return metadataRole
        }
        const appMetadataRole = user.app_metadata?.role as UserRole
        if (appMetadataRole && Object.values(UserRole).includes(appMetadataRole)) {
            return appMetadataRole
        }
        return null
    }

    const userRole = getUserRole()

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

    // Redirect unauthenticated users to login
    if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
        return NextResponse.redirect(getRedirectUrl('/login'))
    }

    if (request.nextUrl.pathname === '/' && !user) {
        return NextResponse.redirect(getRedirectUrl('/login'))
    }

    // Redirect authenticated users away from login
    if (request.nextUrl.pathname.startsWith('/login') && user) {
        return NextResponse.redirect(getRedirectUrl('/dashboard'))
    }

    // Role-based route protection
    if (user && userRole) {
        const pathname = request.nextUrl.pathname

        // Admin-only routes
        const adminOnlyRoutes = ['/dashboard/users']
        if (adminOnlyRoutes.some(route => pathname.startsWith(route))) {
            if (userRole !== UserRole.ADMIN) {
                return NextResponse.redirect(getRedirectUrl('/dashboard'))
            }
        }

        // Staff-only routes (admin + receptionist)
        const staffOnlyRoutes = ['/dashboard/users/create']
        if (staffOnlyRoutes.some(route => pathname.startsWith(route))) {
            if (userRole !== UserRole.ADMIN && userRole !== UserRole.RECEPTIONIST) {
                return NextResponse.redirect(getRedirectUrl('/dashboard'))
            }
        }

        // Therapist management (admin only)
        if (pathname.startsWith('/dashboard/fisioterapeutas') && pathname !== '/dashboard/fisioterapeutas') {
            if (userRole !== UserRole.ADMIN) {
                return NextResponse.redirect(getRedirectUrl('/dashboard'))
            }
        }

        // Configuration (admin only)
        if (pathname.startsWith('/dashboard/configuracion')) {
            if (userRole !== UserRole.ADMIN) {
                return NextResponse.redirect(getRedirectUrl('/dashboard'))
            }
        }
    }

    return response
}
