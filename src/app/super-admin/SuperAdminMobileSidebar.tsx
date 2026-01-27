'use client'

import { Menu, X, BarChart3, Building2, Settings, CreditCard, LogOut } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/super-admin/dashboard', icon: BarChart3 },
    { name: 'Clínicas', href: '/super-admin/clinics', icon: Building2 },
    { name: 'Analíticas', href: '/super-admin/analytics', icon: BarChart3 },
    { name: 'Facturación', href: '/super-admin/billing', icon: Settings },
    { name: 'Planes de Suscripción', href: '/super-admin/planes', icon: CreditCard },
]

export function SuperAdminMobileSidebar({ onSignOut }: { onSignOut: () => void }) {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg mr-2">
                    <Menu className="h-6 w-6" />
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-fade-in" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-full max-w-[280px] bg-white shadow-xl animate-slide-in-left focus:outline-none">
                    <div className="absolute top-4 right-4 z-50">
                        <Dialog.Close asChild>
                            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>

                    <div className="flex flex-col h-full bg-white">
                        <div className="p-6 border-b border-gray-100">
                            <h1 className="text-xl font-bold text-gray-900">
                                Clinova <span className="text-blue-600">Admin</span>
                            </h1>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                            isActive
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-50"
                                        )}
                                    >
                                        <item.icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </nav>

                        <div className="p-4 border-t border-gray-100">
                            <button
                                onClick={onSignOut}
                                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                Salir
                            </button>
                        </div>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
