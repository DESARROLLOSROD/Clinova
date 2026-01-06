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
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <Input
          type="text"
          placeholder="Buscar por nombre, email o licencia..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredTherapists.length} fisioterapeuta{filteredTherapists.length !== 1 ? 's' : ''} encontrado{filteredTherapists.length !== 1 ? 's' : ''}
      </div>

      {/* Therapist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTherapists.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
            {searchTerm ? 'No se encontraron fisioterapeutas.' : 'No hay fisioterapeutas registrados.'}
          </div>
        ) : (
          filteredTherapists.map((therapist) => (
            <Link
              key={therapist.id}
              href={`/dashboard/fisioterapeutas/${therapist.id}`}
              className="block"
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all hover:border-blue-200">
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
                        <span className="text-blue-600 font-semibold text-lg">
                          {therapist.first_name[0]}{therapist.last_name[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {therapist.first_name} {therapist.last_name}
                      </h3>
                      {therapist.license_number && (
                        <p className="text-xs text-gray-500">Lic. {therapist.license_number}</p>
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
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{therapist.email}</span>
                    </div>
                  )}
                  {therapist.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      <span>{therapist.phone}</span>
                    </div>
                  )}
                </div>

                {/* Specialties */}
                {therapist.specialties && therapist.specialties.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Briefcase size={12} />
                      <span>Especialidades</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialties.slice(0, 3).map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded"
                        >
                          {specialty}
                        </span>
                      ))}
                      {therapist.specialties.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded">
                          +{therapist.specialties.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Patient Count */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} className="text-gray-400" />
                    <span>
                      {therapist.therapist_patient_assignments?.[0]?.count || 0} paciente
                      {(therapist.therapist_patient_assignments?.[0]?.count || 0) !== 1 ? 's' : ''} asignado
                      {(therapist.therapist_patient_assignments?.[0]?.count || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="mt-4 flex items-center justify-end text-sm text-blue-600">
                  <Eye size={16} className="mr-1" />
                  Ver Detalles
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
