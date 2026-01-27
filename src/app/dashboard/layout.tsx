
import { createClient } from '@/utils/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { redirect } from 'next/navigation'
import { UserProvider } from '@/contexts/UserContext'
import { UserProfile } from '@/contexts/UserContext'
import { InactivityMonitor } from '@/components/auth/InactivityMonitor'
import { AdminBar } from '@/components/layout/AdminBar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    return (
        <UserProvider initialProfile={profile as UserProfile}>
            <InactivityMonitor />
            <div className="flex h-screen bg-gray-50 dark:bg-gray-950 transition-colors overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <AdminBar />
                    <Header userEmail={user.email} />
                    <main className="flex-1 overflow-y-auto p-8">
                        {children}
                    </main>
                </div>
            </div>
        </UserProvider>
    )
}
