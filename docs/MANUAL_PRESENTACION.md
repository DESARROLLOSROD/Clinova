# Manual de Presentación - Clinova

## Sistema de Gestión para Clínicas de Fisioterapia

---

## 1. Introducción

**Clinova** es una plataforma integral diseñada específicamente para la gestión de clínicas de fisioterapia. Ofrece una solución completa que abarca desde la administración de pacientes hasta el control financiero, todo en un entorno seguro y fácil de usar.

### Propuesta de Valor

- **Todo en uno**: Gestión completa de pacientes, citas, sesiones, pagos y reportes
- **Multi-clínica**: Soporte para múltiples clínicas con aislamiento total de datos
- **Multiplataforma**: Disponible en web y dispositivos móviles (Android/iOS)
- **Seguro**: Autenticación robusta y control de acceso basado en roles
- **Tiempo real**: Notificaciones y actualizaciones instantáneas

---

## 2. Tecnologías Utilizadas

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.1.1 | Framework React con App Router |
| React | 19.2.3 | Librería de interfaces de usuario |
| TypeScript | 5 | Tipado estático para mayor robustez |
| Tailwind CSS | 4 | Framework de estilos utility-first |
| shadcn/ui | - | Componentes accesibles y personalizables |

### Backend y Base de Datos
| Tecnología | Propósito |
|------------|-----------|
| Supabase | Backend-as-a-Service con PostgreSQL |
| PostgreSQL | Base de datos relacional |
| Row Level Security | Seguridad a nivel de filas |

### Móvil
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Capacitor | 8.0.1 | Framework para apps nativas |
| Android/iOS | - | Soporte multiplataforma |

### Librerías Principales
- **FullCalendar**: Calendario interactivo de citas
- **React Hook Form + Zod**: Formularios con validación
- **Recharts**: Gráficas y visualizaciones
- **jsPDF**: Generación de facturas y reportes PDF
- **Lucide React**: Iconografía moderna

---

## 3. Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   Web App   │  │  Android    │  │    iOS      │          │
│  │  (Next.js)  │  │ (Capacitor) │  │ (Capacitor) │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SUPABASE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │    Auth     │  │  Database   │  │  Realtime   │          │
│  │             │  │ (PostgreSQL)│  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │   Storage   │  │     RLS     │                           │
│  │             │  │  (Security) │                           │
│  └─────────────┘  └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Modelo Multi-Tenant

Clinova implementa un modelo **multi-tenant** donde cada clínica opera de forma completamente aislada:

- Cada clínica tiene su propio espacio de datos
- Row Level Security (RLS) garantiza el aislamiento
- Un usuario solo puede acceder a datos de su clínica
- Super Admin puede gestionar todas las clínicas

---

## 4. Módulos Principales

### 4.1 Dashboard Principal

El dashboard ofrece una vista rápida del estado de la clínica:

- **Pacientes activos**: Total de pacientes en tratamiento
- **Citas de hoy**: Agenda del día
- **Ingresos mensuales**: Resumen financiero
- **Pagos pendientes**: Cobros por realizar
- **Sesiones completadas**: Productividad del mes
- **Gráficas de evolución**: Tendencias visuales
- **Actividad reciente**: Últimas acciones

### 4.2 Gestión de Pacientes

Módulo completo para el manejo de pacientes:

| Funcionalidad | Descripción |
|---------------|-------------|
| Registro | Alta de nuevos pacientes con datos completos |
| Historial médico | Antecedentes, alergias, condiciones |
| Consentimientos | Firma digital de documentos legales |
| Mapa corporal | Anotación visual de zonas de dolor |
| Documentos | Carga y gestión de archivos |
| Evolución | Gráficas de progreso del tratamiento |
| Pagos | Historial financiero del paciente |

### 4.3 Agenda de Citas

Calendario interactivo con FullCalendar:

- Vista diaria, semanal y mensual
- Arrastrar y soltar para reprogramar
- Filtros por fisioterapeuta
- Estados: Programada, Completada, Cancelada, No asistió
- Asignación automática o manual de profesionales

### 4.4 Sesiones Clínicas (SOAP)

Registro estructurado de cada sesión:

```
┌─────────────────────────────────────────┐
│              NOTA SOAP                   │
├─────────────────────────────────────────┤
│ S - Subjetivo                           │
│     Lo que el paciente reporta          │
├─────────────────────────────────────────┤
│ O - Objetivo                            │
│     Hallazgos del examen físico         │
├─────────────────────────────────────────┤
│ A - Evaluación (Assessment)             │
│     Diagnóstico y análisis              │
├─────────────────────────────────────────┤
│ P - Plan                                │
│     Tratamiento a seguir                │
├─────────────────────────────────────────┤
│ Nivel de dolor: 0-10                    │
└─────────────────────────────────────────┘
```

### 4.5 Fisioterapeutas

Gestión del equipo profesional:

- Perfiles con especialidades y certificaciones
- Número de licencia profesional
- Disponibilidad semanal configurable
- Asignación de pacientes
- Estadísticas de trabajo
- Acceso con cuenta propia

### 4.6 Ejercicios y Prescripciones

Biblioteca completa de ejercicios:

- **Catálogo**: Nombre, descripción, instrucciones
- **Multimedia**: Videos e imágenes demostrativos
- **Dificultad**: Principiante, Intermedio, Avanzado
- **Prescripción**: Series, repeticiones, duración
- **Contraindicaciones**: Advertencias de seguridad
- **Vista paciente**: Acceso desde app móvil

### 4.7 Plantillas de Tratamiento

Protocolos reutilizables:

- Crear plantillas con técnicas predefinidas
- Duración estimada por sesión
- Frecuencia recomendada
- Asignar a múltiples pacientes
- Seguimiento de progreso

### 4.8 Sistema de Pagos

Control financiero completo:

| Método | Icono |
|--------|-------|
| Efectivo | 💵 |
| Tarjeta | 💳 |
| Transferencia | 🏦 |
| Seguro médico | 🏥 |

- Estados: Pendiente, Completado, Cancelado, Reembolsado
- Generación automática de facturas PDF
- Recibos de pago
- Historial por paciente y por clínica

### 4.9 Reportes y Analytics

Inteligencia de negocio:

- **KPIs**: Métricas clave de rendimiento
- **Ingresos**: Análisis financiero por período
- **Asistencia**: Tasa de asistencia de pacientes
- **Crecimiento**: Evolución de la base de pacientes
- **Exportación**: Descarga en PDF

### 4.10 Configuración

Personalización de la clínica:

- Datos de la clínica (nombre, dirección, logo)
- Precios de servicios
- Plantillas de notificaciones
- Políticas de negocio
- Log de auditoría (quién hizo qué y cuándo)

---

## 5. Sistema de Roles y Permisos

### Roles Disponibles

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN                               │
│         Propietario de la plataforma Clinova                │
│         Acceso total a todas las clínicas                   │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│    CLINIC     │   │    CLINIC     │   │    CLINIC     │
│    MANAGER    │   │    MANAGER    │   │    MANAGER    │
│   Clínica A   │   │   Clínica B   │   │   Clínica C   │
└───────────────┘   └───────────────┘   └───────────────┘
        │
        ├── THERAPIST (Fisioterapeuta)
        │       └── Acceso a sus pacientes asignados
        │
        ├── RECEPTIONIST (Recepcionista)
        │       └── Gestión de citas y pagos
        │
        └── PATIENT (Paciente)
                └── Acceso a sus ejercicios y datos
```

### Matriz de Permisos

| Módulo | Super Admin | Clinic Manager | Therapist | Receptionist | Patient |
|--------|:-----------:|:--------------:|:---------:|:------------:|:-------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ❌ |
| Pacientes | ✅ | ✅ | 🔸 | 🔸 | ❌ |
| Citas | ✅ | ✅ | 🔸 | ✅ | ❌ |
| Sesiones | ✅ | ✅ | 🔸 | ❌ | ❌ |
| Pagos | ✅ | ✅ | 🔸 | ✅ | ❌ |
| Ejercicios | ✅ | ✅ | ✅ | ❌ | 🔸 |
| Reportes | ✅ | ✅ | 🔸 | ❌ | ❌ |
| Configuración | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gestión usuarios | ✅ | ✅ | ❌ | ❌ | ❌ |
| Gestión clínicas | ✅ | ❌ | ❌ | ❌ | ❌ |

✅ = Acceso completo | 🔸 = Acceso limitado | ❌ = Sin acceso

---

## 6. Panel de Super Administrador

El Super Admin tiene acceso a un panel exclusivo para gestionar toda la plataforma:

### Dashboard Super Admin
- Total de clínicas registradas
- Clínicas activas vs en periodo de prueba
- Total de usuarios en la plataforma
- Ingresos globales mensuales

### Gestión de Clínicas
- Crear nuevas clínicas
- Ver detalles de cada clínica
- Gestionar suscripciones
- Ver métricas por clínica
- Fecha de próximo pago

### Planes de Suscripción

| Plan | Características |
|------|-----------------|
| **Basic** | Funcionalidades básicas |
| **Professional** | Funcionalidades avanzadas |
| **Enterprise** | Todo incluido + soporte prioritario |

Estados de suscripción: Trial, Active, Cancelled, Suspended

---

## 7. Características Especiales

### 7.1 Notificaciones en Tiempo Real

El sistema envía notificaciones instantáneas:

- 📅 Cita asignada
- 📝 Sesión registrada
- 🔄 Cita actualizada
- ❌ Cita cancelada

Las notificaciones aparecen en la campana del header y se actualizan automáticamente.

### 7.2 Mapa Corporal Interactivo

Permite anotar visualmente en un diagrama del cuerpo humano:

- Zonas de dolor
- Áreas tratadas
- Progresión del tratamiento
- Coordenadas precisas almacenadas

### 7.3 Firma Digital

Captura de firma en dispositivos táctiles para:

- Consentimientos informados
- Autorizaciones de tratamiento
- Políticas de privacidad

### 7.4 Generación de PDFs

Documentos generados automáticamente:

- 📄 Facturas con desglose de servicios
- 🧾 Recibos de pago
- 📊 Reportes clínicos
- 📋 Historial del paciente

### 7.5 Modo Oscuro

Interfaz adaptable con tema claro y oscuro para mayor comodidad visual.

### 7.6 Audit Log

Registro completo de todas las acciones:

```
[2026-01-19 10:30:15] user_id:123 - UPDATE - patients - record:456
[2026-01-19 10:28:00] user_id:123 - INSERT - appointments - record:789
[2026-01-19 10:25:30] user_id:456 - DELETE - sessions - record:012
```

---

## 8. Seguridad

### Autenticación

- **Magic Links**: Acceso sin contraseña vía email
- **Sesiones seguras**: Tokens JWT con expiración
- **Setup inicial**: Configuración de contraseña en primer acceso

### Autorización

- **Row Level Security (RLS)**: Cada query es filtrado por clínica
- **Middleware de Next.js**: Protección de rutas en el servidor
- **Componente `<Can>`**: Renderizado condicional por permisos

### Aislamiento de Datos

```sql
-- Ejemplo de política RLS
CREATE POLICY "clinic_isolation" ON patients
FOR ALL USING (
  clinic_id = (SELECT clinic_id FROM user_profiles WHERE id = auth.uid())
);
```

Esto garantiza que:
- Un usuario de Clínica A **nunca** puede ver datos de Clínica B
- Las consultas son filtradas automáticamente
- No es posible "hackear" el frontend para acceder a otros datos

---

## 9. Base de Datos

### Diagrama de Entidades Principales

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   clinics   │───────│user_profiles│───────│  therapists │
└─────────────┘       └─────────────┘       └─────────────┘
       │                                           │
       │              ┌─────────────┐              │
       └──────────────│  patients   │──────────────┘
                      └─────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
       ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│appointments │       │  sessions   │       │  payments   │
└─────────────┘       └─────────────┘       └─────────────┘
       │
       ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  exercises  │───────│patient_     │       │ treatment_  │
│             │       │exercises    │       │ templates   │
└─────────────┘       └─────────────┘       └─────────────┘
```

### Tablas Principales

| Tabla | Propósito |
|-------|-----------|
| `clinics` | Información de cada clínica |
| `user_profiles` | Perfiles de usuario con rol |
| `therapists` | Datos de fisioterapeutas |
| `patients` | Registro de pacientes |
| `appointments` | Citas programadas |
| `sessions` | Notas SOAP de sesiones |
| `payments` | Transacciones financieras |
| `exercises` | Catálogo de ejercicios |
| `patient_exercises` | Prescripciones |
| `treatment_templates` | Plantillas de tratamiento |
| `patient_documents` | Archivos subidos |
| `body_map_annotations` | Anotaciones corporales |
| `patient_consents` | Consentimientos firmados |
| `audit_log` | Historial de acciones |
| `notifications` | Notificaciones del sistema |

---

## 10. Aplicación Móvil

Clinova está preparada para dispositivos móviles mediante **Capacitor**:

### Características Móviles

- Misma funcionalidad que la versión web
- Interfaz responsive adaptada
- Acceso offline (próximamente)
- Notificaciones push (próximamente)

### Plataformas Soportadas

- **Android**: API 21+ (Android 5.0 Lollipop)
- **iOS**: iOS 13+

### Compilación

```bash
# Sincronizar cambios
npm run mobile:sync

# Abrir en Android Studio
npm run mobile:open:android

# Abrir en Xcode
npm run mobile:open:ios
```

---

## 11. Flujos de Trabajo

### Flujo: Nueva Cita

```
1. Recepcionista abre Agenda
         │
         ▼
2. Click en día/hora deseado
         │
         ▼
3. Selecciona paciente (o crea nuevo)
         │
         ▼
4. Asigna fisioterapeuta
         │
         ▼
5. Confirma la cita
         │
         ▼
6. Fisioterapeuta recibe notificación
         │
         ▼
7. Paciente asiste a la cita
         │
         ▼
8. Fisioterapeuta registra sesión SOAP
         │
         ▼
9. Se genera pago (si aplica)
```

### Flujo: Prescripción de Ejercicios

```
1. Fisioterapeuta abre perfil del paciente
         │
         ▼
2. Va a sección "Ejercicios"
         │
         ▼
3. Busca ejercicio en catálogo
         │
         ▼
4. Configura: series, repeticiones, frecuencia
         │
         ▼
5. Asigna al paciente
         │
         ▼
6. Paciente ve ejercicios en su app móvil
         │
         ▼
7. Paciente marca ejercicios completados
         │
         ▼
8. Fisioterapeuta ve adherencia en reportes
```

---

## 12. Roadmap Futuro

### Próximas Funcionalidades

| Prioridad | Funcionalidad | Descripción |
|-----------|---------------|-------------|
| Alta | Recordatorios SMS/Email | Notificaciones automáticas de citas |
| Alta | Integración Stripe | Pagos en línea |
| Media | Exportación Excel/CSV | Descarga de datos |
| Media | Modo offline | Trabajo sin conexión |
| Media | Internacionalización | Soporte multi-idioma |
| Baja | Telemedicina | Videoconsultas |
| Baja | IA para diagnóstico | Asistente inteligente |

---

## 13. Requisitos del Sistema

### Para Usuarios

| Requisito | Especificación |
|-----------|----------------|
| Navegador | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| Conexión | Internet estable |
| Dispositivo | PC, tablet o smartphone |

### Para Desarrollo

| Requisito | Versión |
|-----------|---------|
| Node.js | 18.0+ |
| npm | 8.0+ |
| Git | 2.30+ |

---

## 14. Instalación y Despliegue

### Desarrollo Local

```bash
# Clonar repositorio
git clone [url-del-repositorio]

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con credenciales de Supabase

# Ejecutar en desarrollo
npm run dev

# Acceder en http://localhost:3000
```

### Producción

```bash
# Build de producción
npm run build

# Ejecutar
npm run start
```

---

## 15. Soporte y Contacto

Para soporte técnico o consultas comerciales:

- **Email**: soporte@clinova.com
- **Documentación**: /docs
- **Issues**: Reportar en el repositorio

---

## 16. Glosario

| Término | Definición |
|---------|------------|
| **SOAP** | Subjective, Objective, Assessment, Plan - formato de notas clínicas |
| **RLS** | Row Level Security - seguridad a nivel de filas en PostgreSQL |
| **Multi-tenant** | Arquitectura donde múltiples clientes comparten infraestructura |
| **Capacitor** | Framework para convertir apps web en apps nativas |
| **Magic Link** | Método de autenticación sin contraseña |

---

*Clinova - Transformando la gestión de clínicas de fisioterapia*

**Versión del documento**: 1.0
**Última actualización**: Enero 2026
