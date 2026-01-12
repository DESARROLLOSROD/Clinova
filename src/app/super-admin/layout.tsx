import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Building2, BarChart3, Settings, LogOut } from 'lucide-react'

export default async function SuperAdminLayout({
    children,
}: {
    children: ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Check if user is super admin
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'super_admin') {
        redirect('/dashboard')
    }

    const handleSignOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-900">
                                Clinova <span className="text-blue-600">Super Admin</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-600">{profile.full_name}</span>
                            <form action={handleSignOut}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Salir
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
                    <nav className="p-4 space-y-2">
                        <Link
                            href="/super-admin/dashboard"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <BarChart3 className="h-5 w-5" />
                            Dashboard
                        </Link>
                        <Link
                            href="/super-admin/clinics"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <Building2 className="h-5 w-5" />
                            Clínicas
                        </Link>
                        <Link
                            href="/super-admin/analytics"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <BarChart3 className="h-5 w-5" />
                            Analíticas
                        </Link>
                        <Link
                            href="/super-admin/billing"
                            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <Settings className="h-5 w-5" />
                            Facturación
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    )
}
