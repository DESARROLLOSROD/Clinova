import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { supabase, user, response: supabaseResponse } = await updateSession(request)

    // Helper to return a redirect with cookies preserved
    const redirect = (path: string) => {
        const url = request.nextUrl.clone()
        url.pathname = path
        const response = NextResponse.redirect(url)
        // Copy cookies from the session update response to the redirect
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            response.cookies.set(cookie.name, cookie.value, {
                path: cookie.path,
                domain: cookie.domain,
                maxAge: cookie.maxAge,
                expires: cookie.expires,
                sameSite: cookie.sameSite,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
            })
        })
        return response
    }

    // If updateSession already returned a redirect, stop here
    if (supabaseResponse.headers.get('location')) {
        return supabaseResponse
    }

    const publicPaths = ['/login', '/signup', '/reset-password']
    const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    if (!user && !isPublicPath) {
        return redirect('/login')
    }

    if (user) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, is_active, clinic_id')
            .eq('id', user.id)
            .single()

        if (profile && !profile.is_active) {
            return redirect('/account-suspended')
        }

        // Super Admin routing
        if (profile?.role === 'super_admin') {
            // Super admin trying to access regular dashboard -> redirect to super admin dashboard
            if (request.nextUrl.pathname === '/dashboard' || request.nextUrl.pathname.startsWith('/dashboard/')) {
                if (!request.nextUrl.pathname.startsWith('/super-admin')) {
                    return redirect('/super-admin/dashboard')
                }
            }
        }

        // Patient routing (redirect to portal)
        if (profile?.role === 'patient' && request.nextUrl.pathname.startsWith('/dashboard')) {
            if (!request.nextUrl.pathname.startsWith('/dashboard/portal')) {
                return redirect('/dashboard/portal')
            }
        }

        // Super admin only paths
        const superAdminPaths = ['/super-admin']
        const isSuperAdminPath = superAdminPaths.some((path) => request.nextUrl.pathname.startsWith(path))

        if (isSuperAdminPath && profile?.role !== 'super_admin') {
            return redirect('/dashboard')
        }

        // Clinic manager and admin only paths (within their clinic)
        const adminOnlyPaths = ['/dashboard/users', '/dashboard/configuracion', '/dashboard/audit-log']
        const isAdminOnlyPath = adminOnlyPaths.some((path) => request.nextUrl.pathname.startsWith(path))

        if (isAdminOnlyPath && !['super_admin', 'clinic_manager'].includes(profile?.role || '')) {
            return redirect('/dashboard')
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
