import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Users,
  ClipboardList,
  Edit,
  Award,
  Clock,
} from 'lucide-react';
import { TherapistEditForm } from '@/components/therapists/TherapistEditForm';

export const dynamic = 'force-dynamic';

export default async function TherapistDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch therapist details
  const { data: therapist, error } = await supabase
    .from('therapists')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !therapist) {
    notFound();
  }

  // Fetch assigned patients
  const { data: assignments } = await supabase
    .from('therapist_patient_assignments')
    .select(
      `
      *,
      patient:patients(*)
    `
    )
    .eq('therapist_id', id)
    .eq('status', 'active')
    .order('assigned_date', { ascending: false });

  // Fetch appointments count
  const { count: appointmentsCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('therapist_id', id);

  // Fetch sessions count
  const { count: sessionsCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('therapist_id', id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'on_leave':
        return 'De Baja';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          {therapist.avatar_url ? (
            <img
              src={therapist.avatar_url}
              alt={`${therapist.first_name} ${therapist.last_name}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-2xl">
                {therapist.first_name[0]}
                {therapist.last_name[0]}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {therapist.first_name} {therapist.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {therapist.license_number && (
                <span className="text-sm text-gray-600">Lic. {therapist.license_number}</span>
              )}
              <Badge className={getStatusColor(therapist.status)}>
                {getStatusLabel(therapist.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users size={16} />
              Pacientes Asignados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assignments?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar size={16} />
              Total de Citas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{appointmentsCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <ClipboardList size={16} />
              Sesiones Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessionsCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Information and Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {therapist.email && (
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{therapist.email}</p>
                </div>
              </div>
            )}
            {therapist.phone && (
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{therapist.phone}</p>
                </div>
              </div>
            )}
            {therapist.address && (
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Dirección</p>
                  <p className="font-medium">
                    {therapist.address}
                    {therapist.city && `, ${therapist.city}`}
                    {therapist.state && `, ${therapist.state}`}
                    {therapist.postal_code && ` ${therapist.postal_code}`}
                  </p>
                </div>
              </div>
            )}
            {therapist.emergency_contact_name && (
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-600 mb-2">Contacto de Emergencia</p>
                <p className="font-medium">{therapist.emergency_contact_name}</p>
                {therapist.emergency_contact_phone && (
                  <p className="text-sm text-gray-600">{therapist.emergency_contact_phone}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Profesional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {therapist.specialties && therapist.specialties.length > 0 && (
              <div className="flex items-start gap-3">
                <Briefcase size={18} className="text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Especialidades</p>
                  <div className="flex flex-wrap gap-1">
                    {therapist.specialties.map((specialty: string) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {therapist.years_of_experience && (
              <div className="flex items-start gap-3">
                <Award size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Experiencia</p>
                  <p className="font-medium">{therapist.years_of_experience} años</p>
                </div>
              </div>
            )}
            {therapist.hire_date && (
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Contratación</p>
                  <p className="font-medium">
                    {new Date(therapist.hire_date).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
            {therapist.date_of_birth && (
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                  <p className="font-medium">
                    {new Date(therapist.date_of_birth).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {therapist.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{therapist.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Assigned Patients */}
      <Card>
        <CardHeader>
          <CardTitle>Pacientes Asignados</CardTitle>
          <CardDescription>
            {assignments?.length || 0} paciente{assignments?.length !== 1 ? 's' : ''} actualmente
            asignado{assignments?.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {assignments && assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.map((assignment: any) => (
                <Link
                  key={assignment.id}
                  href={`/dashboard/pacientes/${assignment.patient.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">
                        {assignment.patient.first_name} {assignment.patient.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{assignment.patient.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Asignado:{' '}
                        {new Date(assignment.assigned_date).toLocaleDateString('es-MX')}
                        {assignment.is_primary && (
                          <Badge variant="outline" className="ml-2">
                            Principal
                          </Badge>
                        )}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Ver Paciente
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay pacientes asignados</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      <TherapistEditForm therapist={therapist} />
    </div>
  );
}
