'use client'

import { PageTransition } from '@/components/ui/PageTransition'

export default function Template({ children }: { children: React.ReactNode }) {
    return <PageTransition className="h-full w-full">{children}</PageTransition>
}
