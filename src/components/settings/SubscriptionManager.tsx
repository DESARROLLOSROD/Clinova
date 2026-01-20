'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, ExternalLink, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { getStripe } from '@/lib/stripe-client'

interface SubscriptionManagerProps {
  clinic: {
    id: string
    name: string
    subscription_tier: string
    subscription_status: string
    next_payment_date: string | null
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
  }
}

const PLAN_DETAILS = {
  basic: {
    name: 'Básico',
    price: '$29/mes',
    features: ['2 fisioterapeutas', '100 pacientes', 'Funciones básicas'],
  },
  professional: {
    name: 'Profesional',
    price: '$79/mes',
    features: ['10 fisioterapeutas', 'Pacientes ilimitados', 'Reportes avanzados'],
  },
  enterprise: {
    name: 'Enterprise',
    price: '$149/mes',
    features: ['Ilimitado', 'Soporte 24/7', 'API personalizada'],
  },
}

const STATUS_BADGES: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Activa', variant: 'default' },
  trial: { label: 'Prueba', variant: 'secondary' },
  suspended: { label: 'Suspendida', variant: 'destructive' },
  cancelled: { label: 'Cancelada', variant: 'outline' },
  pending: { label: 'Pendiente', variant: 'secondary' },
}

export function SubscriptionManager({ clinic }: SubscriptionManagerProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const currentPlan = PLAN_DETAILS[clinic.subscription_tier as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.basic
  const statusBadge = STATUS_BADGES[clinic.subscription_status] || STATUS_BADGES.pending

  const handleUpgrade = async (plan: string) => {
    setLoading(plan)
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, interval: 'monthly' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear sesión de pago')
      }

      // Redirect to Stripe Checkout
      const stripe = await getStripe()
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      } else if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al procesar')
    } finally {
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    setLoading('portal')
    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al abrir portal')
      }

      window.location.href = data.url
    } catch (error) {
      console.error('Error:', error)
      toast.error(error instanceof Error ? error.message : 'Error al abrir portal')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Plan Actual
              </CardTitle>
              <CardDescription>
                Gestiona tu suscripción y facturación
              </CardDescription>
            </div>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-semibold text-lg">{currentPlan.name}</h3>
              <p className="text-muted-foreground">{currentPlan.price}</p>
            </div>
            {clinic.next_payment_date && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Próximo pago</p>
                <p className="font-medium">
                  {new Date(clinic.next_payment_date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Características incluidas:</p>
            <ul className="space-y-1">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {clinic.stripe_subscription_id && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleManageSubscription}
              disabled={loading === 'portal'}
            >
              {loading === 'portal' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Gestionar suscripción
            </Button>
          )}

          {clinic.subscription_status === 'suspended' && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">
                Tu suscripción está suspendida. Por favor, actualiza tu método de pago.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planes Disponibles</CardTitle>
          <CardDescription>
            Cambia tu plan en cualquier momento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(PLAN_DETAILS).map(([key, plan]) => {
              const isCurrent = clinic.subscription_tier === key
              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border ${
                    isCurrent ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-1">{plan.price}</p>
                  <ul className="mt-3 space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full mt-4"
                    variant={isCurrent ? 'secondary' : 'default'}
                    disabled={isCurrent || loading === key}
                    onClick={() => handleUpgrade(key)}
                  >
                    {loading === key ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isCurrent ? (
                      'Plan actual'
                    ) : (
                      'Seleccionar'
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
