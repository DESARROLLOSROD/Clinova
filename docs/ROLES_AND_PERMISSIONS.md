# Sistema de Roles y Permisos - Clinova

## Resumen

El sistema de roles y permisos de Clinova proporciona control de acceso granular basado en roles (RBAC - Role-Based Access Control) con 4 roles principales: **Admin**, **Therapist**, **Receptionist** y **Patient**.

## Roles Disponibles

### 1. Admin (Administrador)
- **Acceso completo** a todas las funcionalidades del sistema
- Puede crear, actualizar y eliminar usuarios
- Gestiona fisioterapeutas, pacientes, citas, sesiones y configuración
- Acceso completo a reportes y datos financieros

### 2. Therapist (Fisioterapeuta)
- Acceso **limitado a sus pacientes asignados**
- Puede ver y actualizar su propio perfil
- Gestiona pacientes asignados, citas y sesiones
- Crea y actualiza ejercicios y plantillas
- Genera reportes de sus pacientes
- Ve configuración básica (solo lectura)

### 3. Receptionist (Recepcionista)
- Puede ver **todos los fisioterapeutas y pacientes**
- Gestiona citas y programación
- Procesa pagos
- No puede crear o eliminar fisioterapeutas
- No puede modificar configuración del sistema

### 4. Patient (Paciente)
- Acceso **solo a su propia información**
- Ve sus citas y sesiones
- Ve sus pagos y reportes
- Acceso de solo lectura a ejercicios asignados

## Estructura de Archivos

```
src/
├── types/
│   └── roles.ts                 # Definiciones de roles y permisos
├── utils/
│   └── roles.ts                 # Funciones utilitarias para server-side
├── contexts/
│   └── RoleContext.tsx          # Context Provider para client-side
├── app/
│   └── api/
│       └── therapists/
│           └── create-user/
│               └── route.ts     # API actualizada con roles
supabase/
└── migrations/
    └── 20260107_add_roles_and_permissions.sql  # Migración de BD
```

## Uso del Sistema

### 1. En Componentes del Cliente (React)

#### Configurar el Provider

Primero, envuelve tu aplicación con el `RoleProvider`:

```tsx
// src/app/layout.tsx o donde configures tu app
import { RoleProvider } from '@/contexts/RoleContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RoleProvider>
          {children}
        </RoleProvider>
      </body>
    </html>
  );
}
```

#### Usar el Hook useRole

```tsx
'use client';

import { useRole } from '@/contexts/RoleContext';
import { Permission, UserRole } from '@/types/roles';

export function MyComponent() {
  const {
    userRole,
    isAdmin,
    isTherapist,
    hasPermission,
    isLoading
  } = useRole();

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>Rol: {userRole}</h1>

      {isAdmin && (
        <button>Gestionar Usuarios</button>
      )}

      {hasPermission(Permission.PATIENT_CREATE) && (
        <button>Crear Paciente</button>
      )}

      {(isAdmin || isTherapist) && (
        <div>Panel de Sesiones</div>
      )}
    </div>
  );
}
```

#### Hooks Convenientes

```tsx
import {
  useIsAdmin,
  useIsTherapist,
  useHasPermission
} from '@/contexts/RoleContext';
import { Permission } from '@/types/roles';

export function AdminPanel() {
  const isAdmin = useIsAdmin();
  const canManageTherapists = useHasPermission(Permission.THERAPIST_CREATE);

  if (!isAdmin) return null;

  return <div>Panel de Administración</div>;
}
```

### 2. En Server Components y API Routes

```tsx
// src/app/admin/page.tsx
import { getCurrentUserRole, isAdmin } from '@/utils/roles';
import { UserRole } from '@/types/roles';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const role = await getCurrentUserRole();

  // Verificar si es admin
  if (!(await isAdmin())) {
    redirect('/dashboard');
  }

  return (
    <div>
      <h1>Panel de Administración</h1>
      {/* Contenido solo para admins */}
    </div>
  );
}
```

#### Verificar Permisos Específicos

```tsx
import {
  hasPermission,
  hasAnyPermission,
  canManageTherapists
} from '@/utils/roles';
import { Permission } from '@/types/roles';

export default async function TherapistsPage() {
  const canCreate = await hasPermission(Permission.THERAPIST_CREATE);
  const canManage = await canManageTherapists();

  return (
    <div>
      {canCreate && <button>Crear Fisioterapeuta</button>}
      {canManage && <div>Panel de Gestión</div>}
    </div>
  );
}
```

### 3. En API Routes

```tsx
// src/app/api/therapists/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUserRole, hasPermission } from '@/utils/roles';
import { Permission, UserRole } from '@/types/roles';

export async function POST(request: Request) {
  // Verificar autenticación
  const role = await getCurrentUserRole();
  if (!role) {
    return NextResponse.json(
      { error: 'No autenticado' },
      { status: 401 }
    );
  }

  // Verificar permiso
  if (!(await hasPermission(Permission.THERAPIST_CREATE))) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 403 }
    );
  }

  // Procesar la petición
  // ...
}
```

### 4. Crear Usuarios con Roles

```tsx
// Al crear un fisioterapeuta
const response = await fetch('/api/therapists/create-user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    therapistId: '123',
    email: 'therapist@example.com',
    role: UserRole.THERAPIST,  // Especificar rol
    sendInvite: true
  })
});
```

## Permisos Disponibles

### Categoría: Therapist Management
- `THERAPIST_VIEW_ALL` - Ver todos los fisioterapeutas
- `THERAPIST_VIEW_OWN` - Ver propio perfil
- `THERAPIST_CREATE` - Crear fisioterapeutas
- `THERAPIST_UPDATE_ALL` - Actualizar cualquier fisioterapeuta
- `THERAPIST_UPDATE_OWN` - Actualizar propio perfil
- `THERAPIST_DELETE` - Eliminar fisioterapeutas

### Categoría: Patient Management
- `PATIENT_VIEW_ALL` - Ver todos los pacientes
- `PATIENT_VIEW_ASSIGNED` - Ver pacientes asignados
- `PATIENT_VIEW_OWN` - Ver propio perfil (para pacientes)
- `PATIENT_CREATE` - Crear pacientes
- `PATIENT_UPDATE_ALL` - Actualizar cualquier paciente
- `PATIENT_UPDATE_ASSIGNED` - Actualizar pacientes asignados
- `PATIENT_UPDATE_OWN` - Actualizar propio perfil
- `PATIENT_DELETE` - Eliminar pacientes

### Categoría: Appointments
- `APPOINTMENT_VIEW_ALL` - Ver todas las citas
- `APPOINTMENT_VIEW_ASSIGNED` - Ver citas asignadas
- `APPOINTMENT_VIEW_OWN` - Ver propias citas
- `APPOINTMENT_CREATE` - Crear citas
- `APPOINTMENT_UPDATE_ALL` - Actualizar cualquier cita
- `APPOINTMENT_UPDATE_ASSIGNED` - Actualizar citas asignadas
- `APPOINTMENT_DELETE` - Eliminar citas

### Categoría: Sessions
- `SESSION_VIEW_ALL` - Ver todas las sesiones
- `SESSION_VIEW_ASSIGNED` - Ver sesiones asignadas
- `SESSION_CREATE` - Crear sesiones
- `SESSION_UPDATE_ALL` - Actualizar cualquier sesión
- `SESSION_UPDATE_ASSIGNED` - Actualizar sesiones asignadas
- `SESSION_DELETE` - Eliminar sesiones

### Categoría: Payments
- `PAYMENT_VIEW_ALL` - Ver todos los pagos
- `PAYMENT_VIEW_ASSIGNED` - Ver pagos de pacientes asignados
- `PAYMENT_CREATE` - Crear pagos
- `PAYMENT_UPDATE_ALL` - Actualizar cualquier pago
- `PAYMENT_DELETE` - Eliminar pagos

### Categoría: Reports
- `REPORT_VIEW_ALL` - Ver todos los reportes
- `REPORT_VIEW_ASSIGNED` - Ver reportes asignados
- `REPORT_CREATE` - Crear reportes

### Categoría: Exercises & Templates
- `EXERCISE_VIEW` - Ver ejercicios
- `EXERCISE_CREATE` - Crear ejercicios
- `EXERCISE_UPDATE` - Actualizar ejercicios
- `EXERCISE_DELETE` - Eliminar ejercicios
- `TEMPLATE_VIEW` - Ver plantillas
- `TEMPLATE_CREATE` - Crear plantillas
- `TEMPLATE_UPDATE` - Actualizar plantillas
- `TEMPLATE_DELETE` - Eliminar plantillas

### Categoría: Settings
- `SETTINGS_VIEW` - Ver configuración
- `SETTINGS_UPDATE` - Actualizar configuración

### Categoría: User Management
- `USER_CREATE` - Crear usuarios
- `USER_UPDATE_ALL` - Actualizar cualquier usuario
- `USER_DELETE` - Eliminar usuarios

## Funciones Utilitarias Disponibles

### Server-Side (`@/utils/roles`)

```typescript
// Obtener rol del usuario actual
await getCurrentUserRole(): Promise<UserRole | null>

// Verificar roles
await hasRole(role: UserRole): Promise<boolean>
await hasAnyRole(roles: UserRole[]): Promise<boolean>
await isAdmin(): Promise<boolean>
await isTherapist(): Promise<boolean>
await isReceptionist(): Promise<boolean>
await isPatient(): Promise<boolean>
await isStaff(): Promise<boolean>

// Verificar permisos
await hasPermission(permission: Permission): Promise<boolean>
await hasAnyPermission(permissions: Permission[]): Promise<boolean>
await hasAllPermissions(permissions: Permission[]): Promise<boolean>

// Funciones de conveniencia
await canManageTherapists(): Promise<boolean>
await canManagePatients(): Promise<boolean>
await canViewAllPatients(): Promise<boolean>
await canManageAppointments(): Promise<boolean>
await canManageSessions(): Promise<boolean>
await canManagePayments(): Promise<boolean>
await canAccessSettings(): Promise<boolean>
await canUpdateSettings(): Promise<boolean>

// Obtener información
await getCurrentUserPermissions(): Promise<Permission[]>
await getCurrentUserWithRole(): Promise<UserWithRole | null>

// Asignar roles (requiere service role)
await assignRoleToUser(userId: string, role: UserRole): Promise<Result>

// Utilidades
getRoleDisplayName(role: UserRole): string
getAllRoles(): UserRole[]
isValidRole(role: string): boolean
```

### Client-Side (Hooks de React)

```typescript
// Hook principal
const {
  user,
  userRole,
  permissions,
  isLoading,
  hasRole,
  hasAnyRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isTherapist,
  isReceptionist,
  isPatient,
  isStaff,
  refreshRole
} = useRole();

// Hooks convenientes
const isAdmin = useIsAdmin();
const isTherapist = useIsTherapist();
const isReceptionist = useIsReceptionist();
const isPatient = useIsPatient();
const isStaff = useIsStaff();
const canCreate = useHasPermission(Permission.PATIENT_CREATE);
const canManage = useHasAnyPermission([Permission.PATIENT_UPDATE_ALL]);
```

## Base de Datos

### Tablas Principales

1. **roles** - Define los roles disponibles
2. **permissions** - Define todos los permisos
3. **role_permissions** - Mapea permisos a roles
4. **user_roles** - Asigna roles a usuarios

### Funciones SQL Útiles

```sql
-- Obtener el rol de un usuario
SELECT public.get_user_role('user-uuid-here');

-- Verificar si un usuario tiene un permiso
SELECT public.user_has_permission('user-uuid-here', 'patient:create');

-- Obtener todos los permisos de un usuario
SELECT * FROM public.get_user_permissions('user-uuid-here');
```

### RLS (Row Level Security)

Las políticas RLS están configuradas para:
- Los usuarios pueden ver sus propios roles
- Solo admins pueden gestionar roles de usuarios
- Todos pueden ver la lista de roles y permisos disponibles

## Migración

Para aplicar el sistema de roles a tu base de datos:

1. Asegúrate de tener acceso a Supabase
2. Ejecuta la migración:
   ```bash
   # Si usas Supabase CLI
   supabase db push

   # O copia el contenido de:
   # supabase/migrations/20260107_add_roles_and_permissions.sql
   # y ejecútalo en el SQL Editor de Supabase
   ```

3. La migración:
   - Crea las tablas necesarias
   - Añade el campo `role` a la tabla `therapists`
   - Inserta los 4 roles predefinidos
   - Inserta todos los permisos
   - Mapea permisos a cada rol
   - Crea funciones SQL útiles
   - Configura políticas RLS

## Próximos Pasos Recomendados

1. **Actualizar Middleware** - Implementar protección de rutas por rol
2. **Actualizar Sidebar** - Mostrar/ocultar items según permisos
3. **Actualizar RLS en otras tablas** - Aplicar políticas basadas en roles a `patients`, `appointments`, `sessions`, etc.
4. **Crear componentes de protección** - HOCs o componentes wrapper para proteger secciones de UI
5. **Audit logging** - Registrar acciones sensibles con información de rol

## Ejemplos de Uso Común

### Proteger una Página Completa

```tsx
// src/app/admin/therapists/page.tsx
import { isAdmin } from '@/utils/roles';
import { redirect } from 'next/navigation';

export default async function TherapistsManagementPage() {
  if (!(await isAdmin())) {
    redirect('/dashboard');
  }

  return <div>Gestión de Fisioterapeutas</div>;
}
```

### Renderizado Condicional en Componentes

```tsx
'use client';

import { useRole } from '@/contexts/RoleContext';
import { Permission } from '@/types/roles';

export function PatientActions({ patientId }: { patientId: string }) {
  const { hasPermission, isAdmin } = useRole();

  const canEdit = hasPermission(Permission.PATIENT_UPDATE_ALL) ||
                  hasPermission(Permission.PATIENT_UPDATE_ASSIGNED);
  const canDelete = hasPermission(Permission.PATIENT_DELETE);

  return (
    <div>
      {canEdit && <button>Editar</button>}
      {canDelete && isAdmin && <button>Eliminar</button>}
    </div>
  );
}
```

### API con Verificación de Permisos

```tsx
import { NextResponse } from 'next/server';
import { hasPermission } from '@/utils/roles';
import { Permission } from '@/types/roles';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await hasPermission(Permission.PATIENT_DELETE))) {
    return NextResponse.json(
      { error: 'No tienes permiso para eliminar pacientes' },
      { status: 403 }
    );
  }

  // Proceder con la eliminación
  // ...
}
```

## Seguridad

- Los roles se almacenan en `user_metadata` y `app_metadata` de Supabase Auth
- Las verificaciones de permisos se hacen tanto en cliente como en servidor
- **IMPORTANTE**: Siempre verificar permisos en el servidor (API routes, server components)
- Las verificaciones del cliente son solo para UX, no para seguridad real
- Las políticas RLS en la base de datos son la última línea de defensa

## Soporte y Documentación

Para más información sobre Supabase Auth y RLS:
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
