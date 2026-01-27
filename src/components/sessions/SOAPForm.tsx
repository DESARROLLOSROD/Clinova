'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Activity, Mic, MicOff, Loader2, Sparkles } from 'lucide-react'
import { generateSessionSummaryAction } from '@/app/dashboard/sesiones/actions'
import { BodyMap, type BodyMark } from '@/components/shared/BodyMap'

// Type definition for SpeechRecognition
interface IWindow extends Window {
    webkitSpeechRecognition: any
    SpeechRecognition: any
}

interface SOAPFormProps {
    appointmentId: string
    patientId: string
    patientName: string
}

// Helper component for Voice Input
const VoiceTextarea = ({
    id,
    label,
    placeholder,
    colorClass,
    description,
    onAiEnhance
}: {
    id: string,
    label: string,
    placeholder: string,
    colorClass: string,
    description: string,
    onAiEnhance?: (text: string) => Promise<string | null>
}) => {
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [text, setText] = useState('')
    const [isSupported, setIsSupported] = useState(false)
    const recognitionRef = useRef<any>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const win = window as unknown as IWindow
            if (win.webkitSpeechRecognition || win.SpeechRecognition) {
                setIsSupported(true)
                const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition
                recognitionRef.current = new SpeechRecognition()
                recognitionRef.current.continuous = true
                recognitionRef.current.interimResults = true
                recognitionRef.current.lang = 'es-ES'

                recognitionRef.current.onresult = (event: any) => {
                    let finalTranscript = ''
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript
                        }
                    }
                    if (finalTranscript) {
                        setText(prev => {
                            const newText = prev ? `${prev} ${finalTranscript}` : finalTranscript
                            return newText
                        })
                    }
                }

                recognitionRef.current.onend = () => {
                    setIsListening(false)
                }

                recognitionRef.current.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error)
                    setIsListening(false)
                }
            }
        }
    }, [])

    const toggleListening = () => {
        if (!isSupported) return

        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            recognitionRef.current.start()
            setIsListening(true)
        }
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor={id} className={colorClass}>{label}</Label>
                <div className="flex gap-2">
                    {onAiEnhance && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                                if (!text) return
                                setIsAiLoading(true)
                                const newText = await onAiEnhance(text)
                                if (newText) setText(newText)
                                setIsAiLoading(false)
                            }}
                            disabled={isAiLoading || !text}
                            className="h-7 px-2 gap-1 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                        >
                            {isAiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {isAiLoading ? 'Mejorando...' : 'Mejorar IA'}
                        </Button>
                    )}
                    {isSupported && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={toggleListening}
                            className={`h-7 px-2 gap-1 text-xs transition-all ${isListening
                                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 animate-pulse'
                                : ''
                                }`}
                        >
                            {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                            {isListening ? 'Detener dictado' : 'Dictar'}
                        </Button>
                    )}
                </div>
            </div>
            <p className="text-xs text-gray-500 mb-2">{description}</p>
            <textarea
                name={id}
                id={id}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={`w-full min-h-[120px] rounded-xl border-2 border-gray-100 p-3 text-sm focus:border-blue-500 focus:outline-none transition-colors ${isListening ? 'border-red-200 bg-red-50' : ''}`}
                placeholder={isListening ? 'Escuchando... (habla claro)' : placeholder}
            />
        </div>
    )
}

export function SOAPForm({ appointmentId, patientId, patientName }: SOAPFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [marks, setMarks] = useState<BodyMark[]>([])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const supabase = createClient()
        const formData = new FormData(e.currentTarget)

        const sessionData = {
            appointment_id: appointmentId,
            patient_id: patientId,
            subjective: formData.get('subjective') as string,
            objective: formData.get('objective') as string,
            assessment: formData.get('assessment') as string,
            plan: formData.get('plan') as string,
            pain_level: parseInt(formData.get('pain_level') as string)
        }

        try {
            // 1. Insert session
            const { data: session, error: sessionError } = await supabase
                .from('sessions')
                .insert([sessionData])
                .select()
                .single()

            if (sessionError) throw sessionError

            // 2. Insert body marks if any
            if (marks.length > 0) {
                const marksToInsert = marks.map(m => ({
                    session_id: session.id,
                    patient_id: patientId,
                    x_pos: m.x_pos,
                    y_pos: m.y_pos,
                    side: m.side,
                    mark_type: m.mark_type,
                    notes: m.notes
                }))

                const { error: marksError } = await supabase
                    .from('session_body_marks')
                    .insert(marksToInsert)

                if (marksError) throw marksError
            }

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
                <VoiceTextarea
                    id="subjective"
                    label="Subjetivo (S)"
                    placeholder="El paciente refiere dolor en..."
                    colorClass="text-blue-800"
                    description="Lo que el paciente expresa sobre su condición."
                    onAiEnhance={async (text) => {
                        const { success, data } = await generateSessionSummaryAction(text)
                        return success && data ? data : null
                    }}
                />
                <VoiceTextarea
                    id="objective"
                    label="Objetivo (O)"
                    placeholder="Flexión limitada a 90 grados..."
                    colorClass="text-blue-800"
                    description="Hallazgos físicos, rangos de movimiento, tests."
                />
                <VoiceTextarea
                    id="assessment"
                    label="Análisis (A)"
                    placeholder="Mejoría notable en..."
                    colorClass="text-blue-800"
                    description="Diagnóstico funcional y progreso."
                    onAiEnhance={async (text) => {
                        const { success, data } = await generateSessionSummaryAction(text)
                        return success && data ? data : null
                    }}
                />
                <VoiceTextarea
                    id="plan"
                    label="Plan (P)"
                    placeholder="Ejercicios de fortalecimiento..."
                    colorClass="text-blue-800"
                    description="Tratamiento realizado y tareas futuras."
                />
            </div>

            <div className="border-y py-6 bg-slate-50/50 -mx-8 px-8">
                <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
                    <Activity className="text-blue-600" size={20} />
                    Evaluación Visual del Cuerpo
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    Marca los puntos de dolor, tensión o lesiones detectadas en la sesión.
                </p>
                <div className="bg-white rounded-xl border p-4 shadow-sm">
                    <BodyMap
                        onMarksChange={setMarks}
                        initialMarks={marks}
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

