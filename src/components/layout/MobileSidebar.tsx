'use client'

import { Menu } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { SidebarContent } from './SidebarContent'
import { useState } from 'react'
import { X } from 'lucide-react'

export function MobileSidebar() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <button className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Menu className="h-6 w-6" />
                </button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 animate-fade-in" />
                <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-full max-w-[280px] bg-white dark:bg-gray-950 shadow-xl animate-slide-in-left focus:outline-none">
                    <div className="absolute top-4 right-4 z-50">
                        <Dialog.Close asChild>
                            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
                                <X className="h-5 w-5" />
                            </button>
                        </Dialog.Close>
                    </div>
                    <Dialog.Title className="sr-only">Menú de Navegación</Dialog.Title>
                    <Dialog.Description className="sr-only">
                        Barra lateral de navegación principal
                    </Dialog.Description>
                    <div className="h-full overflow-y-auto">
                        <SidebarContent onNavigate={() => setOpen(false)} />
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
