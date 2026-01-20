import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Settings,
  Dumbbell,
  HelpCircle,
  Mail,
  BookOpen,
  Video,
  MessageCircle,
  ChevronRight,
} from 'lucide-react'

export const metadata = {
  title: 'Centro de Ayuda | Clinova',
  description: 'Encuentra respuestas a tus preguntas sobre Clinova',
}

const categories = [
  {
    title: 'Primeros Pasos',
    icon: BookOpen,
    description: 'Aprende a configurar tu clínica',
    articles: [
      { title: '¿Cómo crear mi cuenta?', href: '#crear-cuenta' },
      { title: 'Configuración inicial de la clínica', href: '#configuracion-inicial' },
      { title: 'Agregar fisioterapeutas', href: '#agregar-fisioterapeutas' },
      { title: 'Importar pacientes existentes', href: '#importar-pacientes' },
    ],
  },
  {
    title: 'Gestión de Pacientes',
    icon: Users,
    description: 'Todo sobre el manejo de pacientes',
    articles: [
      { title: '¿Cómo registrar un nuevo paciente?', href: '#registrar-paciente' },
      { title: 'Historial médico y antecedentes', href: '#historial-medico' },
      { title: 'Consentimientos informados', href: '#consentimientos' },
      { title: 'Documentos del paciente', href: '#documentos' },
    ],
  },
  {
    title: 'Agenda y Citas',
    icon: Calendar,
    description: 'Administra tu calendario',
    articles: [
      { title: '¿Cómo programar una cita?', href: '#programar-cita' },
      { title: 'Reprogramar o cancelar citas', href: '#reprogramar-cita' },
      { title: 'Asignación de fisioterapeutas', href: '#asignar-fisio' },
      { title: 'Configurar horarios de atención', href: '#horarios' },
    ],
  },
  {
    title: 'Sesiones Clínicas',
    icon: FileText,
    description: 'Registro de sesiones SOAP',
    articles: [
      { title: '¿Qué es el formato SOAP?', href: '#formato-soap' },
      { title: '¿Cómo registrar una sesión?', href: '#registrar-sesion' },
      { title: 'Seguimiento del nivel de dolor', href: '#nivel-dolor' },
      { title: 'Ver historial de sesiones', href: '#historial-sesiones' },
    ],
  },
  {
    title: 'Ejercicios',
    icon: Dumbbell,
    description: 'Biblioteca y prescripciones',
    articles: [
      { title: '¿Cómo crear un ejercicio?', href: '#crear-ejercicio' },
      { title: 'Prescribir ejercicios a pacientes', href: '#prescribir-ejercicios' },
      { title: 'Agregar videos e imágenes', href: '#multimedia-ejercicios' },
      { title: 'Vista del paciente', href: '#vista-paciente' },
    ],
  },
  {
    title: 'Pagos y Facturación',
    icon: CreditCard,
    description: 'Control financiero',
    articles: [
      { title: '¿Cómo registrar un pago?', href: '#registrar-pago' },
      { title: 'Generar facturas PDF', href: '#generar-factura' },
      { title: 'Métodos de pago disponibles', href: '#metodos-pago' },
      { title: 'Historial de pagos', href: '#historial-pagos' },
    ],
  },
  {
    title: 'Configuración',
    icon: Settings,
    description: 'Personaliza tu clínica',
    articles: [
      { title: 'Datos de la clínica', href: '#datos-clinica' },
      { title: 'Precios de servicios', href: '#precios-servicios' },
      { title: 'Gestión de usuarios', href: '#gestion-usuarios' },
      { title: 'Roles y permisos', href: '#roles-permisos' },
    ],
  },
  {
    title: 'Suscripción',
    icon: CreditCard,
    description: 'Planes y facturación',
    articles: [
      { title: 'Planes disponibles', href: '#planes' },
      { title: '¿Cómo cambiar de plan?', href: '#cambiar-plan' },
      { title: 'Métodos de pago de suscripción', href: '#pago-suscripcion' },
      { title: 'Cancelar suscripción', href: '#cancelar-suscripcion' },
    ],
  },
]

const faqs = [
  {
    question: '¿Cómo puedo probar Clinova antes de pagar?',
    answer:
      'Ofrecemos una prueba gratuita de 30 días con acceso completo a todas las funcionalidades. No se requiere tarjeta de crédito para comenzar.',
  },
  {
    question: '¿Mis datos están seguros?',
    answer:
      'Sí. Utilizamos cifrado de extremo a extremo, aislamiento de datos por clínica mediante Row Level Security, y cumplimos con las mejores prácticas de seguridad de la industria.',
  },
  {
    question: '¿Puedo acceder desde mi celular?',
    answer:
      'Sí. Clinova está disponible como aplicación web responsive y también como app nativa para Android e iOS. Tus pacientes también pueden acceder a sus ejercicios desde su móvil.',
  },
  {
    question: '¿Puedo exportar mis datos?',
    answer:
      'Sí. Puedes exportar reportes en PDF y próximamente tendremos la opción de exportar datos completos en formato Excel/CSV.',
  },
  {
    question: '¿Qué pasa si cancelo mi suscripción?',
    answer:
      'Tus datos se mantienen por 90 días después de cancelar. Puedes solicitar una copia de tus datos en cualquier momento durante este período.',
  },
  {
    question: '¿Cuántos usuarios puedo tener?',
    answer:
      'Depende del plan. El plan Básico incluye hasta 2 fisioterapeutas, el Profesional hasta 10, y el Enterprise es ilimitado.',
  },
  {
    question: '¿Ofrecen capacitación?',
    answer:
      'Sí. Todos los planes incluyen acceso a nuestra documentación y videos tutoriales. El plan Enterprise incluye onboarding personalizado y capacitación en vivo.',
  },
  {
    question: '¿Puedo integrar Clinova con otros sistemas?',
    answer:
      'El plan Enterprise incluye acceso a nuestra API para integraciones personalizadas. Contáctanos para conocer más sobre las posibilidades de integración.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-semibold text-xl">Clinova</span>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Centro de Ayuda</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Encuentra respuestas rápidas a tus preguntas sobre Clinova
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Categorías de Ayuda</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.title}
                  className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  <ul className="space-y-2">
                    {category.articles.map((article) => (
                      <li key={article.title}>
                        <Link
                          href={article.href}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <ChevronRight className="h-3 w-3" />
                          {article.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Preguntas Frecuentes</h2>
            <p className="text-muted-foreground">Las preguntas más comunes de nuestros usuarios</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-card rounded-lg border p-4 cursor-pointer"
              >
                <summary className="flex items-center justify-between font-medium list-none">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    {faq.question}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-4 text-muted-foreground pl-8">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Video Tutoriales</h2>
            <p className="text-muted-foreground">Aprende con nuestros videos paso a paso</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl border bg-card text-center">
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Introducción a Clinova</h3>
              <p className="text-sm text-muted-foreground">5 min</p>
            </div>
            <div className="p-6 rounded-xl border bg-card text-center">
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Gestión de Pacientes</h3>
              <p className="text-sm text-muted-foreground">8 min</p>
            </div>
            <div className="p-6 rounded-xl border bg-card text-center">
              <div className="h-32 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Agenda y Citas</h3>
              <p className="text-sm text-muted-foreground">6 min</p>
            </div>
          </div>

          <p className="text-center text-muted-foreground mt-8">
            Próximamente más videos tutoriales
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">¿No encontraste lo que buscabas?</h2>
            <p className="text-muted-foreground mb-8">
              Nuestro equipo de soporte está listo para ayudarte
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl border bg-card">
                <Mail className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-muted-foreground mb-4">
                  Respuesta en menos de 24 horas
                </p>
                <a
                  href="mailto:soporte@clinova.com"
                  className="text-primary hover:underline"
                >
                  soporte@clinova.com
                </a>
              </div>
              <div className="p-6 rounded-xl border bg-card">
                <MessageCircle className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Chat en Vivo</h3>
                <p className="text-muted-foreground mb-4">
                  Disponible L-V 9:00 - 18:00
                </p>
                <button className="text-primary hover:underline">
                  Iniciar chat (próximamente)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Link href="/" className="hover:text-foreground">
              Inicio
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Términos de Servicio
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Política de Privacidad
            </Link>
          </div>
          <p>© {new Date().getFullYear()} Clinova. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
