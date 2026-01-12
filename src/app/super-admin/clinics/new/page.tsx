'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewClinicPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        country: 'MX',
        subscription_tier: 'basic',
        // Manager data
        manager_name: '',
        manager_email: '',
        manager_password: '',
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Auto-generate slug from name
            ...(name === 'name' && { slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Get the current session token for authentication
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                throw new Error('No authenticated session found')
            }

            // Call the API route to create the clinic
            const response = await fetch('/api/clinics/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    name: formData.name,
                    slug: formData.slug,
                    email: formData.email,
                    phone: formData.phone,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    subscription_tier: formData.subscription_tier,
                    manager_name: formData.manager_name,
                    manager_email: formData.manager_email,
                    manager_password: formData.manager_password,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || result.details || 'Error al crear la clínica')
            }

            toast.success(result.message || 'Clínica creada exitosamente')
            router.push(`/super-admin/clinics/${result.clinic.id}`)
        } catch (error: any) {
            console.error('Error creating clinic:', error)
            toast.error(error.message || 'Error al crear la clínica')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">
            <div className="mb-8">
                <Link
                    href="/super-admin/clinics"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Clínicas
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Clínica</h1>
                <p className="text-gray-600 mt-2">Registra una nueva clínica en la plataforma</p>
            </div>

            <Card className="p-6 max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Clinic Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Clínica</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name">Nombre de la Clínica *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Fisioterapia Integral"
                                />
                            </div>

                            <div>
                                <Label htmlFor="slug">Slug (URL) *</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                    placeholder="fisioterapia-integral"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="contacto@clinica.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+52 55 1234 5678"
                                />
                            </div>

                            <div>
                                <Label htmlFor="city">Ciudad</Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Ciudad de México"
                                />
                            </div>

                            <div>
                                <Label htmlFor="state">Estado</Label>
                                <Input
                                    id="state"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder="CDMX"
                                />
                            </div>

                            <div>
                                <Label htmlFor="subscription_tier">Plan de Suscripción *</Label>
                                <select
                                    id="subscription_tier"
                                    name="subscription_tier"
                                    value={formData.subscription_tier}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="basic">Básico</option>
                                    <option value="professional">Profesional</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Manager Information */}
                    <div className="pt-6 border-t">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Encargado de la Clínica</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label htmlFor="manager_name">Nombre Completo *</Label>
                                <Input
                                    id="manager_name"
                                    name="manager_name"
                                    value={formData.manager_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Juan Pérez García"
                                />
                            </div>

                            <div>
                                <Label htmlFor="manager_email">Email *</Label>
                                <Input
                                    id="manager_email"
                                    name="manager_email"
                                    type="email"
                                    value={formData.manager_email}
                                    onChange={handleChange}
                                    required
                                    placeholder="juan@clinica.com"
                                />
                            </div>

                            <div>
                                <Label htmlFor="manager_password">Contraseña *</Label>
                                <Input
                                    id="manager_password"
                                    name="manager_password"
                                    type="password"
                                    value={formData.manager_password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-6 border-t">
                        <Button type="submit" disabled={loading} className="flex-1">
                            {loading ? 'Creando...' : 'Crear Clínica'}
                        </Button>
                        <Link href="/super-admin/clinics" className="flex-1">
                            <Button type="button" variant="outline" className="w-full">
                                Cancelar
                            </Button>
                        </Link>
                    </div>
                </form>
            </Card>
        </div>
    )
}
