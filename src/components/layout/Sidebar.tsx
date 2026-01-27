'use client'

import React from 'react'
import { SidebarContent } from './SidebarContent'

export function Sidebar() {
    return (
        <div className="hidden md:flex h-full w-64 flex-col fixed md:relative z-30">
            <SidebarContent />
        </div>
    )
}

