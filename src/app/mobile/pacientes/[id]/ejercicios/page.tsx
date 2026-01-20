import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { PlayCircle, Clock, Calendar, CheckCircle, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

interface Props {
    params: Promise<{
        id: string; // Patient ID
    }>;
}

export default async function PatientExercisesMobilePage({ params }: Props) {
    const supabase = await createClient();
    const { id } = await params;

    // 1. Obtener Info del Paciente
    const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('first_name, last_name')
        .eq('id', id)
        .single();

    if (patientError || !patient) {
        notFound();
    }

    // 2. Obtener Prescripciones Activas
    const { data: prescriptions, error: prescriptionsError } = await supabase
        .from('patient_exercise_prescriptions')
        .select(
            `
      *,
      exercise_library (
        id,
        name,
        description,
        video_url,
        image_url,
        difficulty,
        body_part
      )
    `
        )
        .eq('patient_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (prescriptionsError) {
        console.error('Error loading exercises:', prescriptionsError);
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header Móvil */}
            <header className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 rounded-lg p-1.5">
                        <Dumbbell className="text-white h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-gray-900 leading-tight">Tu Plan Clinova</h1>
                        <p className="text-xs text-gray-500">Hola, {patient.first_name}</p>
                    </div>
                </div>
            </header>

            <main className="px-4 py-4 space-y-4">
                {/* Banner de Progreso (Simulado para engagement) */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <p className="font-medium text-blue-100 text-xs uppercase tracking-wide">Tu racha</p>
                            <p className="text-2xl font-bold">3 Días 🔥</p>
                        </div>
                        <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                            <CheckCircle size={16} />
                        </div>
                    </div>
                    <p className="text-sm text-blue-100">¡Sigue así! Tu recuperación va por buen camino.</p>
                </div>

                <h2 className="text-lg font-bold text-gray-800 mt-6">Tus Ejercicios de Hoy</h2>

                {/* Lista de Ejercicios */}
                {!prescriptions || prescriptions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Dumbbell className="text-gray-400" />
                        </div>
                        <h3 className="font-medium text-gray-900">Sin ejercicios asignados</h3>
                        <p className="text-sm text-gray-500 px-6 mt-1">
                            Tu fisioterapeuta aún no te ha asignado ejercicios activos.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {prescriptions.map((p) => (
                            <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Video/Image Area */}
                                <div className="aspect-video bg-gray-100 relative">
                                    {p.exercise_library.image_url ? (
                                        <img
                                            src={p.exercise_library.image_url}
                                            alt={p.exercise_library.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                            <Dumbbell className="text-gray-400 h-10 w-10" />
                                        </div>
                                    )}
                                    {p.exercise_library.video_url && (
                                        <a
                                            href={p.exercise_library.video_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
                                        >
                                            <div className="bg-white/90 p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                <PlayCircle className="text-blue-600 fill-blue-600/10" size={32} />
                                            </div>
                                        </a>
                                    )}
                                </div>

                                {/* Info Content */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">
                                            {p.exercise_library.name}
                                        </h3>
                                        <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                                            {p.exercise_library.body_part}
                                        </span>
                                    </div>

                                    {/* Metadatos (Series/Reps) */}
                                    <div className="flex gap-3 text-sm text-gray-600 my-3 bg-gray-50 p-3 rounded-xl">
                                        {p.sets && (
                                            <div className="flex-1 text-center border-r border-gray-200 last:border-0">
                                                <span className="block font-bold text-gray-900">{p.sets}</span>
                                                <span className="text-xs">Series</span>
                                            </div>
                                        )}
                                        {p.repetitions && (
                                            <div className="flex-1 text-center border-r border-gray-200 last:border-0">
                                                <span className="block font-bold text-gray-900">{p.repetitions}</span>
                                                <span className="text-xs">Reps</span>
                                            </div>
                                        )}
                                        {p.duration_minutes && (
                                            <div className="flex-1 text-center">
                                                <span className="block font-bold text-gray-900">{p.duration_minutes}m</span>
                                                <span className="text-xs">Tiempo</span>
                                            </div>
                                        )}
                                    </div>

                                    {p.instructions && (
                                        <p className="text-sm text-gray-600 bg-blue-50/50 p-3 rounded-lg mb-4">
                                            💡 {p.instructions}
                                        </p>
                                    )}

                                    <Button className="w-full rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-md">
                                        Marcar como Realizado
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
