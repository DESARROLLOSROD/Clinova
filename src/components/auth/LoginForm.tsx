'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { logLoginAction } from '@/app/auth/actions'

export function LoginForm() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            // Log successful login via Server Action
            await logLoginAction()

            router.refresh()
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Bienvenido a Clinova
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Inicia sesión para gestionar tu clínica
                </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="nombre@clinica.com"
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-700 dark:text-red-400 animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 border-none"
                    isLoading={isLoading}
                >
                    Iniciar sesión
                </Button>
            </form>
        </div>
    )
}
