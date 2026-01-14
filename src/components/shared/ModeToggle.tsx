"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Wait for mount to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="outline" size="sm" className="w-10 h-10 px-0 rounded-lg border-gray-200">
                <Sun className="h-[1.2rem] w-[1.2rem] text-gray-400" />
            </Button>
        )
    }

    const isDark = theme === "dark"

    return (
        <Button
            variant="outline"
            size="sm"
            className="w-10 h-10 px-0 rounded-lg border-gray-200 dark:border-gray-800 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
            {isDark ? (
                <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500 transition-all scale-100 rotate-0" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem] text-blue-600 transition-all scale-100 rotate-0" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
