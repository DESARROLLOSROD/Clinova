'use client';

import { useState } from 'react';
import { UserRole } from '@/types/roles';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/contexts/UserContext';

interface CreateUserFormProps {
  onSuccess?: (userId: string, role: UserRole) => void;
  onCancel?: () => void;
  defaultRole?: UserRole;
  hideRoleSelection?: boolean;
}

export default function CreateUserForm({
  onSuccess,
  onCancel,
  defaultRole,
  hideRoleSelection = false,
}: CreateUserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Basic fields
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>(defaultRole || UserRole.THERAPIST);
  const [sendInvite, setSendInvite] = useState(true);

  // Therapist-specific fields
  const [phone, setPhone] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | 'on_leave'>('active');

  // Address fields (shared for Patient and Therapist)
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Patient-specific fields
  const [dateOfBirth, setDateOfBirth] = useState('');
  // address is now shared
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [primaryTherapistId, setPrimaryTherapistId] = useState('');

  const { profile } = useUser(); // Get current user profile
  const [clinics, setClinics] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');

  // Load therapists when patient role is selected
  useState(() => {
    if (role === UserRole.PATIENT) {
      loadTherapists();
    }
    // Load clinics if super admin
    if (profile?.role === UserRole.SUPER_ADMIN) {
      loadClinics();
    }
  });

  const loadClinics = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('clinics')
      .select('id, name')
      .order('name');

    if (data) {
      setClinics(data);
    }
  };

  const loadTherapists = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from('therapists')
      .select('id, first_name, last_name')
      .eq('status', 'active')
      // If clinic selected, filter by it (optional enhancement)
      .psi_filter_placeholder_ // Placeholder to keep logic simple for now
      .order('first_name');

    if (data) {
      setTherapists(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // Prepare additional data based on role
      let additionalData: any = {
        clinic_id: selectedClinicId || undefined // Include selected clinic if available
      };

      switch (role) {
        case UserRole.THERAPIST:
          additionalData = {
            ...additionalData,
            phone: phone || null,
            specialization: specialization || null,
            license_number: licenseNumber || null,
            address: address || null,
            city: city || null,
            state: state || null,
            postal_code: postalCode || null,
            status,
          };
          break;

        case UserRole.PATIENT:
          additionalData = {
            ...additionalData,
            phone: phone || null,
            date_of_birth: dateOfBirth || null,
            address: address || null,
            emergency_contact_name: emergencyContactName || null,
            emergency_contact_phone: emergencyContactPhone || null,
            medical_history: medicalHistory || null,
            primary_therapist_id: primaryTherapistId || null,
          };
          break;

        case UserRole.CLINIC_MANAGER:
        case UserRole.RECEPTIONIST:
          additionalData = {
            ...additionalData,
            phone: phone || null,
          };
          break;
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          role,
          sendInvite,
          additionalData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      setSuccess(data.message || 'Usuario creado exitosamente');

      // Reset form
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('');
      setSpecialization('');
      setLicenseNumber('');
      setDateOfBirth('');
      setAddress('');
      setEmergencyContactName('');
      setEmergencyContactPhone('');
      setMedicalHistory('');
      setPrimaryTherapistId('');

      if (onSuccess) {
        onSuccess(data.userId, role);
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleLabel = (role: UserRole): string => {
    const labels: Record<UserRole, string> = {
      [UserRole.SUPER_ADMIN]: 'Super Administrador',
      [UserRole.CLINIC_MANAGER]: 'Encargado de Clínica',
      [UserRole.THERAPIST]: 'Fisioterapeuta',
      [UserRole.RECEPTIONIST]: 'Recepcionista',
      [UserRole.PATIENT]: 'Paciente',
    };
    return labels[role];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Crear Nuevo Usuario</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Role Selection */}
        {!hideRoleSelection && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Usuario *
            </label>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                if (e.target.value === UserRole.PATIENT) {
                  loadTherapists();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.values(UserRole).map((r) => (
                <option key={r} value={r}>
                  {getRoleLabel(r)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Clinic Selection (Super Admin only) */}
        {profile?.role === UserRole.SUPER_ADMIN && clinics.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asignar a Clínica *
            </label>
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar clínica...</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Therapist-specific fields */}
        {role === UserRole.THERAPIST && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Información del Fisioterapeuta</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especialización
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Ortopedia, Neurología..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Licencia
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'on_leave')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="on_leave">De Baja</option>
              </select>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Dirección & Contacto</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Calle, número, colonia"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      C.P.
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Patient-specific fields */}
        {role === UserRole.PATIENT && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Información del Paciente</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fisioterapeuta Principal
              </label>
              <select
                value={primaryTherapistId}
                onChange={(e) => setPrimaryTherapistId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar fisioterapeuta...</option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.first_name} {therapist.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contacto de Emergencia (Nombre)
                </label>
                <input
                  type="text"
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contacto de Emergencia (Teléfono)
                </label>
                <input
                  type="tel"
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Historia Médica
              </label>
              <textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Condiciones médicas, alergias, medicamentos..."
              />
            </div>
          </div>
        )}

        {/* Send Invite Option */}
        <div className="mt-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={sendInvite}
              onChange={(e) => setSendInvite(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Enviar email de invitación para configurar contraseña
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creando...' : 'Crear Usuario'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
