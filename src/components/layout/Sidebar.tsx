'use client'

import React from 'react'
import { SidebarContent } from './SidebarContent'

export function Sidebar() {
    return (
        <div className="hidden md:flex h-full w-64 flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 z-30 flex-shrink-0">
            <SidebarContent />
        </div>
    )
}

