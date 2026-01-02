'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft } from 'lucide-react'

interface SOAPFormProps {
    appointmentId: string
    patientName: string
}

export function SOAPForm({ appointmentId, patientName }: SOAPFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const supabase = createClient()
        const formData = new FormData(e.currentTarget)

        const sessionData = {
            appointment_id: appointmentId,
            subjective: formData.get('subjective') as string,
            objective: formData.get('objective') as string,
            assessment: formData.get('assessment') as string,
            plan: formData.get('plan') as string,
            pain_level: parseInt(formData.get('pain_level') as string)
        }

        try {
            const { error: sessionError } = await supabase.from('sessions').insert([sessionData])
            if (sessionError) throw sessionError

            // Mark appointment as completed
            await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId)

            router.push('/dashboard/agenda')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="sm" type="button" onClick={() => router.back()}>
                    <ArrowLeft size={16} />
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Nota de Evolución (SOAP)</h2>
                    <p className="text-sm text-gray-500">Paciente: {patientName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="subjective" className="text-blue-800">Subjetivo (S)</Label>
                    <p className="text-xs text-gray-500 mb-2">Lo que el paciente expresa sobre su condición.</p>
                    <textarea
                        name="subjective"
                        id="subjective"
                        required
                        className="w-full min-h-[120px] rounded-xl border-2 border-gray-100 p-3 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="El paciente refiere dolor en..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="objective" className="text-blue-800">Objetivo (O)</Label>
                    <p className="text-xs text-gray-500 mb-2">Hallazgos físicos, rangos de movimiento, tests.</p>
                    <textarea
                        name="objective"
                        id="objective"
                        required
                        className="w-full min-h-[120px] rounded-xl border-2 border-gray-100 p-3 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="Flexión limitada a 90 grados..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="assessment" className="text-blue-800">Análisis (A)</Label>
                    <p className="text-xs text-gray-500 mb-2">Diagnóstico funcional y progreso.</p>
                    <textarea
                        name="assessment"
                        id="assessment"
                        required
                        className="w-full min-h-[120px] rounded-xl border-2 border-gray-100 p-3 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="Mejoría notable en..."
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="plan" className="text-blue-800">Plan (P)</Label>
                    <p className="text-xs text-gray-500 mb-2">Tratamiento realizado y tareas futuras.</p>
                    <textarea
                        name="plan"
                        id="plan"
                        required
                        className="w-full min-h-[120px] rounded-xl border-2 border-gray-100 p-3 text-sm focus:border-blue-500 focus:outline-none"
                        placeholder="Ejercicios de fortalecimiento..."
                    />
                </div>
            </div>

            <div className="max-w-xs">
                <Label htmlFor="pain_level">Nivel de Dolor (EVA 0-10)</Label>
                <div className="flex items-center gap-4 mt-2">
                    <input
                        type="range"
                        min="0"
                        max="10"
                        name="pain_level"
                        id="pain_level"
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        defaultValue="0"
                        onInput={(e) => {
                            const val = (e.target as HTMLInputElement).value
                            document.getElementById('pain-val')!.innerText = val
                        }}
                    />
                    <span id="pain-val" className="text-xl font-bold text-gray-700 w-8">0</span>
                </div>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex justify-end pt-6 border-t border-gray-100">
                <Button type="submit" size="lg" isLoading={isLoading}>
                    Guardar Sesión
                </Button>
            </div>
        </form>
    )
}
