# Guía de Creación de Usuarios - Clinova

## Descripción General

El sistema de creación de usuarios de Clinova permite crear usuarios de diferentes roles (Admin, Therapist, Receptionist, Patient) desde una interfaz unificada. Este sistema reemplaza y extiende el flujo anterior que solo permitía crear fisioterapeutas.

## Archivos Principales

### API Endpoints

1. **[src/app/api/users/create/route.ts](../src/app/api/users/create/route.ts)** - API general para crear usuarios de cualquier rol
2. **[src/app/api/therapists/create-user/route.ts](../src/app/api/therapists/create-user/route.ts)** - API específica para fisioterapeutas (mantiene compatibilidad)

### Componentes UI

3. **[src/components/users/CreateUserForm.tsx](../src/components/users/CreateUserForm.tsx)** - Formulario universal de creación
4. **[src/components/users/UsersList.tsx](../src/components/users/UsersList.tsx)** - Lista de todos los usuarios del sistema

### Páginas

5. **[src/app/dashboard/users/page.tsx](../src/app/dashboard/users/page.tsx)** - Página de gestión de usuarios (solo admins)
6. **[src/app/dashboard/users/create/page.tsx](../src/app/dashboard/users/create/page.tsx)** - Página de creación de usuarios

### Migraciones

7. **[supabase/migrations/20260107_update_patients_add_auth_user_id.sql](../supabase/migrations/20260107_update_patients_add_auth_user_id.sql)** - Actualiza tabla de pacientes

## Roles y Capacidades de Creación

| Rol Usuario | Puede Crear | Limitaciones |
|-------------|-------------|--------------|
| **Admin** | Todos los roles | Sin restricciones |
| **Receptionist** | Patients | Solo puede crear pacientes |
| **Therapist** | Patients (asignados a sí mismo) | Limitado a sus pacientes |
| **Patient** | ❌ No puede crear usuarios | - |

## Uso de la API

### Endpoint: POST /api/users/create

#### Request Body

```json
{
  "email": "usuario@example.com",
  "first_name": "Juan",
  "last_name": "Pérez",
  "role": "therapist",
  "sendInvite": true,
  "additionalData": {
    // Campos específicos por rol (ver abajo)
  }
}
```

#### Campos Requeridos

- `email` (string): Email único del usuario
- `first_name` (string): Nombre
- `last_name` (string): Apellido
- `role` (UserRole enum): `admin`, `therapist`, `receptionist`, o `patient`

#### Campos Opcionales

- `sendInvite` (boolean): Enviar email de invitación (default: true)
- `additionalData` (object): Datos adicionales según el rol

### Additional Data por Rol

#### Para Therapist
```json
{
  "additionalData": {
    "phone": "+34 600 000 000",
    "specialization": "Ortopedia",
    "license_number": "12345",
    "status": "active"
  }
}
```

#### Para Patient
```json
{
  "additionalData": {
    "phone": "+34 600 000 000",
    "date_of_birth": "1990-01-15",
    "address": "Calle Principal 123",
    "emergency_contact_name": "María Pérez",
    "emergency_contact_phone": "+34 600 111 222",
    "medical_history": "Diabetes tipo 2, hipertensión",
    "primary_therapist_id": "uuid-del-fisioterapeuta"
  }
}
```

#### Para Admin o Receptionist
```json
{
  "additionalData": {
    "phone": "+34 600 000 000"
  }
}
```

### Response Exitoso

```json
{
  "success": true,
  "userId": "uuid-del-usuario",
  "role": "therapist",
  "roleSpecificRecord": {
    // Datos del registro específico (therapist o patient)
  },
  "inviteSent": true,
  "message": "Usuario creado e invitación enviada"
}
```

### Errores Comunes

#### 409 - Usuario ya existe
```json
{
  "error": "Ya existe un usuario con este email",
  "userExists": true
}
```

#### 400 - Rol inválido
```json
{
  "error": "Invalid role",
  "validRoles": ["admin", "therapist", "receptionist", "patient"]
}
```

#### 403 - Sin permisos
```json
{
  "error": "No autorizado"
}
```

## Uso del Componente UI

### Crear Usuario con Formulario Completo

```tsx
import CreateUserForm from '@/components/users/CreateUserForm';

export default function CreateUserPage() {
  return (
    <CreateUserForm
      onSuccess={(userId, role) => {
        console.log('Usuario creado:', userId, role);
        // Redirigir según el rol
      }}
      onCancel={() => {
        // Volver atrás
      }}
    />
  );
}
```

### Crear Usuario con Rol Fijo

```tsx
import CreateUserForm from '@/components/users/CreateUserForm';
import { UserRole } from '@/types/roles';

export default function CreatePatientPage() {
  return (
    <CreateUserForm
      defaultRole={UserRole.PATIENT}
      hideRoleSelection={true}
      onSuccess={(userId) => {
        // Redirigir a la lista de pacientes
      }}
    />
  );
}
```

## Flujo de Creación

### 1. Validación de Permisos

El sistema verifica que el usuario actual tenga permisos para crear el rol solicitado:

```typescript
// En el API endpoint
if (!hasPermission(Permission.USER_CREATE)) {
  return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
}
```

### 2. Creación en Supabase Auth

Se crea el usuario en `auth.users` con metadata:

```typescript
const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
  email,
  user_metadata: {
    first_name,
    last_name,
    role,
  },
  app_metadata: {
    role,
  },
});
```

### 3. Asignación de Rol

Se registra el rol en la tabla `user_roles`:

```typescript
await supabaseAdmin
  .from('user_roles')
  .insert({
    user_id: newUser.user.id,
    role_id: roleData.id,
  });
```

### 4. Creación de Registro Específico

Según el rol, se crea un registro en:
- **Therapist** → tabla `therapists`
- **Patient** → tabla `patients`
- **Admin/Receptionist** → solo en `auth.users` y `user_roles`

### 5. Envío de Invitación (Opcional)

Si `sendInvite: true`, se envía un email con link para configurar contraseña:

```typescript
await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
  redirectTo: '/auth/setup-password',
});
```

## Estructura de Datos

### Tabla: auth.users
```sql
- id: UUID
- email: TEXT
- user_metadata: JSONB {
    first_name: TEXT,
    last_name: TEXT,
    role: TEXT
  }
- app_metadata: JSONB {
    role: TEXT
  }
```

### Tabla: user_roles
```sql
- id: UUID
- user_id: UUID (FK → auth.users)
- role_id: UUID (FK → roles)
- assigned_at: TIMESTAMP
```

### Tabla: therapists
```sql
- id: UUID
- auth_user_id: UUID (FK → auth.users)
- first_name: TEXT
- last_name: TEXT
- email: TEXT
- phone: TEXT
- specialization: TEXT
- license_number: TEXT
- status: ENUM ('active', 'inactive', 'on_leave')
- role: user_role (ENUM)
```

### Tabla: patients
```sql
- id: UUID
- auth_user_id: UUID (FK → auth.users, nullable)
- first_name: TEXT
- last_name: TEXT
- email: TEXT
- phone: TEXT
- date_of_birth: DATE
- address: TEXT
- emergency_contact_name: TEXT
- emergency_contact_phone: TEXT
- medical_history: TEXT
- primary_therapist_id: UUID (FK → therapists)
```

## Ejemplos de Uso

### Ejemplo 1: Crear Administrador

```typescript
const response = await fetch('/api/users/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@clinova.com',
    first_name: 'Carlos',
    last_name: 'Rodríguez',
    role: 'admin',
    sendInvite: true,
    additionalData: {
      phone: '+34 600 123 456'
    }
  })
});

const data = await response.json();
console.log('Admin creado:', data.userId);
```

### Ejemplo 2: Crear Fisioterapeuta

```typescript
const response = await fetch('/api/users/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'fisio@clinova.com',
    first_name: 'Ana',
    last_name: 'García',
    role: 'therapist',
    sendInvite: true,
    additionalData: {
      phone: '+34 600 234 567',
      specialization: 'Fisioterapia Deportiva',
      license_number: 'FT-2024-001',
      status: 'active'
    }
  })
});
```

### Ejemplo 3: Crear Paciente

```typescript
const response = await fetch('/api/users/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'paciente@example.com',
    first_name: 'Luis',
    last_name: 'Martínez',
    role: 'patient',
    sendInvite: true,
    additionalData: {
      phone: '+34 600 345 678',
      date_of_birth: '1985-05-15',
      address: 'Calle Mayor 45, Madrid',
      emergency_contact_name: 'Rosa Martínez',
      emergency_contact_phone: '+34 600 456 789',
      medical_history: 'Operación de rodilla en 2020. Sin alergias conocidas.',
      primary_therapist_id: 'uuid-del-fisioterapeuta'
    }
  })
});
```

### Ejemplo 4: Crear Recepcionista

```typescript
const response = await fetch('/api/users/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'recepcion@clinova.com',
    first_name: 'Laura',
    last_name: 'Sánchez',
    role: 'receptionist',
    sendInvite: true,
    additionalData: {
      phone: '+34 600 567 890'
    }
  })
});
```

## Acceso a las Páginas

### Solo Administradores

- `/dashboard/users` - Lista de todos los usuarios
- `/dashboard/users/create` - Crear usuario con selección de rol

### Administradores y Recepcionistas

- Pueden crear pacientes desde `/dashboard/patients/create`
- Pueden crear usuarios desde `/dashboard/users/create` (recepcionistas solo ven opción de paciente)

### Fisioterapeutas

- Pueden crear pacientes desde formulario de pacientes
- Los pacientes creados se asignan automáticamente al fisioterapeuta

## Políticas RLS Aplicadas

### Tabla patients

1. **SELECT**:
   - Admins y recepcionistas: Todos los pacientes
   - Fisioterapeutas: Solo pacientes asignados
   - Pacientes: Solo sus propios datos

2. **INSERT**:
   - Admins, recepcionistas y fisioterapeutas pueden crear pacientes

3. **UPDATE**:
   - Admins y recepcionistas: Todos los pacientes
   - Fisioterapeutas: Solo pacientes asignados
   - Pacientes: Sus propios datos (campos limitados)

4. **DELETE**:
   - Solo administradores

### Tabla therapists

Las políticas existentes se mantienen, pero ahora se basan en roles de `user_roles` en lugar de solo `auth_user_id`.

## Migraciones Requeridas

Para usar el sistema completo, debes ejecutar estas migraciones en orden:

1. `20260107_add_roles_and_permissions.sql` - Crea sistema de roles
2. `20260107_update_patients_add_auth_user_id.sql` - Actualiza tabla de pacientes

```bash
# Usando Supabase CLI
supabase db push

# O manualmente en Supabase Dashboard → SQL Editor
# Copia y ejecuta el contenido de cada archivo
```

## Seguridad

### Validaciones Implementadas

1. ✅ Email único por usuario
2. ✅ Validación de rol contra enum
3. ✅ Verificación de permisos antes de crear
4. ✅ RLS en todas las tablas
5. ✅ Service role solo en backend
6. ✅ Passwords nunca expuestas (manejadas por Supabase Auth)

### Mejores Prácticas

- **Nunca** uses service role key en el cliente
- **Siempre** verifica permisos en el servidor (API routes)
- **Limita** qué campos pueden actualizar los pacientes
- **Registra** quién crea cada usuario (campo `assigned_by` en `user_roles`)

## Próximos Pasos

1. ✅ Sistema básico de roles implementado
2. ✅ API de creación de usuarios completa
3. ✅ Formulario UI universal
4. ✅ Políticas RLS por rol
5. ⏳ Actualizar sidebar con permisos
6. ⏳ Proteger rutas con middleware
7. ⏳ Añadir audit logging
8. ⏳ Implementar edición de usuarios
9. ⏳ Implementar cambio de roles
10. ⏳ Dashboard de actividad por usuario

## Troubleshooting

### Error: "Missing Supabase credentials"
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté en `.env.local`

### Error: "Ya existe un usuario con este email"
- El email debe ser único en todo el sistema
- Verifica en Supabase Dashboard → Authentication

### Error: "Role not found"
- Ejecuta la migración de roles primero
- Verifica que la tabla `roles` tenga datos

### Usuario creado pero sin acceso
- Verifica que el email de invitación se haya enviado
- Revisa la tabla `user_roles` para confirmar asignación de rol
- Comprueba `user_metadata` y `app_metadata` en `auth.users`

## Soporte

Para más información:
- [Documentación de Roles y Permisos](./ROLES_AND_PERMISSIONS.md)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Issues en GitHub](https://github.com/your-repo/issues)
