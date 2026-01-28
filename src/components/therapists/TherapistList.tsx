'use client';

import React, { useState } from 'react';
import { Therapist } from '@/types/therapist';
import Link from 'next/link';
import { Eye, Mail, Phone, Users, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface TherapistListProps {
  initialTherapists: any[];
}

export function TherapistList({ initialTherapists }: TherapistListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter therapists based on search term
  const filteredTherapists = initialTherapists.filter((therapist) => {
    const fullName = `${therapist.first_name} ${therapist.last_name}`.toLowerCase();
    const email = therapist.email?.toLowerCase() || '';
    const license = therapist.license_number?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || email.includes(search) || license.includes(search);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
      case 'on_leave':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 transition-colors">
        <Input
          type="text"
          placeholder="Buscar por nombre, email o licencia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {filteredTherapists.length} fisioterapeuta{filteredTherapists.length !== 1 ? 's' : ''} encontrado{filteredTherapists.length !== 1 ? 's' : ''}
      </div>

      {/* Therapist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-12 text-center text-gray-500 dark:text-gray-400">
            {searchTerm ? 'No se encontraron fisioterapeutas.' : 'No hay fisioterapeutas registrados.'}
          </div>
        ) : (
          filteredTherapists.map((therapist) => (
            <Link
              key={therapist.id}
              href={`/dashboard/fisioterapeutas/${therapist.id}`}
              className="block"
            >
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-800">
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {therapist.avatar_url ? (
                      <img
                        src={therapist.avatar_url}
                        alt={`${therapist.first_name} ${therapist.last_name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-lg">
                          {therapist.first_name[0]}{therapist.last_name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {therapist.first_name} {therapist.last_name}
                      </h3>
                      {therapist.license_number && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Lic. {therapist.license_number}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(therapist.status)}>
                    {getStatusLabel(therapist.status)}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  {therapist.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail size={14} className="text-gray-400 dark:text-gray-500" />
                      <span className="truncate">{therapist.email}</span>
                    </div>
                  )}
                  {therapist.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone size={14} className="text-gray-400 dark:text-gray-500" />
                      <span>{therapist.phone}</span>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {therapist.specialties && therapist.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <Briefcase size={12} />
                      <span>Especialidades</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialties.slice(0, 3).map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                      {therapist.specialties.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded">
                          +{therapist.specialties.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Patient Count */}
                {/* Actions */}
                <div className="mt-4 flex items-center justify-between text-sm pt-4 border-t border-gray-100 dark:border-gray-800">
                  {/* Status/Auth Indicator */}
                  <div>
                    {therapist.auth_user_id ? (
                      <span className="flex items-center text-green-600 dark:text-green-500 text-xs gap-1">
                        <Users size={12} />
                        Acceso Habilitado
                      </span>
                    ) : (
                      <InviteButton therapistId={therapist.id} />
                    )}
                  </div>

                  <div className="flex items-center text-blue-600 dark:text-blue-400">
                    <Eye size={16} className="mr-1" />
                    Ver Detalles
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function InviteButton({ therapistId }: { therapistId: string }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleInvite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation();

    if (!confirm('¿Estás seguro de querer dar acceso y enviar invitación a este fisioterapeuta?')) return;

    setLoading(true);
    try {
      const { inviteTherapist } = await import('@/app/actions/therapistActions');
      const result = await inviteTherapist(therapistId);

      if (result.success) {
        alert('Invitación enviada correctamente');
        setSent(true);
      } else {
        alert('Error al enviar invitación: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <span className="flex items-center text-green-600 text-xs gap-1">
        <Mail size={12} />
        Enviado
      </span>
    );
  }

  return (
    <button
      onClick={handleInvite}
      disabled={loading}
      className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded transition-colors disabled:opacity-50"
    >
      <Mail size={12} />
      {loading ? 'Enviando...' : 'Dar Acceso'}
    </button>
  );
}
