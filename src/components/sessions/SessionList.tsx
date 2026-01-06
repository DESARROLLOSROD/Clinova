'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Stethoscope, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SessionListProps {
  initialSessions: any[];
  patients: any[];
  therapists: any[];
}

export function SessionList({ initialSessions, patients, therapists }: SessionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('all');
  const [selectedTherapist, setSelectedTherapist] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filter sessions
  const filteredSessions = initialSessions.filter((session) => {
    const patientName =
      `${session.patient?.first_name || ''} ${session.patient?.last_name || ''}`.toLowerCase();
    const therapistName =
      `${session.therapist?.first_name || ''} ${session.therapist?.last_name || ''}`.toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      patientName.includes(search) ||
      therapistName.includes(search) ||
      session.subjective?.toLowerCase().includes(search) ||
      session.objective?.toLowerCase().includes(search) ||
      session.assessment?.toLowerCase().includes(search);

    const matchesPatient = selectedPatient === 'all' || session.patient_id === selectedPatient;
    const matchesTherapist =
      selectedTherapist === 'all' || session.therapist_id === selectedTherapist;

    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(session.created_at) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(session.created_at) <= new Date(dateTo);
    }

    return matchesSearch && matchesPatient && matchesTherapist && matchesDate;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedPatient('all');
    setSelectedTherapist('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar en notas, paciente o terapeuta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="patient">Paciente</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger id="patient">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="therapist">Terapeuta</Label>
              <Select value={selectedTherapist} onValueChange={setSelectedTherapist}>
                <SelectTrigger id="therapist">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {therapists.map((therapist) => (
                    <SelectItem key={therapist.id} value={therapist.id}>
                      {therapist.first_name} {therapist.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpiar Filtros
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <Label htmlFor="dateFrom">Desde</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Hasta</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {filteredSessions.length} sesión{filteredSessions.length !== 1 ? 'es' : ''} encontrada
        {filteredSessions.length !== 1 ? 's' : ''}
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              {searchTerm ||
              selectedPatient !== 'all' ||
              selectedTherapist !== 'all' ||
              dateFrom ||
              dateTo
                ? 'No se encontraron sesiones con los filtros aplicados.'
                : 'No hay sesiones registradas.'}
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Link key={session.id} href={`/dashboard/sesiones/${session.id}`}>
              <Card className="hover:shadow-md transition-all hover:border-blue-200 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="font-semibold text-gray-900">
                            {session.patient?.first_name} {session.patient?.last_name}
                          </span>
                        </div>

                        {session.therapist && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Stethoscope size={14} className="text-gray-400" />
                            <span>
                              {session.therapist.first_name} {session.therapist.last_name}
                            </span>
                          </div>
                        )}

                        {session.appointment?.appointment_date && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar size={14} className="text-gray-400" />
                            <span>
                              {new Date(session.appointment.appointment_date).toLocaleDateString(
                                'es-MX'
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* SOAP Notes Preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Subjetivo</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {session.subjective || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Objetivo</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {session.objective || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Evaluación</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {session.assessment || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Plan</p>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {session.plan || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                        {session.pain_level !== null && session.pain_level !== undefined && (
                          <Badge variant="outline">Dolor: {session.pain_level}/10</Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          Registrado el{' '}
                          {new Date(session.created_at).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Eye size={16} />
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
