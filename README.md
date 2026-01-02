# Clinova - Sistema de Gestión para Clínicas de Fisioterapia

Sistema completo de gestión clínica construido con Next.js 15, Supabase y TypeScript.

## Funcionalidades Implementadas

### Módulos Principales
- **Gestión de Pacientes**: Registro, búsqueda y expedientes completos
- **Agenda de Citas**: Calendario interactivo para programar y gestionar citas
- **Sesiones Clínicas**: Notas SOAP (Subjetivo, Objetivo, Evaluación, Plan) con nivel de dolor
- **Módulo de Pagos**: Registro de pagos, facturación, y estadísticas financieras
- **Dashboard**: Métricas en tiempo real (ingresos, sesiones, citas del día)

### Características
- Autenticación con Supabase Auth
- Base de datos PostgreSQL con RLS (Row Level Security)
- Generación de facturas en PDF
- Filtros avanzados en pagos (método, estado, fechas)
- Historial completo por paciente (citas, sesiones, pagos)
- Interfaz moderna y responsiva con Tailwind CSS

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

Ejecuta los siguientes scripts SQL en el SQL Editor de Supabase (en este orden):

1. `supabase_schema_patients.sql` - Crea la tabla de pacientes
2. `supabase_schema_appointments.sql` - Crea la tabla de citas
3. `supabase_schema_sessions.sql` - Crea la tabla de sesiones
4. `supabase_schema_payments.sql` - Crea la tabla de pagos

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
│   │   ├── page.tsx                 # Dashboard principal
│   │   ├── pacientes/               # Módulo de pacientes
│   │   │   ├── page.tsx             # Lista de pacientes
│   │   │   ├── nuevo/               # Formulario nuevo paciente
│   │   │   └── [id]/                # Detalles del paciente
│   │   ├── agenda/                  # Módulo de citas
│   │   │   ├── page.tsx             # Calendario
│   │   │   └── nueva/               # Formulario nueva cita
│   │   ├── sesiones/                # Módulo de sesiones
│   │   │   └── nueva/               # Formulario SOAP
│   │   └── pagos/                   # Módulo de pagos
│   │       ├── page.tsx             # Lista de pagos
│   │       └── nuevo/               # Formulario nuevo pago
│   └── login/                       # Autenticación
├── components/
│   ├── layout/                      # Sidebar, Header
│   ├── patients/                    # Componentes de pacientes
│   └── payments/                    # InvoiceGenerator
└── utils/
    └── supabase/                    # Cliente de Supabase
```

## Flujo de Trabajo

1. **Crear Paciente** → `/dashboard/pacientes/nuevo`
2. **Agendar Cita** → `/dashboard/agenda/nueva`
3. **Click en Cita del Calendario** → Redirige a `/dashboard/sesiones/nueva`
4. **Registrar Sesión SOAP** → Marca cita como completada
5. **Registrar Pago** → `/dashboard/pagos/nuevo`
6. **Ver Detalles del Paciente** → Historial completo

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

## Próximas Mejoras Sugeridas

- [ ] Edición y eliminación de citas
- [ ] Plantillas de tratamiento
- [ ] Prescripción de ejercicios
- [ ] Reportes y estadísticas avanzadas
- [ ] Exportación de datos (Excel, PDF)
- [ ] Recordatorios automáticos por email/SMS
- [ ] Gestión de múltiples terapeutas

## Licencia

Proyecto privado - Todos los derechos reservados
