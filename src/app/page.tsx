import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import {
  Calendar,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Shield,
  Smartphone,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Dumbbell,
  Stethoscope,
} from 'lucide-react'

export const metadata = {
  title: 'Clinova - Sistema de Gestión para Clínicas de Fisioterapia',
  description:
    'Plataforma integral para gestionar pacientes, citas, sesiones clínicas, pagos y más. Optimiza tu clínica de fisioterapia con Clinova.',
}

export default async function LandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Si el usuario está autenticado, redirigir al dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Clinova</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Características
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Precios
            </Link>
            <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground">
              Ayuda
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm mb-6">
            <Star className="h-4 w-4" />
            <span>Prueba gratuita de 30 días</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
            Gestiona tu clínica de fisioterapia de forma{' '}
            <span className="text-primary">simple y eficiente</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma integral para administrar pacientes, citas, sesiones clínicas,
            ejercicios y pagos. Todo lo que necesitas en un solo lugar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Comenzar ahora
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 border px-8 py-4 rounded-lg text-lg font-medium hover:bg-accent transition-colors"
            >
              Ver características
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Sin tarjeta de crédito requerida
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">500+</p>
              <p className="text-muted-foreground">Clínicas activas</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">50k+</p>
              <p className="text-muted-foreground">Pacientes gestionados</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">99.9%</p>
              <p className="text-muted-foreground">Disponibilidad</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">4.9/5</p>
              <p className="text-muted-foreground">Satisfacción</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Todo lo que necesitas para tu clínica
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades diseñadas específicamente para clínicas de fisioterapia
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Gestión de Pacientes</h3>
              <p className="text-muted-foreground">
                Historial médico completo, antecedentes, alergias, consentimientos firmados
                y documentos en un solo lugar.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Agenda Inteligente</h3>
              <p className="text-muted-foreground">
                Calendario interactivo con vista diaria, semanal y mensual. Asignación
                automática de fisioterapeutas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Notas SOAP</h3>
              <p className="text-muted-foreground">
                Registro estructurado de sesiones clínicas con formato SOAP. Seguimiento
                del nivel de dolor y evolución.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ejercicios y Prescripciones</h3>
              <p className="text-muted-foreground">
                Biblioteca de ejercicios con videos. Prescribe rutinas personalizadas
                que los pacientes pueden ver desde su móvil.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Control de Pagos</h3>
              <p className="text-muted-foreground">
                Gestión de pagos con múltiples métodos. Generación automática de facturas
                y recibos en PDF.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Reportes y Analytics</h3>
              <p className="text-muted-foreground">
                Dashboard con KPIs, ingresos mensuales, tasa de asistencia y crecimiento
                de pacientes.
              </p>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Seguridad de Datos</h4>
                <p className="text-sm text-muted-foreground">
                  Cifrado, aislamiento por clínica y control de acceso por roles
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Smartphone className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-semibold">App Móvil</h4>
                <p className="text-sm text-muted-foreground">
                  Acceso desde Android e iOS para ti y tus pacientes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-primary flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Notificaciones en Tiempo Real</h4>
                <p className="text-sm text-muted-foreground">
                  Alertas instantáneas de citas, cambios y recordatorios
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planes para cada clínica
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tus necesidades. Todos incluyen 30 días de prueba gratuita.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="p-8 rounded-xl border bg-card">
              <h3 className="text-xl font-semibold mb-2">Básico</h3>
              <p className="text-muted-foreground mb-4">Para clínicas pequeñas</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Hasta 2 fisioterapeutas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>100 pacientes activos</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Agenda y citas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Notas SOAP</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Facturación básica</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=basic"
                className="block text-center border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/10 transition-colors"
              >
                Comenzar prueba gratis
              </Link>
            </div>

            {/* Professional Plan */}
            <div className="p-8 rounded-xl border-2 border-primary bg-card relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                Más popular
              </div>
              <h3 className="text-xl font-semibold mb-2">Profesional</h3>
              <p className="text-muted-foreground mb-4">Para clínicas en crecimiento</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$79</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Hasta 10 fisioterapeutas</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Pacientes ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Todo del plan Básico</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Biblioteca de ejercicios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Reportes avanzados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>App móvil para pacientes</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=professional"
                className="block text-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Comenzar prueba gratis
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 rounded-xl border bg-card">
              <h3 className="text-xl font-semibold mb-2">Enterprise</h3>
              <p className="text-muted-foreground mb-4">Para grandes clínicas</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$149</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Fisioterapeutas ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Todo del plan Profesional</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>API personalizada</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Soporte prioritario 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Onboarding personalizado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>SLA garantizado</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=enterprise"
                className="block text-center border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/10 transition-colors"
              >
                Contactar ventas
              </Link>
            </div>
          </div>

          <p className="text-center text-muted-foreground mt-8">
            ¿Necesitas algo diferente?{' '}
            <Link href="mailto:ventas@clinova.com" className="text-primary hover:underline">
              Contáctanos
            </Link>{' '}
            para un plan personalizado.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comienza a optimizar tu clínica hoy
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Únete a cientos de clínicas que ya confían en Clinova para gestionar sus operaciones diarias.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Comenzar prueba gratuita de 30 días
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <Stethoscope className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">Clinova</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Sistema de gestión integral para clínicas de fisioterapia.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-foreground">
                    Centro de Ayuda
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Términos de Servicio
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>soporte@clinova.com</li>
                <li>ventas@clinova.com</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Clinova. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/terms" className="hover:text-foreground">
                Términos
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacidad
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
