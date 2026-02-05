'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Activity, Mic, MicOff, Loader2, Sparkles, Camera, Dumbbell, X } from 'lucide-react'
import { generateSessionSummaryAction } from '@/app/dashboard/sesiones/actions'
import { BodyMap, type BodyMark } from '@/components/shared/BodyMap'
import { TemplateSelector } from '@/components/dashboard/consultations/TemplateSelector'
import { SessionPhotoUpload } from '@/components/dashboard/consultations/SessionPhotoUpload'
import { ExerciseSelector } from '@/components/dashboard/consultations/ExerciseSelector'

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
    value,
    onChange,
    onAiEnhance
}: {
    id: string,
    label: string,
    placeholder: string,
    colorClass: string,
    description: string,
    value: string,
    onChange: (value: string) => void,
    onAiEnhance?: (text: string) => Promise<string | null>
}) => {
    const [isAiLoading, setIsAiLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
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
                        onChange(value ? `${value} ${finalTranscript}` : finalTranscript)
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
    }, [value, onChange]) // Added dependencies

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
                                if (!value) return
                                setIsAiLoading(true)
                                const newText = await onAiEnhance(value)
                                if (newText) onChange(newText)
                                setIsAiLoading(false)
                            }}
                            disabled={isAiLoading || !value}
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
                value={value}
                onChange={(e) => onChange(e.target.value)}
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
    const [photos, setPhotos] = useState<{ path: string; name: string; type: string; size: number }[]>([])
    const [prescribedExercises, setPrescribedExercises] = useState<any[]>([])

    // SOAP State
    const [subjective, setSubjective] = useState('')
    const [objective, setObjective] = useState('')
    const [assessment, setAssessment] = useState('')
    const [plan, setPlan] = useState('')

    const handleTemplateSelect = (template: any) => {
        if (template.subjective) setSubjective(prev => prev ? `${prev}\n${template.subjective}` : template.subjective)
        if (template.objective) setObjective(prev => prev ? `${prev}\n${template.objective}` : template.objective)
        if (template.assessment) setAssessment(prev => prev ? `${prev}\n${template.assessment}` : template.assessment)
        if (template.plan) setPlan(prev => prev ? `${prev}\n${template.plan}` : template.plan)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        const supabase = createClient()
        const formData = new FormData(e.currentTarget)

        const sessionData = {
            appointment_id: appointmentId,
            patient_id: patientId,
            subjective: subjective,
            objective: objective,
            assessment: assessment,
            plan: plan,
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

            // 3. Insert photos (documents) if any
            if (photos.length > 0) {
                const { data: user } = await supabase.auth.getUser()
                const clinicId = user.user?.user_metadata?.clinic_id // Assuming clinic_id is in metadata

                // Fallback if clinic_id not in metadata: fetch from profile
                let finalClinicId = clinicId
                if (!finalClinicId) {
                    const { data: profile } = await supabase.from('user_profiles').select('clinic_id').eq('id', user.user?.id).single()
                    finalClinicId = profile?.clinic_id
                }

                if (finalClinicId) {
                    const docsToInsert = photos.map(p => ({
                        patient_id: patientId,
                        session_id: session.id,
                        clinic_id: finalClinicId,
                        file_name: p.name,
                        file_type: 'image',
                        file_size_bytes: p.size,
                        storage_path: p.path,
                        mime_type: p.type,
                        document_type: 'foto_sesion',
                        description: 'Foto tomada durante la sesión',
                        uploaded_by: user.user?.id
                    }))

                    const { error: docsError } = await supabase
                        .from('patient_documents')
                        .insert(docsToInsert)

                    if (docsError) throw docsError
                }
            }

            // 4. Create Prescription if exercises added
            if (prescribedExercises.length > 0) {
                const { data: user } = await supabase.auth.getUser()

                // Create Prescription Header
                const { data: prescription, error: prescError } = await supabase
                    .from('patient_prescriptions')
                    .insert({
                        patient_id: patientId,
                        therapist_id: user.user?.id,
                        status: 'active',
                        session_id: session.id,
                        general_notes: 'Recetado durante la sesión'
                    })
                    .select()
                    .single()

                if (prescError) throw prescError

                // Create Prescription Items
                const itemsToInsert = prescribedExercises.map(ex => ({
                    prescription_id: prescription.id,
                    exercise_id: ex.id,
                    sets: ex.sets,
                    reps: ex.reps,
                    frequency: ex.frequency,
                    duration: ex.duration,
                    specific_notes: ex.notes
                }))

                const { error: itemsError } = await supabase
                    .from('prescription_items')
                    .insert(itemsToInsert)

                if (itemsError) throw itemsError
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
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" type="button" onClick={() => router.back()}>
                        <ArrowLeft size={16} />
                    </Button>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Nota de Evolución (SOAP)</h2>
                        <p className="text-sm text-gray-500">Paciente: {patientName}</p>
                    </div>
                </div>
                <TemplateSelector onSelect={handleTemplateSelect} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VoiceTextarea
                    id="subjective"
                    label="Subjetivo (S)"
                    placeholder="El paciente refiere dolor en..."
                    colorClass="text-blue-800"
                    description="Lo que el paciente expresa sobre su condición."
                    value={subjective}
                    onChange={setSubjective}
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
                    value={objective}
                    onChange={setObjective}
                />
                <VoiceTextarea
                    id="assessment"
                    label="Análisis (A)"
                    placeholder="Mejoría notable en..."
                    colorClass="text-blue-800"
                    description="Diagnóstico funcional y progreso."
                    value={assessment}
                    onChange={setAssessment}
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
                    value={plan}
                    onChange={setPlan}
                />
            </div>



            <div className="border-y py-6 bg-slate-50/50 -mx-8 px-8 space-y-6">
                <div>
                    <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                        <Camera className="text-blue-600" size={20} />
                        Evidencia Fotográfica
                    </h3>
                    <SessionPhotoUpload onPhotosChange={setPhotos} />
                </div>

                <div>
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

            {/* Exercise Prescription Section */}
            <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium flex items-center gap-2 text-blue-900">
                        <Dumbbell className="text-blue-600" size={20} />
                        Prescripción de Ejercicios
                    </h3>
                    <ExerciseSelector onSelect={(ex) => {
                        const newEx = {
                            id: ex.id,
                            name: ex.name,
                            sets: 3,
                            reps: 10,
                            frequency: 'Diario',
                            duration: '',
                            notes: ''
                        }
                        setPrescribedExercises([...prescribedExercises, newEx])
                    }} />
                </div>

                {prescribedExercises.length === 0 ? (
                    <p className="text-sm text-blue-400 text-center py-4 border-2 border-dashed border-blue-200 rounded-lg">
                        No hay ejercicios recetados para esta sesión.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {prescribedExercises.map((ex, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 relative group">
                                <button type="button" onClick={() => {
                                    setPrescribedExercises(prescribedExercises.filter((_, i) => i !== idx))
                                }} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                    <X size={16} />
                                </button>
                                <h4 className="font-medium text-gray-900 mb-2">{ex.name}</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Series</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm border rounded px-2 py-1"
                                            value={ex.sets}
                                            onChange={(e) => {
                                                const newExs = [...prescribedExercises]
                                                newExs[idx].sets = parseInt(e.target.value) || 0
                                                setPrescribedExercises(newExs)
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Repeticiones</label>
                                        <input
                                            type="number"
                                            className="w-full text-sm border rounded px-2 py-1"
                                            value={ex.reps}
                                            onChange={(e) => {
                                                const newExs = [...prescribedExercises]
                                                newExs[idx].reps = parseInt(e.target.value) || 0
                                                setPrescribedExercises(newExs)
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Frecuencia</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm border rounded px-2 py-1"
                                            value={ex.frequency}
                                            onChange={(e) => {
                                                const newExs = [...prescribedExercises]
                                                newExs[idx].frequency = e.target.value
                                                setPrescribedExercises(newExs)
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Notas</label>
                                        <input
                                            type="text"
                                            className="w-full text-sm border rounded px-2 py-1"
                                            placeholder="Opcional"
                                            value={ex.notes}
                                            onChange={(e) => {
                                                const newExs = [...prescribedExercises]
                                                newExs[idx].notes = e.target.value
                                                setPrescribedExercises(newExs)
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex justify-end pt-6 border-t border-gray-100">
                <Button type="submit" size="lg" isLoading={isLoading}>
                    Guardar Sesión
                </Button>
            </div>
        </form >
    )
}

