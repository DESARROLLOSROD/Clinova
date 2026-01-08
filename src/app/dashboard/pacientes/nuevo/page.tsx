'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NewPatientPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        try {
            // Get current user and their clinic_id
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('clinic_id')
                .eq('id', user.id)
                .single()

            if (!profile?.clinic_id) throw new Error('No se encontró la clínica del usuario')

            const formData = new FormData(e.currentTarget)
            const patientData = {
                first_name: formData.get('first_name') as string,
                last_name: formData.get('last_name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                date_of_birth: formData.get('date_of_birth') as string || null,
                clinic_id: profile.clinic_id,
                active: true
            }

            const { error } = await supabase.from('patients').insert([patientData])
            if (error) throw error

            router.push('/dashboard/pacientes')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Paciente</h1>
                <p className="text-gray-600 text-sm">Ingresa los datos básicos del paciente.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                        <Label htmlFor="first_name">Nombre *</Label>
                        <Input id="first_name" name="first_name" required placeholder="Ej. Juan" />
                    </div>
                    <div>
                        <Label htmlFor="last_name">Apellidos *</Label>
                        <Input id="last_name" name="last_name" required placeholder="Ej. Pérez" />
                    </div>
                    <div>
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input id="email" name="email" type="email" placeholder="juan@ejemplo.com" />
                    </div>
                    <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input id="phone" name="phone" placeholder="55 1234 5678" />
                    </div>
                    <div>
                        <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                        <Input id="date_of_birth" name="date_of_birth" type="date" />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" isLoading={isLoading}>
                        Guardar Paciente
                    </Button>
                </div>
            </form>
        </div>
    )
}
