'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Edit, Save } from 'lucide-react';
import { Therapist } from '@/types/therapist';

interface TherapistEditFormProps {
  therapist: Therapist;
}

export function TherapistEditForm({ therapist }: TherapistEditFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<string[]>(therapist.specialties || []);
  const [currentSpecialty, setCurrentSpecialty] = useState('');

  const addSpecialty = () => {
    if (currentSpecialty.trim() && !specialties.includes(currentSpecialty.trim())) {
      setSpecialties([...specialties, currentSpecialty.trim()]);
      setCurrentSpecialty('');
    }
  };

  const removeSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter((s) => s !== specialty));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      date_of_birth: formData.get('date_of_birth') as string || null,
      gender: formData.get('gender') as string || null,
      license_number: formData.get('license_number') as string || null,
      specialties: specialties.length > 0 ? specialties : null,
      years_of_experience: formData.get('years_of_experience')
        ? parseInt(formData.get('years_of_experience') as string)
        : null,
      address: formData.get('address') as string || null,
      city: formData.get('city') as string || null,
      state: formData.get('state') as string || null,
      postal_code: formData.get('postal_code') as string || null,
      emergency_contact_name: formData.get('emergency_contact_name') as string || null,
      emergency_contact_phone: formData.get('emergency_contact_phone') as string || null,
      status: formData.get('status') as string,
      hire_date: formData.get('hire_date') as string || null,
      notes: formData.get('notes') as string || null,
    };

    try {
      const { error } = await supabase
        .from('therapists')
        .update(updatedData)
        .eq('id', therapist.id);

      if (error) throw error;

      setIsEditing(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isEditing) {
    return (
      <div className="flex justify-end">
        <Button onClick={() => setIsEditing(true)} className="gap-2">
          <Edit size={18} />
          Editar Información
        </Button>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Información del Fisioterapeuta</CardTitle>
        <CardDescription>Actualiza los datos del fisioterapeuta</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  defaultValue={therapist.first_name}
                />
              </div>
              <div>
                <Label htmlFor="last_name">Apellidos *</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  required
                  defaultValue={therapist.last_name}
                />
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  defaultValue={therapist.email}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" defaultValue={therapist.phone || ''} />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                <Input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  defaultValue={therapist.date_of_birth || ''}
                />
              </div>
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select name="gender" defaultValue={therapist.gender || undefined}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Información Profesional */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Información Profesional</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="license_number">Número de Licencia</Label>
                <Input
                  id="license_number"
                  name="license_number"
                  defaultValue={therapist.license_number || ''}
                />
              </div>
              <div>
                <Label htmlFor="years_of_experience">Años de Experiencia</Label>
                <Input
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  min="0"
                  defaultValue={therapist.years_of_experience || ''}
                />
              </div>
              <div>
                <Label htmlFor="hire_date">Fecha de Contratación</Label>
                <Input
                  id="hire_date"
                  name="hire_date"
                  type="date"
                  defaultValue={therapist.hire_date || ''}
                />
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select name="status" defaultValue={therapist.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="on_leave">De Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Especialidades */}
            <div className="mt-4">
              <Label htmlFor="specialty_input">Especialidades</Label>
              <div className="flex gap-2">
                <Input
                  id="specialty_input"
                  value={currentSpecialty}
                  onChange={(e) => setCurrentSpecialty(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSpecialty();
                    }
                  }}
                  placeholder="Agregar especialidad"
                />
                <Button type="button" onClick={addSpecialty} size="icon">
                  <Plus size={18} />
                </Button>
              </div>
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="gap-1">
                      {specialty}
                      <button
                        type="button"
                        onClick={() => removeSpecialty(specialty)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dirección */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Dirección</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" defaultValue={therapist.address || ''} />
              </div>
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" defaultValue={therapist.city || ''} />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" defaultValue={therapist.state || ''} />
              </div>
              <div>
                <Label htmlFor="postal_code">Código Postal</Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  defaultValue={therapist.postal_code || ''}
                />
              </div>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div>
            <h3 className="text-sm font-semibold mb-4">Contacto de Emergencia</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="emergency_contact_name">Nombre</Label>
                <Input
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  defaultValue={therapist.emergency_contact_name || ''}
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                <Input
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  defaultValue={therapist.emergency_contact_phone || ''}
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea id="notes" name="notes" rows={4} defaultValue={therapist.notes || ''} />
          </div>

          {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>}

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsEditing(false);
                setSpecialties(therapist.specialties || []);
                setError(null);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save size={18} />
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
