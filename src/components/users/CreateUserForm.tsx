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
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

  const generatePassword = () => {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%&*';
    const all = upper + lower + digits + symbols;
    // Ensure at least one of each type
    let pwd = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];
    for (let i = pwd.length; i < 12; i++) {
      pwd.push(all[Math.floor(Math.random() * all.length)]);
    }
    // Shuffle
    for (let i = pwd.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
    }
    const generated = pwd.join('');
    setPassword(generated);
    setConfirmPassword(generated);
    setGeneratedPassword(generated);
    setCopied(false);
  };

  const copyPassword = async () => {
    if (generatedPassword) {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const { profile } = useUser(); // Get current user profile
  const [clinics, setClinics] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');

  // Therapist list for patient assignment
  const [therapists, setTherapists] = useState<Array<{ id: string; first_name: string; last_name: string }>>([]);

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
      // Validate password
      if (!password) {
        setError('La contraseña es obligatoria');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setIsSubmitting(false);
        return;
      }

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
          password,
          sendInvite: false,
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
      setPassword('');
      setConfirmPassword('');
      setGeneratedPassword(null);

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

        {/* Password */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Contraseña de Acceso</h3>
            <button
              type="button"
              onClick={generatePassword}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Generar Contraseña Segura
            </button>
          </div>

          {generatedPassword && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <code className="flex-1 text-sm font-mono font-bold text-green-800 select-all">
                {generatedPassword}
              </code>
              <button
                type="button"
                onClick={copyPassword}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                {copied ? 'Copiada!' : 'Copiar'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setGeneratedPassword(null); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setGeneratedPassword(null); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            El usuario podrá iniciar sesión con su email y esta contraseña.
          </p>
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
