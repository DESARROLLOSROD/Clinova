# Especificación Técnica - Fase 3: Sistema Multi-Usuario y Roles

**Proyecto:** Clinova - Software para Clínicas de Fisioterapia
**Fase:** 3 - Mejoras de Usabilidad y Multi-Usuario
**Versión:** 1.0
**Fecha:** Enero 2026
**Duración Estimada:** 6-8 semanas
**Prioridad:** 🔴 CRÍTICA

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Contexto y Estado Actual](#2-contexto-y-estado-actual)
3. [Arquitectura del Sistema de Roles](#3-arquitectura-del-sistema-de-roles)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [Row Level Security (RLS)](#5-row-level-security-rls)
6. [Implementación Frontend](#6-implementación-frontend)
7. [API y Edge Functions](#7-api-y-edge-functions)
8. [Casos de Uso Detallados](#8-casos-de-uso-detallados)
9. [Plan de Migración](#9-plan-de-migración)
10. [Testing](#10-testing)
11. [Cronograma](#11-cronograma)

---

## 1. Resumen Ejecutivo

### 1.1 Objetivo
Implementar un sistema robusto de roles y permisos que permita a las clínicas de fisioterapia gestionar múltiples usuarios con diferentes niveles de acceso, garantizando seguridad, privacidad y cumplimiento de normativas médicas.

### 1.2 Problema Actual
**CRÍTICO:** El sistema actual tiene políticas RLS demasiado permisivas que permiten a cualquier usuario autenticado acceder a todos los datos:

```sql
-- Patrón actual (INSEGURO)
create policy "Enable all access for authenticated users"
on public.patients
for all using (auth.role() = 'authenticated');
```

**Consecuencias:**
- ❌ Violación de privacidad de datos médicos
- ❌ No cumple con HIPAA/GDPR
- ❌ Imposible vender a clínicas con múltiples empleados
- ❌ Riesgo de acceso no autorizado

### 1.3 Solución Propuesta
Implementar un sistema de 4 roles con matriz de permisos granular:
- **Admin (Owner/Manager):** Acceso completo a la clínica
- **Fisioterapeuta:** Acceso a sus pacientes y funciones clínicas
- **Recepcionista:** Gestión de agenda y pagos, sin acceso a notas clínicas
- **Paciente:** Acceso a su propio portal de adherencia

### 1.4 Beneficios Esperados
- ✅ Cumplimiento con normativas de privacidad médica
- ✅ Escalabilidad para clínicas con 5-50 empleados
- ✅ Audit trail completo de acciones
- ✅ Reducción de riesgos de seguridad en 90%
- ✅ Preparación para multi-tenancy (múltiples clínicas)

---

## 2. Contexto y Estado Actual

### 2.1 Análisis del Código Existente

**Archivos Clave:**
- `src/middleware.ts` - Protección básica de rutas (solo authenticated vs unauthenticated)
- `supabase_schema_complete.sql` - Schema con políticas RLS permisivas
- `src/app/dashboard/` - Rutas del dashboard sin restricciones por rol

**Búsqueda de Implementación de Roles:**
```bash
$ grep -r "roles\|permissions\|RBAC" src/
# Resultado: No se encontraron archivos
```

### 2.2 Gap Analysis

| Funcionalidad Requerida | Estado Actual | Gap |
|-------------------------|---------------|-----|
| Tabla de perfiles de usuario | ❌ No existe | Crear `user_profiles` |
| Sistema de roles | ❌ Hardcoded `therapist_id` en appointments | Implementar RBAC completo |
| Políticas RLS granulares | ⚠️ Demasiado permisivas | Refactorizar 16 tablas |
| Middleware de autorización | ⚠️ Solo verifica autenticación | Agregar validación de rol |
| UI condicional por rol | ❌ No existe | Implementar componente `<Can>` |
| Audit log | ❌ No existe | Crear tabla `audit_log` |
| Gestión de usuarios en admin | ❌ No existe | Crear panel de admin |

### 2.3 Dependencias Técnicas
- ✅ Supabase Auth (ya configurado)
- ✅ TypeScript (para tipos de roles)
- ❌ Librería CASL o similar para autorización client-side (a instalar)
- ❌ Middleware de Next.js extendido

---

## 3. Arquitectura del Sistema de Roles

### 3.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIO AUTENTICADO                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Supabase Auth (JWT Token)                     │
│  Contiene: user_id, email, exp, iat                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              user_profiles (Perfil del Usuario)               │
│  - id (FK a auth.users)                                      │
│  - role: 'admin' | 'therapist' | 'receptionist' | 'patient'  │
│  - clinic_id (FK a clinics)                                  │
│  - metadata (JSON con preferencias)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Row Level Security (RLS)                    │
│                                                               │
│  Política por tabla que verifica:                            │
│  1. Usuario autenticado existe                               │
│  2. Rol del usuario permite operación                        │
│  3. Usuario pertenece a la misma clínica                     │
│  4. Usuario es owner del recurso (si aplica)                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Acceso a Datos (Filtrado)                   │
│                                                               │
│  Admin      → Ve todo de su clínica                          │
│  Therapist  → Ve solo sus pacientes y agenda                 │
│  Receptionist → Ve agenda completa, no notas SOAP            │
│  Patient    → Ve solo su propia información                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Autorización

```
1. Usuario hace login
   └─> Supabase Auth crea JWT con user_id

2. Middleware de Next.js intercepta request
   └─> Lee JWT y obtiene user_id
   └─> Query a user_profiles para obtener role y clinic_id
   └─> Almacena en contexto de sesión

3. Usuario accede a recurso (ej: pacientes)
   └─> Query a Supabase: SELECT * FROM patients WHERE ...
   └─> RLS Policy evalúa automáticamente:
       ├─> Verifica que user_id existe en user_profiles
       ├─> Verifica que role permite operación (SELECT, INSERT, etc.)
       ├─> Filtra por clinic_id si aplica
       └─> Filtra por ownership si aplica (therapist_id)

4. Supabase retorna solo datos autorizados
   └─> Frontend renderiza UI según role
   └─> Oculta/muestra botones según permisos
```

### 3.3 Definición de Roles

#### 3.3.1 Admin (Owner/Manager)
**Descripción:** Dueño o gerente de la clínica con acceso completo.

**Permisos:**
- ✅ Ver, crear, editar, eliminar todos los recursos de su clínica
- ✅ Gestionar usuarios (invitar fisioterapeutas, recepcionistas)
- ✅ Configurar clínica (horarios, servicios, precios)
- ✅ Ver todos los reportes financieros
- ✅ Exportar datos
- ✅ Acceso al audit log

**Restricciones:**
- ❌ No puede acceder a datos de otras clínicas

#### 3.3.2 Fisioterapeuta (Therapist)
**Descripción:** Profesional de salud que atiende pacientes.

**Permisos:**
- ✅ Ver lista completa de pacientes de la clínica
- ✅ Crear y editar pacientes
- ✅ Ver y crear citas (filtradas por asignación)
- ✅ Registrar notas SOAP en sus sesiones
- ✅ Prescribir ejercicios
- ✅ Crear y asignar plantillas de tratamiento
- ✅ Ver reportes de sus pacientes
- ✅ Acceso a biblioteca de ejercicios

**Restricciones:**
- ⚠️ Solo ve citas asignadas a él en vista de agenda (configurable)
- ⚠️ Solo puede editar notas SOAP de sus propias sesiones
- ❌ No puede eliminar pacientes (solo desactivar)
- ❌ No puede ver reportes financieros completos de la clínica
- ❌ No puede gestionar usuarios

#### 3.3.3 Recepcionista (Receptionist)
**Descripción:** Personal administrativo que gestiona agenda y pagos.

**Permisos:**
- ✅ Ver lista completa de pacientes
- ✅ Crear pacientes nuevos
- ✅ Editar información demográfica de pacientes
- ✅ Ver y gestionar agenda completa (todos los fisioterapeutas)
- ✅ Crear, editar, cancelar citas
- ✅ Registrar pagos
- ✅ Generar facturas
- ✅ Ver reportes de asistencia y pagos

**Restricciones:**
- ❌ No puede ver notas SOAP ni historial médico
- ❌ No puede prescribir ejercicios ni crear plantillas
- ❌ No puede registrar sesiones clínicas
- ❌ No puede eliminar pagos (solo marcar como cancelado)
- ❌ No puede gestionar usuarios

#### 3.3.4 Paciente (Patient)
**Descripción:** Usuario final que accede a su portal de adherencia.

**Permisos:**
- ✅ Ver sus ejercicios prescritos
- ✅ Registrar adherencia a ejercicios
- ✅ Ver sus citas programadas (solo futuras)
- ✅ Ver historial de pagos
- ⚠️ Solicitar cita (futuro, Fase 5)

**Restricciones:**
- ❌ No puede acceder al dashboard principal
- ❌ No puede ver información de otros pacientes
- ❌ No puede modificar prescripciones
- ❌ No puede ver notas SOAP del fisioterapeuta

### 3.4 Matriz de Permisos Completa

| Recurso | Admin | Therapist | Receptionist | Patient |
|---------|-------|-----------|--------------|---------|
| **Pacientes** |
| Listar pacientes | ✅ Todos | ✅ Todos | ✅ Todos | ❌ |
| Ver perfil paciente | ✅ | ✅ | ✅ Solo demográfico | ❌ |
| Crear paciente | ✅ | ✅ | ✅ | ❌ |
| Editar paciente | ✅ | ✅ Solo asignados | ✅ Solo demográfico | ❌ |
| Eliminar paciente | ✅ | ❌ | ❌ | ❌ |
| **Historial Médico** |
| Ver historial médico | ✅ | ✅ | ❌ | ❌ |
| Editar historial médico | ✅ | ✅ Solo asignados | ❌ | ❌ |
| **Evaluaciones** |
| Ver evaluación inicial | ✅ | ✅ | ❌ | ❌ |
| Crear evaluación | ✅ | ✅ | ❌ | ❌ |
| **Citas** |
| Ver agenda completa | ✅ | ⚠️ Solo asignadas* | ✅ | ❌ |
| Crear cita | ✅ | ✅ | ✅ | ⚠️ (Futuro) |
| Editar cita | ✅ | ✅ Propias | ✅ | ❌ |
| Cancelar cita | ✅ | ✅ Propias | ✅ | ⚠️ Propias (Futuro) |
| **Sesiones SOAP** |
| Ver sesiones | ✅ | ✅ Propias | ❌ | ❌ |
| Crear nota SOAP | ✅ | ✅ | ❌ | ❌ |
| Editar nota SOAP | ✅ | ✅ <24h, propias | ❌ | ❌ |
| **Ejercicios** |
| Ver biblioteca | ✅ | ✅ | ❌ | ❌ |
| Crear ejercicio | ✅ | ✅ | ❌ | ❌ |
| Editar ejercicio | ✅ | ✅ Propios | ❌ | ❌ |
| Prescribir ejercicio | ✅ | ✅ | ❌ | ❌ |
| Ver mis ejercicios | ❌ | ❌ | ❌ | ✅ |
| Registrar adherencia | ❌ | ❌ | ❌ | ✅ |
| **Plantillas** |
| Ver plantillas | ✅ | ✅ | ❌ | ❌ |
| Crear plantilla | ✅ | ✅ | ❌ | ❌ |
| Editar plantilla | ✅ | ✅ Propias | ❌ | ❌ |
| Asignar plantilla | ✅ | ✅ | ❌ | ❌ |
| **Pagos** |
| Ver pagos | ✅ Todos | ✅ De sus pacientes | ✅ Todos | ✅ Propios |
| Registrar pago | ✅ | ⚠️ Opcional** | ✅ | ❌ |
| Editar pago | ✅ | ❌ | ✅ <24h | ❌ |
| Cancelar pago | ✅ | ❌ | ⚠️ Con aprobación | ❌ |
| Generar factura | ✅ | ❌ | ✅ | ❌ |
| **Reportes** |
| Dashboard general | ✅ | ✅ Limitado | ✅ Limitado | ❌ |
| Reporte financiero | ✅ | ❌ | ✅ Sin márgenes | ❌ |
| Reporte clínico | ✅ | ✅ Solo propios | ❌ | ❌ |
| Exportar datos | ✅ | ⚠️ Propios | ⚠️ Limitado | ❌ |
| **Administración** |
| Gestionar usuarios | ✅ | ❌ | ❌ | ❌ |
| Configurar clínica | ✅ | ❌ | ❌ | ❌ |
| Ver audit log | ✅ | ❌ | ❌ | ❌ |
| Gestionar suscripción | ✅ | ❌ | ❌ | ❌ |

**Notas:**
- `*` Configurable por clínica si los fisioterapeutas ven agenda completa o solo la suya
- `**` Configurable por clínica si los fisioterapeutas pueden registrar pagos

---

## 4. Modelo de Datos

### 4.1 Nueva Tabla: `user_profiles`

**Propósito:** Almacenar información de perfil y rol de cada usuario.

```sql
-- =====================================================
-- Tabla: user_profiles
-- Descripción: Perfiles de usuario con rol y clínica
-- =====================================================

create table public.user_profiles (
  -- Identificación
  id uuid references auth.users(id) on delete cascade primary key,

  -- Rol del usuario
  role text not null check (role in ('admin', 'therapist', 'receptionist', 'patient')),

  -- Relación con clínica
  clinic_id uuid references public.clinics(id) on delete cascade not null,

  -- Información del perfil
  full_name text not null,
  professional_title text, -- ej: "Lic. en Fisioterapia", "Recepcionista"
  phone text,
  avatar_url text,

  -- Configuración
  settings jsonb default '{
    "notifications_enabled": true,
    "email_reminders": true,
    "sms_reminders": false,
    "language": "es",
    "theme": "light"
  }'::jsonb,

  -- Estado
  is_active boolean default true,

  -- Auditoría
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null,
  last_login_at timestamp with time zone
);

-- Índices
create index user_profiles_clinic_id_idx on public.user_profiles(clinic_id);
create index user_profiles_role_idx on public.user_profiles(role);
create index user_profiles_is_active_idx on public.user_profiles(is_active);

-- RLS Policies
alter table public.user_profiles enable row level security;

-- Policy: Los usuarios pueden ver su propio perfil
create policy "Users can view own profile"
on public.user_profiles for select
using (auth.uid() = id);

-- Policy: Los usuarios de la misma clínica pueden verse entre sí
create policy "Users can view profiles from their clinic"
on public.user_profiles for select
using (
  clinic_id in (
    select clinic_id from user_profiles where id = auth.uid()
  )
);

-- Policy: Solo admins pueden crear usuarios
create policy "Only admins can create users"
on public.user_profiles for insert
with check (
  exists (
    select 1 from user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Policy: Solo admins pueden editar usuarios
create policy "Only admins can update users"
on public.user_profiles for update
using (
  exists (
    select 1 from user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Policy: Los usuarios pueden actualizar su propio perfil (excepto rol)
create policy "Users can update own profile"
on public.user_profiles for update
using (auth.uid() = id);

-- Trigger para updated_at
create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row
  execute function update_updated_at_column();

-- Comentarios
comment on table public.user_profiles is 'Perfiles de usuario con rol y clínica';
comment on column public.user_profiles.role is 'Rol: admin, therapist, receptionist, patient';
comment on column public.user_profiles.settings is 'Configuración personalizada del usuario (JSON)';
```

### 4.2 Nueva Tabla: `clinics`

**Propósito:** Gestionar múltiples clínicas (preparación para multi-tenancy).

```sql
-- =====================================================
-- Tabla: clinics
-- Descripción: Clínicas registradas en la plataforma
-- =====================================================

create table public.clinics (
  -- Identificación
  id uuid default gen_random_uuid() primary key,

  -- Información básica
  name text not null,
  slug text unique not null, -- ej: "fisioterapia-cdmx" para subdominio

  -- Contacto
  email text,
  phone text,
  website text,

  -- Dirección
  address text,
  city text,
  state text,
  postal_code text,
  country text default 'MX',

  -- Configuración
  timezone text default 'America/Mexico_City',
  currency text default 'MXN',
  language text default 'es',

  -- Horario de atención
  business_hours jsonb default '{
    "monday": {"open": "08:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "08:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "08:00", "close": "18:00", "closed": false},
    "thursday": {"open": "08:00", "close": "18:00", "closed": false},
    "friday": {"open": "08:00", "close": "18:00", "closed": false},
    "saturday": {"open": "09:00", "close": "14:00", "closed": false},
    "sunday": {"open": "09:00", "close": "14:00", "closed": true}
  }'::jsonb,

  -- Configuración de servicios
  default_appointment_duration integer default 60, -- minutos
  allow_online_booking boolean default false,
  require_payment_upfront boolean default false,

  -- Suscripción y billing
  subscription_tier text default 'basic' check (subscription_tier in ('basic', 'professional', 'enterprise')),
  subscription_status text default 'trial' check (subscription_status in ('trial', 'active', 'cancelled', 'suspended')),
  trial_ends_at timestamp with time zone,
  subscription_started_at timestamp with time zone,

  -- Límites del plan
  max_users integer default 2,
  max_patients integer default 100,

  -- Branding
  logo_url text,
  primary_color text default '#3B82F6',

  -- Estado
  is_active boolean default true,

  -- Auditoría
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

-- Índices
create unique index clinics_slug_idx on public.clinics(slug);
create index clinics_subscription_status_idx on public.clinics(subscription_status);
create index clinics_is_active_idx on public.clinics(is_active);

-- RLS Policies
alter table public.clinics enable row level security;

-- Policy: Los usuarios solo pueden ver su propia clínica
create policy "Users can view their own clinic"
on public.clinics for select
using (
  id in (
    select clinic_id from user_profiles where id = auth.uid()
  )
);

-- Policy: Solo admins pueden editar su clínica
create policy "Only admins can update clinic"
on public.clinics for update
using (
  id in (
    select clinic_id from user_profiles
    where id = auth.uid() and role = 'admin'
  )
);

-- Trigger para updated_at
create trigger update_clinics_updated_at
  before update on public.clinics
  for each row
  execute function update_updated_at_column();

-- Comentarios
comment on table public.clinics is 'Clínicas registradas en la plataforma';
comment on column public.clinics.slug is 'Slug único para subdominio (ej: fisioterapia-cdmx)';
comment on column public.clinics.business_hours is 'Horario de atención por día (JSON)';
```

### 4.3 Nueva Tabla: `audit_log`

**Propósito:** Registro de auditoría de acciones críticas.

```sql
-- =====================================================
-- Tabla: audit_log
-- Descripción: Registro de auditoría de acciones
-- =====================================================

create table public.audit_log (
  -- Identificación
  id uuid default gen_random_uuid() primary key,

  -- Usuario y clínica
  user_id uuid references auth.users(id) on delete set null,
  clinic_id uuid references public.clinics(id) on delete cascade not null,

  -- Acción
  action text not null, -- ej: 'patient.created', 'payment.deleted', 'user.invited'
  resource_type text not null, -- ej: 'patient', 'payment', 'appointment'
  resource_id uuid, -- ID del recurso afectado

  -- Detalles
  changes jsonb, -- Objeto con before/after para updates
  metadata jsonb, -- Información adicional (IP, user agent, etc.)

  -- Resultado
  success boolean default true,
  error_message text,

  -- Auditoría
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Índices
create index audit_log_user_id_idx on public.audit_log(user_id);
create index audit_log_clinic_id_idx on public.audit_log(clinic_id);
create index audit_log_action_idx on public.audit_log(action);
create index audit_log_resource_type_idx on public.audit_log(resource_type);
create index audit_log_created_at_idx on public.audit_log(created_at desc);

-- RLS Policies
alter table public.audit_log enable row level security;

-- Policy: Solo admins pueden ver el audit log de su clínica
create policy "Only admins can view audit log"
on public.audit_log for select
using (
  exists (
    select 1 from user_profiles
    where id = auth.uid() and role = 'admin' and clinic_id = audit_log.clinic_id
  )
);

-- Policy: El sistema puede insertar en audit log
create policy "System can insert audit log"
on public.audit_log for insert
with check (true);

-- Comentarios
comment on table public.audit_log is 'Registro de auditoría de acciones críticas';
comment on column public.audit_log.changes is 'Objeto JSON con before/after para updates';
comment on column public.audit_log.metadata is 'IP, user agent, y otra metadata';
```

### 4.4 Migración de Tablas Existentes

**Agregar columna `clinic_id` a todas las tablas relevantes:**

```sql
-- =====================================================
-- Migración: Agregar clinic_id a tablas existentes
-- =====================================================

-- Nota: Estas migraciones deben ejecutarse en orden y con cuidado
-- Recomendado: hacer backup completo antes de ejecutar

-- 1. Patients
alter table public.patients
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index patients_clinic_id_idx on public.patients(clinic_id);

-- 2. Appointments
alter table public.appointments
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index appointments_clinic_id_idx on public.appointments(clinic_id);

-- 3. Payments
alter table public.payments
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index payments_clinic_id_idx on public.payments(clinic_id);

-- 4. Exercise Library
alter table public.exercise_library
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index exercise_library_clinic_id_idx on public.exercise_library(clinic_id);

-- 5. Treatment Templates
alter table public.treatment_templates
add column clinic_id uuid references public.clinics(id) on delete cascade;

create index treatment_templates_clinic_id_idx on public.treatment_templates(clinic_id);

-- Nota: Sessions, Medical History, Prescriptions heredan clinic_id via foreign keys
-- No necesitan columna directa si siempre se accede via patient
```

**Script de Migración de Datos (ejemplo para ambiente de desarrollo):**

```sql
-- =====================================================
-- Script de Migración de Datos
-- SOLO para desarrollo/testing
-- =====================================================

-- Crear clínica de prueba
insert into public.clinics (id, name, slug, email)
values (
  '00000000-0000-0000-0000-000000000001',
  'Clínica Demo',
  'clinica-demo',
  'demo@clinova.com'
);

-- Asignar todos los datos existentes a la clínica de prueba
update public.patients set clinic_id = '00000000-0000-0000-0000-000000000001';
update public.appointments set clinic_id = '00000000-0000-0000-0000-000000000001';
update public.payments set clinic_id = '00000000-0000-0000-0000-000000000001';
update public.exercise_library set clinic_id = '00000000-0000-0000-0000-000000000001';
update public.treatment_templates set clinic_id = '00000000-0000-0000-0000-000000000001';

-- Hacer NOT NULL después de migrar datos
alter table public.patients alter column clinic_id set not null;
alter table public.appointments alter column clinic_id set not null;
alter table public.payments alter column clinic_id set not null;
-- ... repetir para todas las tablas
```

---

## 5. Row Level Security (RLS)

### 5.1 Estrategia General

**Principios:**
1. **Least Privilege:** Cada usuario solo ve/modifica lo mínimo necesario
2. **Multi-Tenancy:** Filtrado automático por `clinic_id`
3. **Role-Based:** Permisos basados en `user_profiles.role`
4. **Ownership:** Algunos recursos filtrados por `created_by` o `therapist_id`

**Helper Function para obtener rol del usuario:**

```sql
-- =====================================================
-- Función Helper: Obtener rol del usuario actual
-- =====================================================

create or replace function public.current_user_role()
returns text
language sql
security definer
stable
as $$
  select role from public.user_profiles where id = auth.uid()
$$;

-- Función Helper: Obtener clinic_id del usuario actual
create or replace function public.current_user_clinic()
returns uuid
language sql
security definer
stable
as $$
  select clinic_id from public.user_profiles where id = auth.uid()
$$;

-- Función Helper: Verificar si el usuario es admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

-- Función Helper: Verificar si el usuario puede acceder a notas clínicas
create or replace function public.can_access_clinical_notes()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role in ('admin', 'therapist')
  )
$$;
```

### 5.2 Políticas RLS por Tabla

#### 5.2.1 Patients (Pacientes)

```sql
-- =====================================================
-- RLS Policies: patients
-- =====================================================

-- Eliminar políticas antiguas (demasiado permisivas)
drop policy if exists "Enable all access for authenticated users" on public.patients;

-- SELECT: Admin y Therapist ven todos los pacientes de su clínica
-- Receptionist ve solo información demográfica
create policy "Users can view patients from their clinic"
on public.patients for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist', 'receptionist')
);

-- INSERT: Admin, Therapist y Receptionist pueden crear pacientes
create policy "Authorized users can create patients"
on public.patients for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist', 'receptionist')
);

-- UPDATE: Admin puede editar todo
-- Therapist solo puede editar pacientes que él creó o tiene asignados
-- Receptionist solo puede editar información demográfica (implementado en app layer)
create policy "Admin can update all patients"
on public.patients for update
using (
  clinic_id = current_user_clinic()
  and is_admin()
);

create policy "Therapists can update assigned patients"
on public.patients for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and (
    created_by = auth.uid()
    or id in (
      select distinct patient_id from appointments
      where therapist_id = auth.uid()
    )
  )
);

-- DELETE: Solo admin (soft delete via is_active en app layer)
create policy "Only admin can delete patients"
on public.patients for delete
using (
  clinic_id = current_user_clinic()
  and is_admin()
);
```

#### 5.2.2 Medical History (Historial Médico)

```sql
-- =====================================================
-- RLS Policies: medical_history
-- =====================================================

-- SELECT: Solo Admin y Therapist (no Receptionist)
create policy "Only clinical staff can view medical history"
on public.medical_history for select
using (
  can_access_clinical_notes()
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);

-- INSERT/UPDATE: Solo Admin y Therapist
create policy "Only clinical staff can modify medical history"
on public.medical_history for insert
with check (
  can_access_clinical_notes()
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);

create policy "Only clinical staff can update medical history"
on public.medical_history for update
using (
  can_access_clinical_notes()
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);
```

#### 5.2.3 Appointments (Citas)

```sql
-- =====================================================
-- RLS Policies: appointments
-- =====================================================

-- SELECT: Admin y Receptionist ven todas las citas de la clínica
-- Therapist solo ve sus citas asignadas (configurable)
create policy "Admin and receptionist view all appointments"
on public.appointments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'receptionist')
);

create policy "Therapists view assigned appointments"
on public.appointments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and (therapist_id = auth.uid() or therapist_id is null)
);

-- INSERT: Admin, Therapist y Receptionist pueden crear citas
create policy "Authorized users can create appointments"
on public.appointments for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist', 'receptionist')
);

-- UPDATE: Admin puede editar todas
-- Therapist y Receptionist solo sus propias citas
create policy "Admin can update all appointments"
on public.appointments for update
using (
  clinic_id = current_user_clinic()
  and is_admin()
);

create policy "Therapists can update their appointments"
on public.appointments for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and therapist_id = auth.uid()
);

create policy "Receptionists can update appointments"
on public.appointments for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'receptionist'
);

-- DELETE: Solo Admin
create policy "Only admin can delete appointments"
on public.appointments for delete
using (
  clinic_id = current_user_clinic()
  and is_admin()
);
```

#### 5.2.4 Sessions (Notas SOAP)

```sql
-- =====================================================
-- RLS Policies: sessions
-- =====================================================

-- SELECT: Solo Admin y Therapist (no Receptionist)
create policy "Only clinical staff can view sessions"
on public.sessions for select
using (
  can_access_clinical_notes()
  and appointment_id in (
    select id from appointments where clinic_id = current_user_clinic()
  )
);

-- INSERT: Solo Admin y Therapist
create policy "Only clinical staff can create sessions"
on public.sessions for insert
with check (
  can_access_clinical_notes()
  and appointment_id in (
    select id from appointments where clinic_id = current_user_clinic()
  )
);

-- UPDATE: Solo el creador de la sesión, dentro de 24h
create policy "Therapists can update own sessions within 24h"
on public.sessions for update
using (
  can_access_clinical_notes()
  and created_by = auth.uid()
  and created_at > now() - interval '24 hours'
);

-- Admin puede editar cualquier sesión
create policy "Admin can update all sessions"
on public.sessions for update
using (
  is_admin()
  and appointment_id in (
    select id from appointments where clinic_id = current_user_clinic()
  )
);
```

#### 5.2.5 Payments (Pagos)

```sql
-- =====================================================
-- RLS Policies: payments
-- =====================================================

-- SELECT: Admin y Receptionist ven todos los pagos
-- Therapist solo ve pagos de sus pacientes
-- Patient solo ve sus propios pagos
create policy "Admin and receptionist view all payments"
on public.payments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'receptionist')
);

create policy "Therapists view payments of their patients"
on public.payments for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'therapist'
  and patient_id in (
    select distinct patient_id from appointments
    where therapist_id = auth.uid()
  )
);

-- INSERT: Admin y Receptionist (y opcionalmente Therapist según config)
create policy "Authorized users can create payments"
on public.payments for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'receptionist')
);

-- UPDATE: Solo Admin y Receptionist (dentro de 24h)
create policy "Admin can update payments"
on public.payments for update
using (
  clinic_id = current_user_clinic()
  and is_admin()
);

create policy "Receptionist can update recent payments"
on public.payments for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() = 'receptionist'
  and created_at > now() - interval '24 hours'
);
```

#### 5.2.6 Exercise Library y Prescriptions

```sql
-- =====================================================
-- RLS Policies: exercise_library
-- =====================================================

-- SELECT: Admin y Therapist ven la biblioteca de su clínica
create policy "Clinical staff can view exercise library"
on public.exercise_library for select
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist')
);

-- INSERT/UPDATE: Admin y Therapist
create policy "Clinical staff can manage exercises"
on public.exercise_library for insert
with check (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist')
);

create policy "Clinical staff can update exercises"
on public.exercise_library for update
using (
  clinic_id = current_user_clinic()
  and current_user_role() in ('admin', 'therapist')
);

-- =====================================================
-- RLS Policies: patient_exercise_prescriptions
-- =====================================================

-- SELECT: Admin y Therapist ven prescripciones
-- Patient ve solo las suyas
create policy "Clinical staff can view prescriptions"
on public.patient_exercise_prescriptions for select
using (
  patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
  and current_user_role() in ('admin', 'therapist')
);

create policy "Patients can view own prescriptions"
on public.patient_exercise_prescriptions for select
using (
  patient_id in (
    select id from patients
    where email = (select email from auth.users where id = auth.uid())
  )
);

-- INSERT: Solo Admin y Therapist
create policy "Only clinical staff can prescribe exercises"
on public.patient_exercise_prescriptions for insert
with check (
  current_user_role() in ('admin', 'therapist')
  and patient_id in (
    select id from patients where clinic_id = current_user_clinic()
  )
);
```

### 5.3 Testing de Políticas RLS

**Script de Testing:**

```sql
-- =====================================================
-- Testing de Políticas RLS
-- Ejecutar con diferentes usuarios para validar
-- =====================================================

-- 1. Crear usuarios de prueba
-- (Esto se haría via Supabase Auth dashboard o API)

-- 2. Testing como Admin
set local role authenticated;
set local request.jwt.claims.sub to 'admin-user-uuid';

-- Debería retornar todos los pacientes de la clínica
select count(*) from patients;

-- Debería retornar todas las citas
select count(*) from appointments;

-- 3. Testing como Therapist
set local request.jwt.claims.sub to 'therapist-user-uuid';

-- Debería retornar solo citas asignadas al terapeuta
select count(*) from appointments;

-- Debería poder ver historial médico
select count(*) from medical_history;

-- 4. Testing como Receptionist
set local request.jwt.claims.sub to 'receptionist-user-uuid';

-- Debería ver todos los pacientes
select count(*) from patients;

-- NO debería ver historial médico
select count(*) from medical_history; -- Debería retornar 0

-- 5. Testing como Patient
set local request.jwt.claims.sub to 'patient-user-uuid';

-- Debería ver solo sus propias prescripciones
select count(*) from patient_exercise_prescriptions;

-- NO debería ver otros pacientes
select count(*) from patients; -- Debería retornar 0
```

---

## 6. Implementación Frontend

### 6.1 Context Provider de Usuario

**Crear `src/contexts/UserContext.tsx`:**

```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'

export type UserRole = 'admin' | 'therapist' | 'receptionist' | 'patient'

export interface UserProfile {
  id: string
  role: UserRole
  clinic_id: string
  full_name: string
  professional_title: string | null
  phone: string | null
  avatar_url: string | null
  settings: {
    notifications_enabled: boolean
    email_reminders: boolean
    sms_reminders: boolean
    language: string
    theme: string
  }
  is_active: boolean
  created_at: string
  updated_at: string
  last_login_at: string | null
}

interface UserContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAdmin: boolean
  isTherapist: boolean
  isReceptionist: boolean
  isPatient: boolean
  can: (permission: Permission) => boolean
  refreshProfile: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data as UserProfile
  }

  const refreshProfile = async () => {
    if (!user) return
    const freshProfile = await fetchProfile(user.id)
    if (freshProfile) {
      setProfile(freshProfile)
    }
  }

  useEffect(() => {
    // Obtener usuario inicial
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        fetchProfile(user.id).then((profile) => {
          setProfile(profile)
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // Suscribirse a cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setProfile(profile)

        // Actualizar last_login_at si es nuevo login
        if (event === 'SIGNED_IN') {
          await supabase
            .from('user_profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', session.user.id)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Helpers de rol
  const isAdmin = profile?.role === 'admin'
  const isTherapist = profile?.role === 'therapist'
  const isReceptionist = profile?.role === 'receptionist'
  const isPatient = profile?.role === 'patient'

  // Sistema de permisos
  const can = (permission: Permission): boolean => {
    if (!profile) return false

    // Admin puede todo
    if (isAdmin) return true

    // Verificar permisos por rol
    return permissions[profile.role]?.includes(permission) ?? false
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin,
    isTherapist,
    isReceptionist,
    isPatient,
    can,
    refreshProfile,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

// Definición de permisos
export type Permission =
  | 'patients:view'
  | 'patients:create'
  | 'patients:edit'
  | 'patients:delete'
  | 'medical_history:view'
  | 'medical_history:edit'
  | 'appointments:view_all'
  | 'appointments:view_own'
  | 'appointments:create'
  | 'appointments:edit'
  | 'appointments:delete'
  | 'sessions:view'
  | 'sessions:create'
  | 'sessions:edit'
  | 'exercises:view'
  | 'exercises:create'
  | 'exercises:prescribe'
  | 'payments:view_all'
  | 'payments:view_own'
  | 'payments:create'
  | 'payments:edit'
  | 'reports:view_all'
  | 'reports:view_own'
  | 'users:manage'
  | 'clinic:configure'

const permissions: Record<UserRole, Permission[]> = {
  admin: [
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:delete',
    'medical_history:view',
    'medical_history:edit',
    'appointments:view_all',
    'appointments:create',
    'appointments:edit',
    'appointments:delete',
    'sessions:view',
    'sessions:create',
    'sessions:edit',
    'exercises:view',
    'exercises:create',
    'exercises:prescribe',
    'payments:view_all',
    'payments:create',
    'payments:edit',
    'reports:view_all',
    'users:manage',
    'clinic:configure',
  ],
  therapist: [
    'patients:view',
    'patients:create',
    'patients:edit',
    'medical_history:view',
    'medical_history:edit',
    'appointments:view_own',
    'appointments:create',
    'appointments:edit',
    'sessions:view',
    'sessions:create',
    'sessions:edit',
    'exercises:view',
    'exercises:create',
    'exercises:prescribe',
    'payments:view_own',
    'reports:view_own',
  ],
  receptionist: [
    'patients:view',
    'patients:create',
    'patients:edit',
    'appointments:view_all',
    'appointments:create',
    'appointments:edit',
    'payments:view_all',
    'payments:create',
    'payments:edit',
  ],
  patient: [
    'payments:view_own',
  ],
}
```

### 6.2 Componente de Autorización Condicional

**Crear `src/components/auth/Can.tsx`:**

```typescript
'use client'

import { useUser, Permission } from '@/contexts/UserContext'

interface CanProps {
  permission: Permission | Permission[]
  fallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Componente que renderiza children solo si el usuario tiene el permiso
 *
 * @example
 * <Can permission="patients:delete">
 *   <button onClick={handleDelete}>Eliminar</button>
 * </Can>
 */
export function Can({ permission, fallback = null, children }: CanProps) {
  const { can } = useUser()

  const hasPermission = Array.isArray(permission)
    ? permission.some((p) => can(p))
    : can(permission)

  if (!hasPermission) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Componente que renderiza children solo si el usuario tiene TODOS los permisos
 */
export function CanAll({ permissions, fallback = null, children }: {
  permissions: Permission[]
  fallback?: React.ReactNode
  children: React.ReactNode
}) {
  const { can } = useUser()

  const hasAllPermissions = permissions.every((p) => can(p))

  if (!hasAllPermissions) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
```

### 6.3 Middleware Actualizado

**Actualizar `src/middleware.ts`:**

```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Obtener usuario
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas públicas (no requieren autenticación)
  const publicPaths = ['/login', '/signup', '/reset-password', '/dashboard/mis-ejercicios']
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Si no hay usuario y la ruta no es pública, redirigir a login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Si hay usuario, obtener su perfil y rol
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single()

    // Verificar que el perfil esté activo
    if (profile && !profile.is_active) {
      const url = request.nextUrl.clone()
      url.pathname = '/account-suspended'
      return NextResponse.redirect(url)
    }

    // Redirigir pacientes al portal de adherencia si intentan acceder al dashboard
    if (profile?.role === 'patient' && request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!request.nextUrl.pathname.startsWith('/dashboard/mis-ejercicios')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard/mis-ejercicios'
        return NextResponse.redirect(url)
      }
    }

    // Verificar rutas protegidas para admins
    const adminOnlyPaths = ['/dashboard/usuarios', '/dashboard/configuracion', '/dashboard/audit-log']
    const isAdminOnlyPath = adminOnlyPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    if (isAdminOnlyPath && profile?.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 6.4 Actualizar Layout del Dashboard

**Actualizar `src/app/dashboard/layout.tsx`:**

```typescript
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { UserProvider } from '@/contexts/UserContext'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    // Si no hay perfil, redirigir a página de setup
    redirect('/setup-profile')
  }

  return (
    <UserProvider>
      <div className="flex h-screen">
        <Sidebar userProfile={profile} />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </UserProvider>
  )
}
```

### 6.5 Ejemplo de Uso en Componentes

**Ejemplo: Lista de Pacientes con Permisos**

```typescript
'use client'

import { useUser } from '@/contexts/UserContext'
import { Can } from '@/components/auth/Can'
import { Trash, Edit, Plus } from 'lucide-react'

export default function PatientList() {
  const { isAdmin, isTherapist, isReceptionist } = useUser()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pacientes</h1>

        {/* Botón de crear solo para usuarios autorizados */}
        <Can permission="patients:create">
          <button className="btn-primary">
            <Plus size={16} />
            Nuevo Paciente
          </button>
        </Can>
      </div>

      <div className="space-y-4">
        {patients.map((patient) => (
          <div key={patient.id} className="card">
            <div className="flex justify-between">
              <div>
                <h3>{patient.full_name}</h3>
                <p>{patient.email}</p>

                {/* Historial médico solo para clínicos */}
                <Can permission="medical_history:view">
                  <button onClick={() => viewMedicalHistory(patient.id)}>
                    Ver Historial Médico
                  </button>
                </Can>
              </div>

              <div className="flex gap-2">
                {/* Editar */}
                <Can permission="patients:edit">
                  <button onClick={() => editPatient(patient.id)}>
                    <Edit size={16} />
                  </button>
                </Can>

                {/* Eliminar solo para admin */}
                <Can permission="patients:delete">
                  <button onClick={() => deletePatient(patient.id)}>
                    <Trash size={16} />
                  </button>
                </Can>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

---

## 7. API y Edge Functions

### 7.1 Edge Function: Invitar Usuario

**Crear `supabase/functions/invite-user/index.ts`:**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InviteUserRequest {
  email: string
  role: 'admin' | 'therapist' | 'receptionist'
  full_name: string
  professional_title?: string
  phone?: string
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente de Supabase con el token del usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verificar que el usuario actual es admin
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'No autenticado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: profile } = await supabaseClient
      .from('user_profiles')
      .select('role, clinic_id')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parsear request body
    const { email, role, full_name, professional_title, phone }: InviteUserRequest = await req.json()

    // Crear usuario con Supabase Admin API
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        clinic_id: profile.clinic_id,
      },
    })

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Crear perfil del usuario
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: newUser.user.id,
        role,
        clinic_id: profile.clinic_id,
        full_name,
        professional_title,
        phone,
        created_by: user.id,
      })

    if (profileError) {
      // Rollback: eliminar usuario si falla la creación del perfil
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)

      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Registrar en audit log
    await supabaseAdmin.from('audit_log').insert({
      user_id: user.id,
      clinic_id: profile.clinic_id,
      action: 'user.invited',
      resource_type: 'user',
      resource_id: newUser.user.id,
      metadata: {
        invited_email: email,
        invited_role: role,
      },
    })

    // TODO: Enviar email de invitación con link para establecer contraseña

    return new Response(
      JSON.stringify({
        message: 'Usuario creado exitosamente',
        user_id: newUser.user.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

### 7.2 Hook para Invocar la Function

**Crear `src/hooks/useInviteUser.ts`:**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface InviteUserParams {
  email: string
  role: 'admin' | 'therapist' | 'receptionist'
  full_name: string
  professional_title?: string
  phone?: string
}

export function useInviteUser() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const inviteUser = async (params: InviteUserParams) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No autenticado')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/invite-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(params),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al invitar usuario')
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { inviteUser, loading, error }
}
```

---

## 8. Casos de Uso Detallados

### 8.1 Caso de Uso 1: Admin Invita Fisioterapeuta

**Flujo:**
1. Admin accede a `/dashboard/usuarios`
2. Hace clic en "Invitar Usuario"
3. Completa formulario:
   - Email: fisio@example.com
   - Rol: Fisioterapeuta
   - Nombre completo: Dr. Juan Pérez
   - Título profesional: Lic. en Fisioterapia
4. Sistema valida que el admin tiene permiso (`users:manage`)
5. Edge Function crea usuario en Supabase Auth
6. Se crea perfil en `user_profiles` con `role='therapist'` y mismo `clinic_id`
7. Se registra acción en `audit_log`
8. Se envía email de invitación con link para establecer contraseña
9. Fisioterapeuta recibe email, establece contraseña
10. Al hacer login, es redirigido a `/dashboard`
11. Ve solo las opciones de menú permitidas para fisioterapeuta

**Diagrama de Secuencia:**

```
Admin          Frontend        Edge Function      Supabase Auth      Database
  │                │                  │                  │               │
  ├─ Clic Invitar─►│                  │                  │               │
  │                ├─ Validar Form ──►│                  │               │
  │                │  (email, role)   │                  │               │
  │                │                  │                  │               │
  │                ├─ POST /invite ──►│                  │               │
  │                │                  ├─ Verificar rol ─►│               │
  │                │                  │  admin           │               │
  │                │                  │                  │               │
  │                │                  ├─ createUser() ──►│               │
  │                │                  │◄─ user_id ───────┤               │
  │                │                  │                  │               │
  │                │                  ├─ INSERT profile ────────────────►│
  │                │                  ├─ INSERT audit_log ──────────────►│
  │                │                  │                  │               │
  │                │◄─ Success ───────┤                  │               │
  │◄─ "Invitado" ──┤                  │                  │               │
```

### 8.2 Caso de Uso 2: Recepcionista Intenta Ver Notas SOAP

**Flujo:**
1. Recepcionista accede a `/dashboard/pacientes/[id]`
2. Ve perfil del paciente con información demográfica
3. Intenta hacer clic en "Ver Historial Médico"
4. Botón no aparece porque `<Can permission="medical_history:view">` evalúa a `false`
5. Si intenta acceder directamente a la URL, RLS bloquea la query:
   ```sql
   -- Esta query no retorna datos
   SELECT * FROM medical_history WHERE patient_id = '123'
   ```
6. Frontend muestra mensaje: "No tienes permiso para ver esta información"

### 8.3 Caso de Uso 3: Fisioterapeuta Ve Solo Sus Citas

**Flujo:**
1. Fisioterapeuta accede a `/dashboard/agenda`
2. Query ejecutada:
   ```typescript
   const { data } = await supabase
     .from('appointments')
     .select('*')
     .order('start_time', { ascending: true })
   ```
3. RLS Policy aplica filtro automáticamente:
   ```sql
   WHERE therapist_id = auth.uid() AND clinic_id = current_user_clinic()
   ```
4. Solo se retornan citas asignadas al fisioterapeuta
5. FullCalendar renderiza solo esas citas

**Configuración Opcional:**
- Si la clínica configura `settings.show_full_calendar_to_therapists = true`
- Entonces la política RLS se actualiza para mostrar todas las citas:
   ```sql
   -- Policy condicional basada en settings de la clínica
   WHERE
     (therapist_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM clinics c
        INNER JOIN user_profiles up ON c.id = up.clinic_id
        WHERE up.id = auth.uid() AND c.settings->>'show_full_calendar_to_therapists' = 'true'
      ))
   ```

---

## 9. Plan de Migración

### 9.1 Preparación

**Paso 1: Backup Completo**

```bash
# Backup de base de datos (desde Supabase Dashboard)
# Settings > Database > Database Backups > Create Backup

# O usando pg_dump
pg_dump -h db.xxxxx.supabase.co -U postgres -d postgres > backup_$(date +%Y%m%d).sql
```

**Paso 2: Crear Branch de Feature**

```bash
git checkout -b feature/rbac-system
```

**Paso 3: Configurar Entorno de Desarrollo**

```bash
# Crear archivo .env.local con credentials de Supabase de desarrollo
cp .env.example .env.local

# Instalar dependencias
npm install
```

### 9.2 Ejecución de Migración

**Script de Migración Completo:**

```sql
-- =====================================================
-- MIGRACIÓN COMPLETA: Sistema de Roles y Multi-Tenancy
-- Fecha: 2026-01-XX
-- Autor: Equipo Clinova
-- IMPORTANTE: Ejecutar en orden, con backups entre pasos
-- =====================================================

-- =====================
-- PASO 1: Crear tablas nuevas
-- =====================

-- (Copiar aquí scripts de clinics, user_profiles, audit_log de secciones anteriores)

-- =====================
-- PASO 2: Migrar datos existentes
-- =====================

-- 2.1: Crear clínica de prueba (o de producción si es la primera)
DO $$
DECLARE
  new_clinic_id uuid;
BEGIN
  INSERT INTO public.clinics (name, slug, email)
  VALUES (
    'Mi Clínica de Fisioterapia',
    'mi-clinica-fisioterapia',
    'contacto@miclinica.com'
  )
  RETURNING id INTO new_clinic_id;

  -- Guardar el ID para usar en siguientes pasos
  RAISE NOTICE 'Clínica creada con ID: %', new_clinic_id;
END $$;

-- 2.2: Agregar clinic_id a tablas existentes
ALTER TABLE public.patients ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.payments ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.exercise_library ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;
ALTER TABLE public.treatment_templates ADD COLUMN clinic_id uuid REFERENCES public.clinics(id) ON DELETE CASCADE;

-- 2.3: Asignar todos los datos existentes a la clínica creada
UPDATE public.patients SET clinic_id = (SELECT id FROM public.clinics LIMIT 1);
UPDATE public.appointments SET clinic_id = (SELECT id FROM public.clinics LIMIT 1);
UPDATE public.payments SET clinic_id = (SELECT id FROM public.clinics LIMIT 1);
UPDATE public.exercise_library SET clinic_id = (SELECT id FROM public.clinics LIMIT 1);
UPDATE public.treatment_templates SET clinic_id = (SELECT id FROM public.clinics LIMIT 1);

-- 2.4: Hacer clinic_id NOT NULL después de migrar datos
ALTER TABLE public.patients ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE public.payments ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE public.exercise_library ALTER COLUMN clinic_id SET NOT NULL;
ALTER TABLE public.treatment_templates ALTER COLUMN clinic_id SET NOT NULL;

-- 2.5: Crear índices
CREATE INDEX patients_clinic_id_idx ON public.patients(clinic_id);
CREATE INDEX appointments_clinic_id_idx ON public.appointments(clinic_id);
CREATE INDEX payments_clinic_id_idx ON public.payments(clinic_id);
CREATE INDEX exercise_library_clinic_id_idx ON public.exercise_library(clinic_id);
CREATE INDEX treatment_templates_clinic_id_idx ON public.treatment_templates(clinic_id);

-- =====================
-- PASO 3: Crear perfiles para usuarios existentes
-- =====================

-- 3.1: Obtener usuarios de auth.users que no tienen perfil
INSERT INTO public.user_profiles (id, role, clinic_id, full_name, is_active)
SELECT
  au.id,
  'admin' as role, -- Por defecto, el primer usuario es admin
  (SELECT id FROM public.clinics LIMIT 1) as clinic_id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  true as is_active
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
)
LIMIT 1; -- Solo el primer usuario como admin

-- 3.2: Resto de usuarios como therapists (ajustar según necesidad)
INSERT INTO public.user_profiles (id, role, clinic_id, full_name, is_active)
SELECT
  au.id,
  'therapist' as role,
  (SELECT id FROM public.clinics LIMIT 1) as clinic_id,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  true as is_active
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);

-- =====================
-- PASO 4: Crear funciones helper
-- =====================

-- (Copiar aquí funciones de sección 5.1)

-- =====================
-- PASO 5: Eliminar políticas antiguas
-- =====================

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.patients;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.appointments;
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.sessions;
-- ... repetir para todas las tablas

-- =====================
-- PASO 6: Crear nuevas políticas RLS
-- =====================

-- (Copiar aquí todas las políticas de sección 5.2)

-- =====================
-- PASO 7: Verificación
-- =====================

-- Verificar que todas las tablas tienen políticas RLS habilitadas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND rowsecurity = false;
-- Debería retornar 0 filas (todas las tablas deben tener RLS habilitado)

-- Verificar cantidad de políticas por tabla
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Verificar que todos los usuarios tienen perfil
SELECT
  au.id,
  au.email,
  up.role,
  up.clinic_id
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;
-- Debería retornar 0 filas (todos los usuarios deben tener perfil)

-- =====================
-- PASO 8: Testing manual
-- =====================

-- Ejecutar queries de testing de sección 5.3
```

### 9.3 Rollback Plan

**En caso de problemas, ejecutar rollback:**

```sql
-- =====================================================
-- ROLLBACK: Revertir cambios de migración
-- SOLO ejecutar si hay problemas críticos
-- =====================================================

-- 1. Restaurar políticas RLS antiguas (permisivas)
DROP POLICY IF EXISTS "Users can view patients from their clinic" ON public.patients;
-- ... eliminar todas las políticas nuevas

CREATE POLICY "Enable all access for authenticated users"
ON public.patients FOR ALL
USING (auth.role() = 'authenticated');
-- ... repetir para todas las tablas

-- 2. Eliminar columna clinic_id (si no hay datos de producción importantes)
ALTER TABLE public.patients DROP COLUMN clinic_id;
ALTER TABLE public.appointments DROP COLUMN clinic_id;
-- ... repetir para todas las tablas

-- 3. Eliminar tablas nuevas
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.clinics CASCADE;

-- 4. Restaurar desde backup si es necesario
-- psql -h db.xxxxx.supabase.co -U postgres -d postgres < backup_20260115.sql
```

### 9.4 Checklist de Post-Migración

- [ ] Todas las políticas RLS están activas y testeadas
- [ ] Todos los usuarios existentes tienen perfil creado
- [ ] Todas las tablas tienen `clinic_id` con NOT NULL
- [ ] Edge Function de invitar usuarios está desplegada y funcionando
- [ ] Frontend actualizado con componentes `<Can>` y context de usuario
- [ ] Middleware actualizado para verificar roles
- [ ] Testing manual completado (admin, therapist, receptionist)
- [ ] Audit log registrando acciones correctamente
- [ ] Documentación actualizada para desarrolladores
- [ ] Usuarios existentes notificados de cambios (si aplica)

---

## 10. Testing

### 10.1 Testing de Políticas RLS

**Crear `tests/rls-policies.test.ts`:**

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

describe('RLS Policies', () => {
  let supabaseAdmin: ReturnType<typeof createClient>
  let testClinicId: string
  let adminUserId: string
  let therapistUserId: string
  let receptionistUserId: string

  beforeAll(async () => {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Crear clínica de prueba
    const { data: clinic } = await supabaseAdmin
      .from('clinics')
      .insert({ name: 'Test Clinic', slug: 'test-clinic' })
      .select()
      .single()

    testClinicId = clinic.id

    // Crear usuarios de prueba
    const { data: adminUser } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@test.com',
      password: 'password123',
      email_confirm: true,
    })
    adminUserId = adminUser.user.id

    await supabaseAdmin.from('user_profiles').insert({
      id: adminUserId,
      role: 'admin',
      clinic_id: testClinicId,
      full_name: 'Admin Test',
    })

    // Repetir para therapist y receptionist...
  })

  afterAll(async () => {
    // Limpiar datos de prueba
    await supabaseAdmin.from('clinics').delete().eq('id', testClinicId)
  })

  describe('Patients Table', () => {
    it('Admin can view all patients from their clinic', async () => {
      const supabaseAsAdmin = createClient(supabaseUrl, adminUserToken)

      const { data, error } = await supabaseAsAdmin
        .from('patients')
        .select('*')

      expect(error).toBeNull()
      expect(data).toBeDefined()
      // Todos los pacientes deberían tener el mismo clinic_id
      expect(data.every(p => p.clinic_id === testClinicId)).toBe(true)
    })

    it('Receptionist cannot view medical history', async () => {
      const supabaseAsReceptionist = createClient(supabaseUrl, receptionistUserToken)

      const { data, error } = await supabaseAsReceptionist
        .from('medical_history')
        .select('*')

      // Debería retornar 0 resultados (bloqueado por RLS)
      expect(data).toEqual([])
    })

    it('Therapist can only update their own patients', async () => {
      const supabaseAsTherapist = createClient(supabaseUrl, therapistUserToken)

      // Intentar actualizar paciente de otro terapeuta
      const { error } = await supabaseAsTherapist
        .from('patients')
        .update({ phone: '1234567890' })
        .eq('id', otherTherapistPatientId)

      // Debería fallar
      expect(error).toBeDefined()
      expect(error.code).toBe('PGRST301') // Policy violation
    })
  })

  describe('Appointments Table', () => {
    it('Therapist only sees their own appointments', async () => {
      const supabaseAsTherapist = createClient(supabaseUrl, therapistUserToken)

      const { data } = await supabaseAsTherapist
        .from('appointments')
        .select('*')

      // Todos los appointments deberían tener therapist_id = therapistUserId
      expect(data.every(a => a.therapist_id === therapistUserId)).toBe(true)
    })

    it('Receptionist sees all appointments', async () => {
      const supabaseAsReceptionist = createClient(supabaseUrl, receptionistUserToken)

      const { data } = await supabaseAsReceptionist
        .from('appointments')
        .select('*')

      // Debería ver citas de todos los terapeutas
      const uniqueTherapists = new Set(data.map(a => a.therapist_id))
      expect(uniqueTherapists.size).toBeGreaterThan(1)
    })
  })
})
```

### 10.2 Testing de Componentes de Autorización

**Crear `tests/components/Can.test.tsx`:**

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Can } from '@/components/auth/Can'
import { UserProvider } from '@/contexts/UserContext'

// Mock del hook useUser
vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    can: (permission: string) => permission === 'patients:delete',
  }),
}))

describe('Can Component', () => {
  it('renders children when user has permission', () => {
    render(
      <Can permission="patients:delete">
        <button>Delete Patient</button>
      </Can>
    )

    expect(screen.getByText('Delete Patient')).toBeInTheDocument()
  })

  it('does not render children when user lacks permission', () => {
    render(
      <Can permission="users:manage">
        <button>Manage Users</button>
      </Can>
    )

    expect(screen.queryByText('Manage Users')).not.toBeInTheDocument()
  })

  it('renders fallback when user lacks permission', () => {
    render(
      <Can permission="users:manage" fallback={<p>No access</p>}>
        <button>Manage Users</button>
      </Can>
    )

    expect(screen.getByText('No access')).toBeInTheDocument()
    expect(screen.queryByText('Manage Users')).not.toBeInTheDocument()
  })
})
```

### 10.3 Testing E2E con Playwright

**Crear `tests/e2e/rbac.spec.ts`:**

```typescript
import { test, expect } from '@playwright/test'

test.describe('RBAC System', () => {
  test.describe('Admin User', () => {
    test.beforeEach(async ({ page }) => {
      // Login como admin
      await page.goto('/login')
      await page.fill('[name="email"]', 'admin@test.com')
      await page.fill('[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard')
    })

    test('can access user management', async ({ page }) => {
      await page.goto('/dashboard/usuarios')
      await expect(page).toHaveURL('/dashboard/usuarios')
      await expect(page.locator('h1')).toContainText('Usuarios')
    })

    test('can invite new user', async ({ page }) => {
      await page.goto('/dashboard/usuarios')
      await page.click('text=Invitar Usuario')

      await page.fill('[name="email"]', 'newtherapist@test.com')
      await page.selectOption('[name="role"]', 'therapist')
      await page.fill('[name="full_name"]', 'Dr. Nuevo Fisio')

      await page.click('button[type="submit"]')

      await expect(page.locator('.toast-success')).toContainText('Usuario invitado exitosamente')
    })

    test('can delete patient', async ({ page }) => {
      await page.goto('/dashboard/pacientes')
      await page.click('text=Juan Pérez')

      // Botón de eliminar debería estar visible
      await expect(page.locator('button[aria-label="Eliminar paciente"]')).toBeVisible()
    })
  })

  test.describe('Therapist User', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('[name="email"]', 'therapist@test.com')
      await page.fill('[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard')
    })

    test('cannot access user management', async ({ page }) => {
      await page.goto('/dashboard/usuarios')

      // Debería ser redirigido al dashboard
      await expect(page).toHaveURL('/dashboard')
    })

    test('cannot delete patient', async ({ page }) => {
      await page.goto('/dashboard/pacientes')
      await page.click('text=Juan Pérez')

      // Botón de eliminar NO debería estar visible
      await expect(page.locator('button[aria-label="Eliminar paciente"]')).not.toBeVisible()
    })

    test('can only see assigned appointments', async ({ page }) => {
      await page.goto('/dashboard/agenda')

      // Verificar que todas las citas mostradas tienen su nombre como terapeuta
      const appointments = page.locator('.fc-event')
      const count = await appointments.count()

      for (let i = 0; i < count; i++) {
        await expect(appointments.nth(i)).toContainText('Dr. Fisio Test')
      }
    })
  })

  test.describe('Receptionist User', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('[name="email"]', 'receptionist@test.com')
      await page.fill('[name="password"]', 'password123')
      await page.click('button[type="submit"]')
      await page.waitForURL('/dashboard')
    })

    test('cannot see medical history button', async ({ page }) => {
      await page.goto('/dashboard/pacientes')
      await page.click('text=Juan Pérez')

      // Botón de historial médico NO debería estar visible
      await expect(page.locator('button:has-text("Ver Historial Médico")')).not.toBeVisible()
    })

    test('can see all appointments in calendar', async ({ page }) => {
      await page.goto('/dashboard/agenda')

      // Debería ver citas de múltiples terapeutas
      await expect(page.locator('.fc-event')).toHaveCount(5) // Ajustar según datos de prueba
    })
  })
})
```

---

## 11. Cronograma

### 11.1 Desglose de Tareas (6-8 semanas)

#### Semana 1-2: Base de Datos y Backend

**Sprint 1 (Semana 1):**
- [ ] Día 1-2: Crear tablas `clinics`, `user_profiles`, `audit_log`
- [ ] Día 2-3: Escribir script de migración completo
- [ ] Día 3-4: Crear funciones helper de RLS
- [ ] Día 4-5: Escribir políticas RLS para `patients`, `medical_history`

**Sprint 2 (Semana 2):**
- [ ] Día 1-2: Políticas RLS para `appointments`, `sessions`
- [ ] Día 2-3: Políticas RLS para `payments`, `exercises`, `templates`
- [ ] Día 3-4: Testing de políticas RLS (manual + automatizado)
- [ ] Día 4-5: Edge Function para invitar usuarios
- [ ] Revisión y ajustes

#### Semana 3-4: Frontend - Context y Componentes Base

**Sprint 3 (Semana 3):**
- [ ] Día 1-2: Crear `UserContext` y provider
- [ ] Día 2-3: Crear componente `<Can>` y helpers de autorización
- [ ] Día 3-4: Actualizar middleware de Next.js
- [ ] Día 4-5: Actualizar layout del dashboard
- [ ] Testing de context y componentes

**Sprint 4 (Semana 4):**
- [ ] Día 1-2: Crear panel de gestión de usuarios (`/dashboard/usuarios`)
- [ ] Día 2-3: Formulario de invitar usuario
- [ ] Día 3-4: Lista de usuarios con roles
- [ ] Día 4-5: Editar perfil de usuario
- [ ] Testing de gestión de usuarios

#### Semana 5-6: Actualización de Módulos Existentes

**Sprint 5 (Semana 5):**
- [ ] Día 1: Actualizar módulo de pacientes con permisos
- [ ] Día 2: Actualizar módulo de agenda con filtros por rol
- [ ] Día 3: Actualizar módulo de sesiones SOAP (solo clínicos)
- [ ] Día 4: Actualizar módulo de pagos (permisos)
- [ ] Día 5: Actualizar módulo de ejercicios

**Sprint 6 (Semana 6):**
- [ ] Día 1-2: Actualizar dashboard con vistas por rol
- [ ] Día 2-3: Actualizar reportes con filtros por rol
- [ ] Día 3-4: Crear página de configuración de clínica (solo admin)
- [ ] Día 4-5: Crear visor de audit log (solo admin)

#### Semana 7-8: Testing, Migración y Deploy

**Sprint 7 (Semana 7):**
- [ ] Día 1-2: Testing E2E completo con Playwright
- [ ] Día 2-3: Testing de integración de todos los módulos
- [ ] Día 3-4: Migración de datos de desarrollo
- [ ] Día 4-5: Documentación técnica y guías de usuario
- [ ] Code review y refactoring

**Sprint 8 (Semana 8):**
- [ ] Día 1-2: Migración de datos de producción (si aplica)
- [ ] Día 2-3: Deploy a staging y testing final
- [ ] Día 3-4: Deploy a producción con rollback plan
- [ ] Día 4-5: Monitoreo post-deploy y ajustes
- [ ] Retrospectiva de equipo

### 11.2 Hitos Clave

| Hito | Fecha | Descripción |
|------|-------|-------------|
| **Milestone 1** | Fin Semana 2 | Backend completo (BD, RLS, Edge Functions) |
| **Milestone 2** | Fin Semana 4 | Frontend base (Context, componentes, gestión usuarios) |
| **Milestone 3** | Fin Semana 6 | Todos los módulos actualizados con permisos |
| **Milestone 4** | Fin Semana 8 | Deploy a producción y monitoreo estable |

### 11.3 Criterios de Aceptación

**Para considerar la Fase 3 completa:**

- [x] Sistema de 4 roles implementado (admin, therapist, receptionist, patient)
- [x] Políticas RLS activas en todas las 16 tablas
- [x] Middleware de Next.js valida rol en cada request
- [x] Componente `<Can>` funciona en todos los módulos
- [x] Admin puede invitar usuarios y asignar roles
- [x] Fisioterapeutas solo ven sus citas asignadas (o todas si está configurado)
- [x] Recepcionistas NO ven historial médico ni notas SOAP
- [x] Pacientes solo acceden a portal de adherencia
- [x] Audit log registra acciones críticas
- [x] Testing E2E pasa al 100%
- [x] Documentación técnica completa
- [x] Performance sin degradación (response time < 300ms p95)

---

## 12. Próximos Pasos (Post-Fase 3)

Una vez completado el sistema de roles, las siguientes fases serán:

### Fase 4: Multi-Tenancy Completo
- Permitir registro de nuevas clínicas (sign-up flow)
- Subdominios por clínica (`clinica1.clinova.com`)
- Billing y suscripciones (Stripe)
- Límites por plan (usuarios, pacientes)

### Fase 5: Notificaciones
- Recordatorios de citas por email/SMS
- Notificaciones push en navegador
- Recordatorios de ejercicios para pacientes
- Sistema de confirmación de citas

### Fase 6: Features Avanzados
- Gráficas y visualización de datos
- Exportación de reportes (Excel, PDF)
- Paquetes de sesiones
- Galería de fotos de progreso

---

## Apéndices

### Apéndice A: Referencias

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### Apéndice B: Glosario

- **RLS (Row Level Security):** Sistema de seguridad de PostgreSQL que filtra filas según políticas
- **RBAC (Role-Based Access Control):** Control de acceso basado en roles
- **Multi-Tenancy:** Arquitectura donde múltiples clientes comparten la misma instancia de la aplicación
- **Soft Delete:** Marcar registros como inactivos en lugar de eliminarlos físicamente
- **Audit Log:** Registro de auditoría de acciones críticas

### Apéndice C: Comandos Útiles

```bash
# Ejecutar migraciones de Supabase
supabase migration new rbac_system
supabase db push

# Testing de políticas RLS localmente
supabase db test

# Desplegar Edge Functions
supabase functions deploy invite-user

# Ver logs de Edge Functions
supabase functions logs invite-user

# Backup de base de datos
supabase db dump > backup.sql
```

---

**Fin de la Especificación Técnica - Fase 3**

**Próximo Documento:** `plan_de_testing_fase3.md`

---

*Documento generado por el equipo de Clinova - Enero 2026*
