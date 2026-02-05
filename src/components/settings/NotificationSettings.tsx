'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Mail, Smartphone } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'

interface NotificationPreferences {
    email: boolean
    push: boolean
    marketing: boolean
}

export function NotificationSettings() {
    const [preferences, setPreferences] = useState<NotificationPreferences>({
        email: true,
        push: true,
        marketing: false
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadPreferences()
    }, [])

    const loadPreferences = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('user_profiles')
                .select('notification_preferences')
                .eq('id', user.id)
                .single()

            if (data?.notification_preferences) {
                setPreferences(data.notification_preferences as NotificationPreferences)
            }
        } catch (error) {
            console.error('Error loading preferences:', error)
        } finally {
            setLoading(false)
        }
    }

    const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
        const newPreferences = { ...preferences, [key]: value }
        setPreferences(newPreferences) // Optimistic update

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase
                .from('user_profiles')
                .update({ notification_preferences: newPreferences })
                .eq('id', user.id)

            if (error) throw error
            toast.success('Preferencias actualizadas')
        } catch (error) {
            console.error('Error updating preferences:', error)
            toast.error('No se pudo guardar la configuración')
            setPreferences(preferences) // Revert
        }
    }

    if (loading) return <div className="h-40 flex items-center justify-center text-sm text-gray-500">Cargando preferencias...</div>

    return (
        <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-500" />
                Preferencias de Notificaciones
            </h2>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <Label htmlFor="email-notif" className="text-base font-medium">Correo Electrónico</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Recibir resúmenes semanales y alertas importantes.</p>
                        </div>
                    </div>
                    <Switch
                        id="email-notif"
                        checked={preferences.email}
                        onCheckedChange={(checked) => updatePreference('email', checked)}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Smartphone className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <Label htmlFor="push-notif" className="text-base font-medium">Notificaciones Push</Label>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Recibir alertas en tiempo real en tu dispositivo.</p>
                        </div>
                    </div>
                    <Switch
                        id="push-notif"
                        checked={preferences.push}
                        onCheckedChange={(checked) => updatePreference('push', checked)}
                    />
                </div>
            </div>
        </Card>
    )
}
