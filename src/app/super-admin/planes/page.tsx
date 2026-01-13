'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Edit, Save, X } from 'lucide-react'

interface SubscriptionPlan {
    id: string
    plan_name: string
    display_name: string
    description: string
    monthly_price: number
    quarterly_price: number
    yearly_price: number
    currency: string
    max_users: number
    max_patients: number
    max_therapists: number | null
    max_storage_gb: number
    features: string[]
    is_active: boolean
    is_visible: boolean
}

export default function SubscriptionPlansPage() {
    const [plans, setPlans] = useState<SubscriptionPlan[]>([])
    const [editingPlan, setEditingPlan] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        loadPlans()
    }, [])

    async function loadPlans() {
        setIsLoading(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('subscription_plans')
                .select('*')
                .order('monthly_price', { ascending: true })

            if (error) throw error
            setPlans(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    function startEditing(plan: SubscriptionPlan) {
        setEditingPlan(plan.id)
        setEditForm({
            monthly_price: plan.monthly_price,
            quarterly_price: plan.quarterly_price,
            yearly_price: plan.yearly_price,
            max_users: plan.max_users,
            max_patients: plan.max_patients,
            max_therapists: plan.max_therapists,
            max_storage_gb: plan.max_storage_gb,
            is_active: plan.is_active,
            is_visible: plan.is_visible
        })
    }

    function cancelEditing() {
        setEditingPlan(null)
        setEditForm({})
    }

    async function saveChanges(planId: string) {
        setIsSaving(true)
        setError(null)
        try {
            const { error } = await supabase
                .from('subscription_plans')
                .update(editForm)
                .eq('id', planId)

            if (error) throw error

            await loadPlans()
            setEditingPlan(null)
            setEditForm({})
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="p-8">
                <div className="text-center text-gray-600">Cargando planes...</div>
            </div>
        )
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Planes de Suscripción</h1>
                <p className="text-gray-600 text-sm">Configura los límites y precios de cada plan</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {plans.map((plan) => {
                    const isEditing = editingPlan === plan.id

                    return (
                        <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{plan.display_name}</h2>
                                    <p className="text-gray-600 text-sm">{plan.description}</p>
                                </div>
                                {!isEditing && (
                                    <Button
                                        onClick={() => startEditing(plan)}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        <Edit className="h-4 w-4" />
                                        Editar
                                    </Button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Pricing */}
                                <div>
                                    <Label>Precio Mensual ({plan.currency})</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={editForm.monthly_price || 0}
                                            onChange={(e) => setEditForm({ ...editForm, monthly_price: parseFloat(e.target.value) })}
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-900">
                                            ${plan.monthly_price.toLocaleString('es-MX')}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Precio Trimestral - 3 Meses ({plan.currency})</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={editForm.quarterly_price || 0}
                                            onChange={(e) => setEditForm({ ...editForm, quarterly_price: parseFloat(e.target.value) })}
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-900">
                                            ${plan.quarterly_price?.toLocaleString('es-MX')}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Precio Anual ({plan.currency})</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={editForm.yearly_price || 0}
                                            onChange={(e) => setEditForm({ ...editForm, yearly_price: parseFloat(e.target.value) })}
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-900">
                                            ${plan.yearly_price?.toLocaleString('es-MX')}
                                        </p>
                                    )}
                                </div>

                                {/* Limits */}
                                <div>
                                    <Label>Máximo de Usuarios</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editForm.max_users || 0}
                                            onChange={(e) => setEditForm({ ...editForm, max_users: parseInt(e.target.value) })}
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-900">
                                            {plan.max_users === 999 ? 'Ilimitado' : plan.max_users}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Máximo de Pacientes</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editForm.max_patients || 0}
                                            onChange={(e) => setEditForm({ ...editForm, max_patients: parseInt(e.target.value) })}
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-900">
                                            {plan.max_patients === 999999 ? 'Ilimitado' : plan.max_patients}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Máximo de Terapeutas</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editForm.max_therapists || 0}
                                            onChange={(e) => setEditForm({ ...editForm, max_therapists: parseInt(e.target.value) })}
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-900">
                                            {plan.max_therapists === 999 ? 'Ilimitado' : plan.max_therapists}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <Label>Almacenamiento (GB)</Label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editForm.max_storage_gb || 0}
                                            onChange={(e) => setEditForm({ ...editForm, max_storage_gb: parseInt(e.target.value) })}
                                        />
                                    ) : (
                                        <p className="text-lg font-semibold text-gray-900">
                                            {plan.max_storage_gb} GB
                                        </p>
                                    )}
                                </div>

                                {/* Status toggles */}
                                <div className="flex items-center gap-3">
                                    <Label>Activo</Label>
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            checked={editForm.is_active ?? plan.is_active}
                                            onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                                            className="h-5 w-5 text-blue-600 rounded"
                                        />
                                    ) : (
                                        <span className={`px-2 py-1 text-xs rounded ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {plan.is_active ? 'Sí' : 'No'}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <Label>Visible</Label>
                                    {isEditing ? (
                                        <input
                                            type="checkbox"
                                            checked={editForm.is_visible ?? plan.is_visible}
                                            onChange={(e) => setEditForm({ ...editForm, is_visible: e.target.checked })}
                                            className="h-5 w-5 text-blue-600 rounded"
                                        />
                                    ) : (
                                        <span className={`px-2 py-1 text-xs rounded ${plan.is_visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {plan.is_visible ? 'Sí' : 'No'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Features list */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Label className="mb-2 block">Características incluidas:</Label>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-green-600">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Edit actions */}
                            {isEditing && (
                                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
                                    <Button
                                        onClick={cancelEditing}
                                        variant="ghost"
                                        disabled={isSaving}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={() => saveChanges(plan.id)}
                                        isLoading={isSaving}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Guardar Cambios
                                    </Button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
