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
import { X, Plus } from 'lucide-react';

export default function NewTherapistPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<string[]>([]);
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
    const therapistData = {
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
      status: formData.get('status') as string || 'active',
      hire_date: formData.get('hire_date') as string || null,
      notes: formData.get('notes') as string || null,
    };

    try {
      const { error } = await supabase.from('therapists').insert([therapistData]);
      if (error) throw error;

      router.push('/dashboard/fisioterapeutas');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Registrar Nuevo Fisioterapeuta</h1>
        <p className="text-gray-600 text-sm">Ingresa los datos del fisioterapeuta.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Datos básicos del fisioterapeuta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="first_name">Nombre *</Label>
                <Input id="first_name" name="first_name" required placeholder="Ej. María" />
              </div>
              <div>
                <Label htmlFor="last_name">Apellidos *</Label>
                <Input id="last_name" name="last_name" required placeholder="Ej. García" />
              </div>
              <div>
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="maria@clinova.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" placeholder="55 1234 5678" />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                <Input id="date_of_birth" name="date_of_birth" type="date" />
              </div>
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select name="gender">
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
          </CardContent>
        </Card>

        {/* Información Profesional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Profesional</CardTitle>
            <CardDescription>Credenciales y experiencia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="license_number">Número de Licencia</Label>
                <Input id="license_number" name="license_number" placeholder="FT-001" />
              </div>
              <div>
                <Label htmlFor="years_of_experience">Años de Experiencia</Label>
                <Input
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  min="0"
                  placeholder="5"
                />
              </div>
              <div>
                <Label htmlFor="hire_date">Fecha de Contratación</Label>
                <Input id="hire_date" name="hire_date" type="date" />
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select name="status" defaultValue="active">
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
            <div>
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
                  placeholder="Ej. Ortopedia, Deportiva, Neurología"
                />
                <Button type="button" onClick={addSpecialty} size="sm">
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
          </CardContent>
        </Card>

        {/* Información de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Dirección y Contacto de Emergencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input id="address" name="address" placeholder="Calle y número" />
              </div>
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" name="city" placeholder="Ciudad de México" />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" placeholder="CDMX" />
              </div>
              <div>
                <Label htmlFor="postal_code">Código Postal</Label>
                <Input id="postal_code" name="postal_code" placeholder="01000" />
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-4">Contacto de Emergencia</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="emergency_contact_name">Nombre</Label>
                  <Input
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    placeholder="Nombre del contacto"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Teléfono</Label>
                  <Input
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    placeholder="55 1234 5678"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionales</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Cualquier información adicional relevante..."
              rows={4}
            />
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">{error}</div>
        )}

        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Guardar Fisioterapeuta'}
          </Button>
        </div>
      </form>
    </div>
  );
}
