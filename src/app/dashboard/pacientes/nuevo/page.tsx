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
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: ''
    })

    async function handleSubmit(e: React.FormEvent) {
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

            const patientData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email || null,
                phone: formData.phone || null,
                date_of_birth: formData.date_of_birth || null,
                clinic_id: profile.clinic_id,
                active: true
            }

            const { data: newPatient, error } = await supabase
                .from('patients')
                .insert([patientData])
                .select()
                .single()

            if (error) throw error

            // Redirect to initial evaluation for the new patient
            router.push(`/dashboard/pacientes/${newPatient.id}/evaluacion`)
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
                        <Input
                            id="first_name"
                            name="first_name"
                            required
                            placeholder="Ej. Juan"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="last_name">Apellidos *</Label>
                        <Input
                            id="last_name"
                            name="last_name"
                            required
                            placeholder="Ej. Pérez"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="juan@ejemplo.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="55 1234 5678"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                        <Input
                            id="date_of_birth"
                            name="date_of_birth"
                            type="date"
                            value={formData.date_of_birth}
                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-gray-100">
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
