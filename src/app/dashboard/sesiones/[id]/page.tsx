import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, User, Stethoscope, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SessionEditForm } from '@/components/sessions/SessionEditForm';

export const dynamic = 'force-dynamic';

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch session details
  const { data: session, error } = await supabase
    .from('sessions')
    .select(
      `
      *,
      patient:patients(id, first_name, last_name, email),
      therapist:therapists(id, first_name, last_name),
      appointment:appointments(id, appointment_date, appointment_time)
    `
    )
    .eq('id', id)
    .single();

  if (error || !session) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/sesiones">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft size={16} />
            Volver
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Detalles de la Sesión</h1>
        <p className="text-gray-600 text-sm mt-1">Notas SOAP y detalles de la sesión clínica</p>
      </div>

      {/* Session Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <User size={18} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Paciente</p>
                <Link
                  href={`/dashboard/pacientes/${session.patient.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {session.patient.first_name} {session.patient.last_name}
                </Link>
              </div>
            </div>

            {session.therapist && (
              <div className="flex items-center gap-3">
                <Stethoscope size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Terapeuta</p>
                  <Link
                    href={`/dashboard/fisioterapeutas/${session.therapist.id}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {session.therapist.first_name} {session.therapist.last_name}
                  </Link>
                </div>
              </div>
            )}

            {session.appointment && (
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Cita</p>
                  <p className="font-medium">
                    {new Date(session.appointment.appointment_date).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {session.appointment.appointment_time && ` - ${session.appointment.appointment_time}`}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <FileText size={18} className="text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Registrado</p>
                <p className="font-medium">
                  {new Date(session.created_at).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {session.pain_level !== null && session.pain_level !== undefined && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-red-600 font-semibold">{session.pain_level}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nivel de Dolor</p>
                  <p className="font-medium">{session.pain_level}/10</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* SOAP Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subjetivo (S)</CardTitle>
            <CardDescription>Síntomas y quejas del paciente</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{session.subjective || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Objetivo (O)</CardTitle>
            <CardDescription>Observaciones y mediciones</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{session.objective || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evaluación (A)</CardTitle>
            <CardDescription>Análisis y diagnóstico</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{session.assessment || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan (P)</CardTitle>
            <CardDescription>Tratamiento y próximos pasos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{session.plan || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      <SessionEditForm session={session} />
    </div>
  );
}
