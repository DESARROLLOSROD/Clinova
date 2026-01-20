'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Patient } from '@/types/patient'
import { toast } from 'sonner'

interface PatientEditFormProps {
    patient: Patient
}

export function PatientEditForm({ patient }: PatientEditFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        first_name: patient.first_name,
        last_name: patient.last_name,
        email: patient.email || '',
        phone: patient.phone || '',
        date_of_birth: patient.date_of_birth || '',
        gender: patient.gender || '',
        address: patient.address || '',
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        active: patient.active
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setIsLoading(true)
        const supabase = createClient()

        try {
            const patientData = {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email || null,
                phone: formData.phone || null,
                date_of_birth: formData.date_of_birth || null,
                gender: formData.gender || null,
                address: formData.address || null,
                emergency_contact_name: formData.emergency_contact_name || null,
                emergency_contact_phone: formData.emergency_contact_phone || null,
                active: formData.active
            }

            const { error } = await supabase
                .from('patients')
                .update(patientData)
                .eq('id', patient.id)

            if (error) throw error

            toast.success('Paciente actualizado', {
                description: 'Los datos del paciente se han actualizado correctamente.',
            })

            router.push(`/dashboard/pacientes/${patient.id}`)
            router.refresh()
        } catch (err: any) {
            toast.error('Error', {
                description: err.message || 'No se pudo actualizar el paciente',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                    <Label htmlFor="first_name">Nombre *</Label>
                    <Input
                        id="first_name"
                        name="first_name"
                        required
                        placeholder="Ej. Juan"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="last_name">Apellidos *</Label>
                    <Input
                        id="last_name"
                        name="last_name"
                        required
                        placeholder="Ej. Pérez"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="juan@ejemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                        id="phone"
                        name="phone"
                        placeholder="55 1234 5678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                    <Input
                        id="date_of_birth"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="gender">Género</Label>
                    <select
                        id="gender"
                        name="gender"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                        <option value="">Seleccionar...</option>
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                        id="address"
                        name="address"
                        placeholder="Calle, número, colonia, ciudad"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="emergency_contact_name">Contacto de Emergencia</Label>
                    <Input
                        id="emergency_contact_name"
                        name="emergency_contact_name"
                        placeholder="Nombre del contacto"
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                    />
                </div>
                <div>
                    <Label htmlFor="emergency_contact_phone">Teléfono de Emergencia</Label>
                    <Input
                        id="emergency_contact_phone"
                        name="emergency_contact_phone"
                        placeholder="55 1234 5678"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                    />
                </div>
                <div className="md:col-span-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="active"
                            name="active"
                            checked={formData.active}
                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Label htmlFor="active" className="cursor-pointer">Paciente Activo</Label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </form>
    )
}
