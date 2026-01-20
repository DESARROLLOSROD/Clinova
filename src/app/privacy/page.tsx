import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Política de Privacidad | Clinova',
  description: 'Política de privacidad y protección de datos de Clinova',
}

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Política de Privacidad</h1>
        <p className="text-muted-foreground mb-8">Última actualización: Enero 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Introducción</h2>
            <p className="text-muted-foreground leading-relaxed">
              En Clinova, nos comprometemos a proteger la privacidad y seguridad de los datos
              personales y de salud que procesa nuestra plataforma. Esta Política de Privacidad
              describe cómo recopilamos, usamos, almacenamos y protegemos su información cuando
              utiliza nuestros servicios.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Al utilizar Clinova, usted acepta las prácticas descritas en esta política.
              Le recomendamos leerla detenidamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Responsable del Tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Clinova actúa como encargado del tratamiento de datos en nombre de las clínicas
              (responsables del tratamiento) que utilizan nuestra plataforma. Cada clínica es
              responsable de:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Obtener el consentimiento de sus pacientes</li>
              <li>Determinar los fines del tratamiento de datos</li>
              <li>Cumplir con la legislación local de protección de datos</li>
              <li>Responder a solicitudes de derechos de los pacientes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. Datos que Recopilamos</h2>

            <h3 className="text-lg font-medium mt-4 mb-2">3.1 Datos de la Clínica</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Nombre y razón social de la clínica</li>
              <li>Dirección y datos de contacto</li>
              <li>Información fiscal y de facturación</li>
              <li>Logo y configuración personalizada</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.2 Datos de Usuarios (Personal de la Clínica)</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Nombre completo</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Rol y permisos dentro del sistema</li>
              <li>Credenciales de acceso (cifradas)</li>
              <li>Para fisioterapeutas: número de licencia profesional y especialidades</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.3 Datos de Pacientes</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Datos de identificación (nombre, fecha de nacimiento, documento de identidad)</li>
              <li>Datos de contacto (teléfono, email, dirección)</li>
              <li>Contacto de emergencia</li>
              <li>Información del seguro médico</li>
              <li>Historial médico y antecedentes</li>
              <li>Notas clínicas y evaluaciones (SOAP)</li>
              <li>Registro de dolor y evolución</li>
              <li>Ejercicios prescritos y adherencia</li>
              <li>Documentos cargados (imágenes, radiografías, etc.)</li>
              <li>Consentimientos firmados</li>
              <li>Historial de pagos</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">3.4 Datos Técnicos</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Dirección IP</li>
              <li>Tipo de navegador y dispositivo</li>
              <li>Sistema operativo</li>
              <li>Páginas visitadas y acciones realizadas</li>
              <li>Fecha y hora de acceso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Finalidad del Tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos los datos recopilados para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Proporcionar y mantener el servicio de gestión clínica</li>
              <li>Administrar cuentas de usuario y autenticación</li>
              <li>Procesar citas, sesiones y tratamientos</li>
              <li>Generar facturas y gestionar pagos</li>
              <li>Enviar notificaciones relacionadas con el servicio</li>
              <li>Proporcionar soporte técnico</li>
              <li>Generar estadísticas y reportes para la clínica</li>
              <li>Mejorar y optimizar la plataforma</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Detectar y prevenir fraudes o uso indebido</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. Base Legal del Tratamiento</h2>
            <p className="text-muted-foreground leading-relaxed">
              El tratamiento de datos se fundamenta en:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Ejecución contractual:</strong> Para proporcionar los servicios contratados</li>
              <li><strong>Consentimiento:</strong> Para datos de salud, obtenido por la clínica</li>
              <li><strong>Interés legítimo:</strong> Para mejorar el servicio y prevenir fraudes</li>
              <li><strong>Obligación legal:</strong> Para cumplir con requerimientos normativos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Categorías Especiales de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Clinova procesa datos de salud, que son considerados datos sensibles o de categoría
              especial. Estos datos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Solo se procesan con el consentimiento explícito del paciente</li>
              <li>Se almacenan con medidas de seguridad reforzadas</li>
              <li>Solo son accesibles por personal autorizado de la clínica</li>
              <li>Están sujetos a confidencialidad médica</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Seguridad de los Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos múltiples capas de seguridad:
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2">Medidas Técnicas</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Cifrado de datos en tránsito (TLS/SSL)</li>
              <li>Cifrado de datos en reposo</li>
              <li>Aislamiento de datos por clínica (Row Level Security)</li>
              <li>Autenticación segura con tokens JWT</li>
              <li>Control de acceso basado en roles (RBAC)</li>
              <li>Copias de seguridad automáticas</li>
              <li>Monitoreo de seguridad continuo</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2">Medidas Organizativas</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Políticas de acceso mínimo necesario</li>
              <li>Registro de auditoría de todas las acciones</li>
              <li>Capacitación del personal en protección de datos</li>
              <li>Procedimientos de respuesta a incidentes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Aislamiento de Datos Multi-Tenant</h2>
            <p className="text-muted-foreground leading-relaxed">
              Clinova opera bajo un modelo multi-tenant donde cada clínica tiene sus datos
              completamente aislados:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Cada consulta a la base de datos está filtrada por clínica</li>
              <li>Un usuario de una clínica nunca puede acceder a datos de otra</li>
              <li>Las políticas de seguridad se aplican a nivel de base de datos</li>
              <li>El aislamiento se verifica mediante auditorías regulares</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Compartición de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              No vendemos ni compartimos datos personales con terceros para fines de marketing.
              Los datos pueden ser compartidos únicamente con:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Proveedores de infraestructura:</strong> Supabase (base de datos y autenticación)</li>
              <li><strong>Procesadores de pago:</strong> Para gestionar transacciones de suscripción</li>
              <li><strong>Servicios de email:</strong> Para envío de notificaciones</li>
              <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Todos los proveedores están sujetos a acuerdos de procesamiento de datos
              y cumplen con estándares de seguridad adecuados.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Transferencias Internacionales</h2>
            <p className="text-muted-foreground leading-relaxed">
              Los datos pueden ser almacenados y procesados en servidores ubicados en diferentes
              países. Cuando se realizan transferencias internacionales, nos aseguramos de que
              existan garantías adecuadas, como cláusulas contractuales estándar o certificaciones
              de privacidad reconocidas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Retención de Datos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Conservamos los datos durante el tiempo necesario para cumplir con los fines
              descritos en esta política:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Datos de cuenta activa:</strong> Mientras la suscripción esté vigente</li>
              <li><strong>Datos de pacientes:</strong> Según los requisitos legales de cada jurisdicción (típicamente 5-10 años para historiales médicos)</li>
              <li><strong>Datos de facturación:</strong> Según requisitos fiscales (típicamente 5-7 años)</li>
              <li><strong>Registros de auditoría:</strong> 2 años</li>
              <li><strong>Tras cancelación:</strong> Los datos se eliminan dentro de 90 días, salvo obligación legal de retención</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Derechos de los Usuarios</h2>
            <p className="text-muted-foreground leading-relaxed">
              Dependiendo de su jurisdicción, puede tener los siguientes derechos:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
              <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
              <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos</li>
              <li><strong>Limitación:</strong> Restringir el procesamiento de sus datos</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Oposición:</strong> Oponerse a ciertos tipos de procesamiento</li>
              <li><strong>Retirar consentimiento:</strong> En cualquier momento, sin afectar la licitud del tratamiento previo</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Para ejercer estos derechos, los pacientes deben contactar directamente a su clínica.
              Los usuarios de clínicas pueden contactar a soporte@clinova.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">13. Cookies y Tecnologías Similares</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos cookies esenciales para:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Mantener la sesión de usuario activa</li>
              <li>Recordar preferencias de configuración (como el tema oscuro)</li>
              <li>Garantizar la seguridad del servicio</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              No utilizamos cookies de seguimiento ni publicidad.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">14. Menores de Edad</h2>
            <p className="text-muted-foreground leading-relaxed">
              Clinova no está dirigido a menores de 18 años como usuarios del sistema.
              El tratamiento de datos de pacientes menores de edad debe contar con el
              consentimiento de sus padres o tutores legales, siendo responsabilidad
              de la clínica obtener dicho consentimiento.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">15. Cambios en la Política</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos actualizar esta Política de Privacidad periódicamente. Los cambios
              significativos serán notificados mediante:
            </p>
            <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
              <li>Aviso prominente en la plataforma</li>
              <li>Notificación por correo electrónico</li>
              <li>Actualización de la fecha de &quot;última modificación&quot;</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              El uso continuado del servicio después de los cambios constituye la aceptación
              de la política actualizada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">16. Contacto</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para consultas sobre privacidad o protección de datos:
            </p>
            <ul className="list-none text-muted-foreground mt-2 space-y-1">
              <li><strong>Email de Privacidad:</strong> privacidad@clinova.com</li>
              <li><strong>Soporte General:</strong> soporte@clinova.com</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Si considera que sus derechos no han sido atendidos adecuadamente, tiene derecho
              a presentar una reclamación ante la autoridad de protección de datos de su país.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-primary">Términos de Servicio</Link>
          <span>•</span>
          <Link href="/help" className="hover:text-primary">Centro de Ayuda</Link>
          <span>•</span>
          <Link href="/" className="hover:text-primary">Volver al inicio</Link>
        </div>
      </main>
    </div>
  )
}
