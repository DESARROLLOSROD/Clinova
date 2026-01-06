'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PatientSelect } from '@/components/patients/PatientSelect'
import { TherapistSelect } from '@/components/therapists/TherapistSelect'

export default function NewAppointmentPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    // Allow pre-selecting date/time from query params (e.g. clicking on calendar slot)
    const defaultDate = searchParams.get('date') || ''
    const defaultTime = searchParams.get('time') || ''

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [therapistId, setTherapistId] = useState<string>('')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        const formData = new FormData(e.currentTarget)
        const date = formData.get('date') as string
        const time = formData.get('time') as string
        const duration = 60 // Default 1 hour for now

        // Construct simplified timestamps
        // Note: detailed timezone handling is complex; for MVP we assume local browser time implies local clinic time.
        const startDateTime = new Date(`${date}T${time}`)
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000)

        const appointmentData = {
            patient_id: formData.get('patient_id') as string,
            therapist_id: therapistId || null,
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            notes: formData.get('notes') as string,
            status: 'scheduled'
        }

        try {
            const { error } = await supabase.from('appointments').insert([appointmentData])
            if (error) throw error

            router.push('/dashboard/agenda')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Nueva Cita</h1>
                <p className="text-gray-600 text-sm">Agenda una sesión para un paciente.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <PatientSelect name="patient_id" required />

                <TherapistSelect
                    name="therapist_id"
                    onValueChange={setTherapistId}
                />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="date">Fecha *</Label>
                        <Input type="date" name="date" id="date" required defaultValue={defaultDate} />
                    </div>
                    <div>
                        <Label htmlFor="time">Hora *</Label>
                        <Input type="time" name="time" id="time" required defaultValue={defaultTime} />
                    </div>
                </div>

                <div>
                    <Label htmlFor="notes">Notas (Opcional)</Label>
                    <Input name="notes" id="notes" placeholder="Motivo de la consulta..." />
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
                        Agendar Cita
                    </Button>
                </div>
            </form>
        </div>
    )
}
