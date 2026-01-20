import Stripe from 'stripe'

// Lazy initialization of Stripe client
let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  }
  return stripeClient
}

// For backwards compatibility
export const stripe = {
  get customers() { return getStripeClient().customers },
  get checkout() { return getStripeClient().checkout },
  get billingPortal() { return getStripeClient().billingPortal },
  get subscriptions() { return getStripeClient().subscriptions },
  get webhooks() { return getStripeClient().webhooks },
}

// Price IDs for subscription plans (configure these in Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  basic: {
    monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_BASIC_YEARLY!,
  },
  professional: {
    monthly: process.env.STRIPE_PRICE_PROFESSIONAL_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_PROFESSIONAL_YEARLY!,
  },
  enterprise: {
    monthly: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY!,
    yearly: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY!,
  },
} as const

export type SubscriptionPlan = keyof typeof STRIPE_PRICE_IDS
export type BillingInterval = 'monthly' | 'yearly'

// Map subscription tier to Stripe price ID
export function getPriceId(plan: SubscriptionPlan, interval: BillingInterval): string {
  return STRIPE_PRICE_IDS[plan][interval]
}

// Subscription status mapping
export const SUBSCRIPTION_STATUS_MAP: Record<Stripe.Subscription.Status, string> = {
  active: 'active',
  canceled: 'cancelled',
  incomplete: 'pending',
  incomplete_expired: 'cancelled',
  past_due: 'suspended',
  paused: 'suspended',
  trialing: 'trial',
  unpaid: 'suspended',
}
