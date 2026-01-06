# Clinova - Sistema de Gestión para Clínicas de Fisioterapia

Sistema completo de gestión clínica construido con Next.js 15, Supabase y TypeScript.

## Funcionalidades Implementadas

### Módulos Principales

#### 1. Gestión de Pacientes
- Registro y búsqueda de pacientes
- Expedientes completos con información personal
- Historial médico completo (alergias, condiciones crónicas, medicamentos, cirugías)
- Formulario de edición de historial médico
- Evaluación inicial detallada
- Información de contacto de emergencia
- Cálculo automático de IMC
- Vista de ejercicios prescritos por paciente
- Vista de planes de tratamiento asignados
- Panel de acciones rápidas (nueva cita, pago, prescripción, evaluación)

#### 2. Agenda de Citas
- Calendario semanal interactivo con vista de horas
- Creación de nuevas citas
- Edición de citas existentes
- Eliminación de citas
- Estados de cita (programada, completada, cancelada, no asistió)
- Filtrado por paciente y estado
- Click en cita para editar directamente desde el calendario

#### 3. Gestión de Fisioterapeutas
- Registro completo de fisioterapeutas
- Información personal y profesional (licencia, especialidades, certificaciones)
- Gestión de horarios de disponibilidad
- Asignación de pacientes a terapeutas
- Estadísticas por terapeuta (pacientes, citas, sesiones)
- Edición completa de perfiles
- Estados de terapeuta (activo, inactivo, de baja)
- Contacto de emergencia

#### 4. Sesiones Clínicas
- Vista completa de todas las sesiones con filtros avanzados
- Filtrado por paciente, terapeuta y rango de fechas
- Notas SOAP (Subjetivo, Objetivo, Evaluación, Plan)
- Registro de nivel de dolor (escala 0-10)
- Asociación automática con citas
- Edición de sesiones existentes
- Historial completo de sesiones por paciente
- Vista detallada de cada sesión

#### 5. Plantillas de Tratamiento
- Creación de plantillas reutilizables
- Categorización de plantillas
- Objetivos y contraindicaciones
- Técnicas ordenadas con duración estimada
- Duración estimada del tratamiento en semanas
- Asignación de plantillas a pacientes
- Notas personalizadas por asignación
- Estados de plan (activo, pausado, completado, cancelado)
- Cálculo automático de fecha de fin

#### 6. Biblioteca de Ejercicios
- Catálogo completo de ejercicios
- Categorización por tipo de ejercicio
- Clasificación por parte del cuerpo
- Niveles de dificultad (principiante, intermedio, avanzado)
- Instrucciones detalladas paso a paso
- URLs de video e imagen
- Equipamiento necesario
- Contraindicaciones
- Prescripción de ejercicios a pacientes con dosificación completa:
  - Series y repeticiones
  - Duración en minutos
  - Frecuencia por semana
  - Instrucciones personalizadas
  - Fechas de inicio y fin
  - Estados (activo, pausado, completado)
- Vista de ejercicios prescritos por paciente con filtros
- Portal de ejercicios para pacientes (`/dashboard/mis-ejercicios`)
- Registro de adherencia de ejercicios
- Tasas de cumplimiento automáticas

#### 7. Historial Médico
- Información física (tipo de sangre, altura, peso)
- Alergias con gestión dinámica
- Condiciones crónicas
- Medicamentos actuales
- Cirugías previas
- Historial familiar
- Notas de estilo de vida
- Evaluaciones iniciales completas:
  - Motivo de consulta
  - Historia de enfermedad actual
  - Evaluación del dolor (localización, intensidad, descripción)
  - Factores agravantes y que alivian
  - Limitaciones funcionales
  - Tratamientos previos
  - Hallazgos de evaluación
  - Diagnóstico fisioterapéutico
  - Objetivos del tratamiento
  - Plan de tratamiento recomendado
  - Pronóstico
- Tabla de mediciones y valoraciones (ROM, fuerza, balance)

#### 8. Módulo de Pagos
- Registro de pagos con múltiples métodos (efectivo, tarjeta, transferencia, seguro)
- Estados de pago (pendiente, completado, cancelado, reembolsado)
- Asociación con sesiones
- Generación de facturas en PDF
- Número de factura automático
- Filtros avanzados (método, estado, rango de fechas)
- Estadísticas financieras por paciente
- KPIs financieros en dashboard

#### 9. Configuración del Sistema
- Información general de la clínica (nombre, dirección, contacto)
- Configuración fiscal (RFC, régimen)
- Configuración de citas (duración predeterminada, políticas de cancelación)
- Precios y moneda predeterminados
- Horarios de atención
- Políticas de cancelación
- Notificaciones por email y SMS
- Catálogo de servicios y precios
- Plantillas de notificaciones personalizables

#### 10. Reportes y Estadísticas
- Total de pacientes activos
- Estadísticas de citas (programadas, completadas, canceladas)
- Tasa de asistencia y no-shows
- Ingresos totales y pendientes
- Total de sesiones realizadas
- Crecimiento de pacientes
- Distribución de estados de citas
- Análisis financiero

#### 11. Dashboard Principal
- Métricas en tiempo real:
  - Pacientes activos
  - Citas de hoy
  - Sesiones del mes
  - Ingresos del mes
  - Pagos pendientes
  - Total de pacientes
- Citas del día con estados
- Navegación rápida a todos los módulos

### Características Técnicas
- Autenticación con Supabase Auth
- Base de datos PostgreSQL con RLS (Row Level Security)
- Relaciones complejas con foreign keys y cascade deletes
- Índices optimizados para consultas
- Arrays de PostgreSQL para listas dinámicas
- Tipos ENUM para estados
- Constraints de validación
- Generación de facturas en HTML/PDF
- Filtros avanzados en todas las vistas
- Componentes reutilizables
- Server Components y Client Components optimizados
- Interfaz moderna y responsiva con Tailwind CSS
- Componentes de shadcn/ui
- Iconos de Lucide React

## Configuración Inicial

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
```

### 3. Configurar Base de Datos en Supabase

**Opción Recomendada** - Ejecutar todo en un solo script:
- Ejecuta `supabase_schema_complete.sql` en el SQL Editor de Supabase

**Opción Alternativa** - Ejecutar scripts individuales (en este orden):
1. `supabase_schema_patients.sql` - Tabla de pacientes
2. `supabase_schema_therapists.sql` - Tabla de fisioterapeutas
3. `supabase_schema_appointments.sql` - Tabla de citas
4. `supabase_schema_sessions.sql` - Tabla de sesiones
5. `supabase_schema_payments.sql` - Tabla de pagos
6. `supabase_schema_treatment_templates.sql` - Plantillas de tratamiento
7. `supabase_schema_exercises.sql` - Biblioteca de ejercicios
8. `supabase_schema_medical_history.sql` - Historial médico
9. `supabase_schema_settings.sql` - Configuraciones del sistema

### 4. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
src/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx                          # Dashboard principal con KPIs
│   │   ├── pacientes/                        # Módulo de pacientes
│   │   │   ├── page.tsx                      # Lista de pacientes con búsqueda
│   │   │   ├── nuevo/                        # Formulario nuevo paciente
│   │   │   └── [id]/                         # Detalles del paciente
│   │   │       ├── page.tsx                  # Vista completa del paciente
│   │   │       └── evaluacion/               # Evaluación inicial
│   │   ├── fisioterapeutas/                  # Módulo de fisioterapeutas
│   │   │   ├── page.tsx                      # Lista de fisioterapeutas
│   │   │   ├── nuevo/                        # Formulario nuevo fisioterapeuta
│   │   │   └── [id]/                         # Detalles del fisioterapeuta
│   │   ├── agenda/                           # Módulo de citas
│   │   │   ├── page.tsx                      # Calendario interactivo
│   │   │   ├── nueva/                        # Formulario nueva cita
│   │   │   └── [id]/
│   │   │       └── editar/                   # Editar/eliminar cita
│   │   ├── sesiones/                         # Módulo de sesiones
│   │   │   ├── page.tsx                      # Lista de sesiones con filtros
│   │   │   ├── nueva/                        # Formulario SOAP
│   │   │   └── [id]/                         # Detalles y edición de sesión
│   │   ├── plantillas/                       # Módulo de plantillas
│   │   │   ├── page.tsx                      # Lista de plantillas
│   │   │   ├── nueva/                        # Formulario nueva plantilla
│   │   │   └── [id]/                         # Detalles de plantilla
│   │   ├── ejercicios/                       # Módulo de ejercicios
│   │   │   ├── page.tsx                      # Biblioteca de ejercicios
│   │   │   ├── nuevo/                        # Formulario nuevo ejercicio
│   │   │   └── [id]/                         # Detalles del ejercicio
│   │   ├── mis-ejercicios/                   # Portal del paciente
│   │   │   └── page.tsx                      # Ejercicios y adherencia
│   │   ├── pagos/                            # Módulo de pagos
│   │   │   ├── page.tsx                      # Lista de pagos con filtros
│   │   │   └── nuevo/                        # Formulario nuevo pago
│   │   ├── reportes/                         # Módulo de reportes
│   │   │   └── page.tsx                      # Estadísticas y KPIs
│   │   └── configuracion/                    # Módulo de configuración
│   │       └── page.tsx                      # Configuración del sistema
│   └── login/                                # Autenticación
├── components/
│   ├── layout/                               # Sidebar, Header
│   ├── agenda/                               # CalendarView, AppointmentCard
│   ├── patients/                             # Componentes de pacientes
│   │   ├── MedicalHistorySection.tsx         # Vista de historial médico
│   │   ├── MedicalHistoryForm.tsx            # Formulario de edición
│   │   ├── PatientActions.tsx                # Panel de acciones
│   │   └── PatientPrescriptionsView.tsx      # Vista de prescripciones
│   ├── therapists/                           # Componentes de fisioterapeutas
│   │   ├── TherapistList.tsx                 # Lista de fisioterapeutas
│   │   └── TherapistEditForm.tsx             # Formulario de edición
│   ├── sessions/                             # Componentes de sesiones
│   │   ├── SessionList.tsx                   # Lista de sesiones con filtros
│   │   └── SessionEditForm.tsx               # Formulario de edición SOAP
│   ├── exercises/                            # Componentes de ejercicios
│   │   └── PrescriptionForm.tsx              # Formulario de prescripción
│   ├── treatments/                           # Componentes de tratamientos
│   │   └── TreatmentPlanAssignment.tsx       # Asignación de planes
│   ├── payments/                             # InvoiceGenerator
│   ├── settings/                             # Componentes de configuración
│   │   ├── SettingsTabs.tsx                  # Tabs de configuración
│   │   ├── ClinicSettingsForm.tsx            # Formulario de clínica
│   │   ├── ServicePricesList.tsx             # Lista de servicios
│   │   └── NotificationTemplatesList.tsx     # Plantillas de notificaciones
│   └── ui/                                   # Componentes shadcn/ui
├── types/                                    # Definiciones de tipos TypeScript
│   ├── patient.ts                            # Tipos de pacientes
│   ├── therapist.ts                          # Tipos de fisioterapeutas
│   ├── appointment.ts                        # Tipos de citas
│   ├── session.ts                            # Tipos de sesiones
│   ├── payment.ts                            # Tipos de pagos
│   ├── exercise.ts                           # Tipos de ejercicios
│   ├── treatment.ts                          # Tipos de tratamientos
│   ├── medical-history.ts                    # Tipos de historial médico
│   └── settings.ts                           # Tipos de configuración
└── utils/
    └── supabase/                             # Cliente de Supabase
```

## Flujos de Trabajo

### Flujo Básico de Atención
1. **Crear Paciente** → `/dashboard/pacientes/nuevo`
2. **Completar Historial Médico** → Click en "Editar Historial" en página del paciente
3. **Realizar Evaluación Inicial** → Click en "Evaluación Inicial" en página del paciente
4. **Agendar Cita** → `/dashboard/agenda/nueva` o desde la página del paciente
5. **Editar/Eliminar Cita** → Click en la cita desde el calendario
6. **Registrar Sesión SOAP** → `/dashboard/sesiones/nueva` desde la cita
7. **Registrar Pago** → `/dashboard/pagos/nuevo` o desde la página del paciente
8. **Ver Historial Completo** → Página de detalles del paciente

### Flujo de Prescripción de Ejercicios
1. **Crear Ejercicios** → `/dashboard/ejercicios/nuevo`
2. **Prescribir a Paciente** → Click en "Prescribir Ejercicios" en página del paciente
3. **Configurar Dosificación** → Series, repeticiones, frecuencia, instrucciones
4. **Paciente ve sus Ejercicios** → `/dashboard/mis-ejercicios`
5. **Paciente registra Adherencia** → Click en "Marcar como Completado"
6. **Terapeuta revisa Adherencia** → Vista de prescripciones en página del paciente

### Flujo de Planes de Tratamiento
1. **Crear Plantilla** → `/dashboard/plantillas/nueva`
2. **Agregar Técnicas** → Definir técnicas con duración
3. **Asignar a Paciente** → Click en "Asignar Plan" en página del paciente
4. **Seleccionar Plantilla** → Elegir de plantillas existentes
5. **Personalizar** → Ajustar fechas y notas específicas
6. **Seguimiento** → Monitorear progreso del plan

## Tecnologías

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Calendario**: FullCalendar
- **Iconos**: Lucide React

## Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
```

## Funcionalidades Completadas

- [x] Gestión completa de pacientes con historial médico
- [x] Gestión completa de fisioterapeutas
- [x] Asignación de pacientes a fisioterapeutas
- [x] Edición y eliminación de citas
- [x] Formulario para editar historial médico
- [x] Evaluación inicial detallada
- [x] Vista completa de sesiones con filtros avanzados
- [x] Edición de sesiones SOAP existentes
- [x] Portal de ejercicios para pacientes
- [x] Prescripción de ejercicios con dosificación
- [x] Registro de adherencia de ejercicios
- [x] Asignación de plantillas de tratamiento
- [x] Generación de facturas en PDF
- [x] Módulo completo de pagos y finanzas
- [x] Reportes y estadísticas
- [x] Configuración del sistema (clínica, servicios, notificaciones)

## Próximas Mejoras Sugeridas

- [ ] Gráficas visuales en reportes (Chart.js o Recharts)
- [ ] Exportación de datos (Excel, PDF de reportes)
- [ ] Vista de tratamientos activos por paciente
- [ ] Edición y eliminación de ejercicios y plantillas
- [ ] Recordatorios automáticos por email/SMS
- [ ] Gestión avanzada de horarios de disponibilidad de fisioterapeutas
- [ ] Roles y permisos (admin, terapeuta, recepcionista)
- [ ] Edición avanzada de servicios y precios
- [ ] Editor de plantillas de notificaciones
- [ ] Integración con dispositivos de medición
- [ ] Sistema de inventario de equipamiento
- [ ] Firma digital para consentimientos
- [ ] Backup automático de datos
- [ ] Modo oscuro (dark mode)
- [ ] Internacionalización (i18n)
- [ ] App móvil con React Native
- [ ] Calendario mensual y diario (además del semanal)
- [ ] Notas de progreso entre sesiones
- [ ] Galería de fotos/documentos por paciente
- [ ] Sistema de facturación recurrente
- [ ] Integración con pasarelas de pago
- [ ] Dashboard personalizable por usuario

## Licencia

Proyecto privado - Todos los derechos reservados
