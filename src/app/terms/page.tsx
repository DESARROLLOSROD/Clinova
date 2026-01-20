import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Términos de Servicio | Clinova',
  description: 'Términos y condiciones de uso de la plataforma Clinova',
}

export default function TermsPage() {
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

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Términos de Servicio</h1>
        <p className="text-muted-foreground mb-8">Última actualización: Enero 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Aceptación de los Términos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al acceder y utilizar la plataforma Clinova (&quot;el Servicio&quot;), usted acepta estar sujeto a estos
              Términos de Servicio. Si no está de acuerdo con alguna parte de estos términos, no podrá
              acceder al Servicio. Estos términos se aplican a todos los usuarios, visitantes y otras
              personas que accedan o utilicen el Servicio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Descripción del Servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Clinova es una plataforma de gestión para clínicas de fisioterapia que permite:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Gestión de pacientes y sus historiales médicos</li>
              <li>Programación y administración de citas</li>
              <li>Registro de sesiones clínicas y notas SOAP</li>
              <li>Gestión de fisioterapeutas y personal</li>
              <li>Control de pagos y facturación</li>
              <li>Prescripción y seguimiento de ejercicios</li>
              <li>Generación de reportes y estadísticas</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Cuentas de Usuario</h2>
            <p className="text-muted-foreground leading-relaxed">
              Al crear una cuenta en Clinova, usted garantiza que:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Es mayor de 18 años o tiene la capacidad legal para celebrar contratos vinculantes</li>
              <li>La información proporcionada es precisa, completa y actualizada</li>
              <li>Mantendrá la seguridad de su cuenta y contraseña</li>
              <li>Notificará inmediatamente cualquier uso no autorizado de su cuenta</li>
              <li>Es responsable de todas las actividades que ocurran bajo su cuenta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Planes de Suscripción y Pagos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Clinova ofrece diferentes planes de suscripción:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Plan Básico:</strong> Funcionalidades esenciales para clínicas pequeñas</li>
              <li><strong>Plan Profesional:</strong> Funcionalidades avanzadas para clínicas en crecimiento</li>
              <li><strong>Plan Enterprise:</strong> Solución completa con soporte prioritario</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Los pagos se procesan de forma segura. Las suscripciones se renuevan automáticamente
              a menos que se cancelen antes de la fecha de renovación. Los reembolsos se manejan
              caso por caso según nuestra política de reembolsos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Uso Aceptable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Usted se compromete a no utilizar el Servicio para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Violar cualquier ley o regulación aplicable</li>
              <li>Infringir los derechos de propiedad intelectual de terceros</li>
              <li>Transmitir virus, malware u otro código malicioso</li>
              <li>Intentar acceder sin autorización a sistemas o datos</li>
              <li>Compartir credenciales de acceso con terceros no autorizados</li>
              <li>Utilizar el servicio para fines distintos a la gestión clínica</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Datos de Salud y Confidencialidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Clinova procesa datos de salud de pacientes. Como usuario del Servicio, usted:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Es responsable de obtener el consentimiento informado de sus pacientes</li>
              <li>Debe cumplir con las leyes de protección de datos aplicables en su jurisdicción</li>
              <li>Garantiza que tiene autorización legal para procesar los datos ingresados</li>
              <li>Se compromete a mantener la confidencialidad de la información de pacientes</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Clinova implementa medidas de seguridad técnicas y organizativas para proteger los datos,
              incluyendo cifrado, aislamiento de datos por clínica y controles de acceso basados en roles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Propiedad Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              El Servicio y su contenido original, características y funcionalidad son propiedad
              exclusiva de Clinova y están protegidos por derechos de autor, marcas registradas
              y otras leyes de propiedad intelectual. Usted no puede copiar, modificar, distribuir,
              vender o alquilar ninguna parte del Servicio sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Disponibilidad del Servicio</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nos esforzamos por mantener el Servicio disponible 24/7, sin embargo:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Pueden ocurrir interrupciones por mantenimiento programado</li>
              <li>No garantizamos disponibilidad ininterrumpida o libre de errores</li>
              <li>Nos reservamos el derecho de modificar o descontinuar funcionalidades</li>
              <li>Notificaremos cambios significativos con anticipación razonable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Limitación de Responsabilidad</h2>
            <p className="text-muted-foreground leading-relaxed">
              En la máxima medida permitida por la ley, Clinova no será responsable por:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Daños indirectos, incidentales, especiales o consecuentes</li>
              <li>Pérdida de beneficios, datos o uso del Servicio</li>
              <li>Decisiones médicas tomadas basándose en la información del sistema</li>
              <li>Errores en la entrada de datos por parte de los usuarios</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              El Servicio es una herramienta de gestión administrativa y no sustituye el juicio
              profesional médico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Terminación</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos suspender o terminar su acceso al Servicio inmediatamente, sin previo aviso,
              por cualquier motivo, incluyendo el incumplimiento de estos Términos. Usted puede
              cancelar su cuenta en cualquier momento. Tras la terminación:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Su derecho a usar el Servicio cesará inmediatamente</li>
              <li>Podrá solicitar una copia de sus datos dentro de los 30 días</li>
              <li>Los datos serán eliminados según nuestra política de retención</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Modificaciones</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento.
              Los cambios significativos serán notificados por correo electrónico o mediante
              un aviso prominente en el Servicio. El uso continuado del Servicio después de
              los cambios constituye su aceptación de los nuevos términos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Ley Aplicable</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estos términos se regirán e interpretarán de acuerdo con las leyes aplicables
              en la jurisdicción donde opera su clínica, sin perjuicio de sus disposiciones
              sobre conflictos de leyes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">13. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en:
            </p>
            <ul className="list-none text-muted-foreground mt-2 space-y-1">
              <li><strong>Email:</strong> legal@clinova.com</li>
              <li><strong>Soporte:</strong> soporte@clinova.com</li>
            </ul>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-primary">Política de Privacidad</Link>
          <span>•</span>
          <Link href="/help" className="hover:text-primary">Centro de Ayuda</Link>
          <span>•</span>
          <Link href="/" className="hover:text-primary">Volver al inicio</Link>
        </div>
      </main>
    </div>
  )
}
