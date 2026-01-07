import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const { supabase, response } = await updateSession(request)

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const publicPaths = ['/login', '/signup', '/reset-password']
    const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user) {
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, is_active')
            .eq('id', user.id)
            .single()

        if (profile && !profile.is_active) {
            const url = request.nextUrl.clone()
            url.pathname = '/account-suspended'
            return NextResponse.redirect(url)
        }

        if (profile?.role === 'patient' && request.nextUrl.pathname.startsWith('/dashboard')) {
            if (!request.nextUrl.pathname.startsWith('/dashboard/mis-ejercicios')) {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard/mis-ejercicios'
                return NextResponse.redirect(url)
            }
        }

        const adminOnlyPaths = ['/dashboard/usuarios', '/dashboard/configuracion', '/dashboard/audit-log']
        const isAdminOnlyPath = adminOnlyPaths.some((path) => request.nextUrl.pathname.startsWith(path))

        if (isAdminOnlyPath && profile?.role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
