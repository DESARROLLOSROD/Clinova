'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PatientSelect } from '@/components/patients/PatientSelect'
import { TherapistSelect } from '@/components/therapists/TherapistSelect'
import { toast } from 'sonner'
import { addDays, addWeeks } from 'date-fns'

export default function NewAppointmentPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    // Allow pre-selecting date/time from query params (e.g. clicking on calendar slot)
    const defaultDate = searchParams.get('date') || ''
    const defaultTime = searchParams.get('time') || ''

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [therapistId, setTherapistId] = useState<string>('')

    // Recurrence State
    const [recurrence, setRecurrence] = useState<'none' | 'weekly' | 'biweekly'>('none')
    const [occurrences, setOccurrences] = useState<number>(1)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const supabase = createClient()

        const formData = new FormData(e.currentTarget)
        const date = formData.get('date') as string
        const time = formData.get('time') as string
        const duration = 60 // Default 1 hour for now
        const notes = formData.get('notes') as string
        const patientId = formData.get('patient_id') as string

        try {
            const baseStartDate = new Date(`${date}T${time}`)
            const appointmentsToCreate = []

            const count = recurrence === 'none' ? 1 : occurrences

            for (let i = 0; i < count; i++) {
                let currentStartDate = new Date(baseStartDate)

                if (recurrence === 'weekly') {
                    currentStartDate = addWeeks(baseStartDate, i)
                } else if (recurrence === 'biweekly') {
                    currentStartDate = addWeeks(baseStartDate, i * 2)
                }

                const currentEndDate = new Date(currentStartDate.getTime() + duration * 60000)

                appointmentsToCreate.push({
                    patient_id: patientId,
                    therapist_id: therapistId || null,
                    start_time: currentStartDate.toISOString(),
                    end_time: currentEndDate.toISOString(),
                    notes: notes,
                    status: 'scheduled',
                    title: recurrence !== 'none' ? `Sesión ${i + 1}/${count}` : undefined
                })
            }

            const { error } = await supabase.from('appointments').insert(appointmentsToCreate)
            if (error) throw error

            toast.success(recurrence === 'none' ? 'Cita agendada' : `${count} citas agendadas correctamente`)
            router.push('/dashboard/agenda')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
            toast.error('Error al agendar la cita')
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

                {/* Recurrence Options */}
                <div className="bg-blue-50 p-4 rounded-lg space-y-4 border border-blue-100">
                    <div>
                        <Label className="text-blue-900">Repetición</Label>
                        <Select
                            value={recurrence}
                            onValueChange={(val: any) => setRecurrence(val)}
                        >
                            <SelectTrigger className="bg-white border-blue-200">
                                <SelectValue placeholder="Sin repetición" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No repetir (Solo una vez)</SelectItem>
                                <SelectItem value="weekly">Semanalmente (Mismo día/hora)</SelectItem>
                                <SelectItem value="biweekly">Quincenalmente (Cada 2 semanas)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {recurrence !== 'none' && (
                        <div>
                            <Label className="text-blue-900">Cantidad de Sesiones</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input
                                    type="number"
                                    min="2"
                                    max="20"
                                    value={occurrences}
                                    onChange={(e) => setOccurrences(parseInt(e.target.value))}
                                    className="w-24 bg-white border-blue-200"
                                />
                                <span className="text-sm text-blue-700">sesiones en total</span>
                            </div>
                            <p className="text-xs text-blue-600 mt-2">
                                Se crearán {occurrences} citas: {recurrence === 'weekly' ? 'una cada semana' : 'una cada 2 semanas'}.
                            </p>
                        </div>
                    )}
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
                        {recurrence !== 'none'
                            ? `Agendar ${occurrences} Citas`
                            : 'Agendar Cita'}
                    </Button>
                </div>
            </form>
        </div>
    )
}
