# Sistema de Notificaciones para Fisioterapeutas

Este documento explica cómo funciona el sistema de asignación de fisioterapeutas y notificaciones automáticas en Clinova.

## Características Implementadas

### 1. Asignación de Fisioterapeutas a Citas
- ✅ Selector de fisioterapeuta en el formulario de nueva cita
- ✅ Edición de citas existentes para asignar/reasignar fisioterapeutas
- ✅ Visualización del fisioterapeuta asignado en la agenda

### 2. Notificaciones Automáticas
- ✅ Trigger automático en base de datos que crea notificaciones cuando se asigna un fisioterapeuta
- ✅ Notificaciones almacenadas en la tabla `notifications`
- ✅ Campana de notificaciones en el header con contador de no leídas
- ✅ Actualizaciones en tiempo real usando Supabase Realtime
- ✅ Función para marcar notificaciones como leídas

## Configuración en Supabase

### Paso 1: Ejecutar el Schema de Notificaciones

Ejecuta el siguiente archivo SQL en tu editor SQL de Supabase:

```bash
supabase_schema_notifications.sql
```

Este script crea:

1. **Tabla `notifications`**: Almacena todas las notificaciones enviadas
2. **Trigger `trigger_notify_therapist_assignment`**: Se ejecuta automáticamente cuando se asigna un fisioterapeuta
3. **Función `notify_therapist_assignment()`**: Genera el contenido de la notificación
4. **Función `mark_notification_read()`**: Marca una notificación como leída
5. **Políticas RLS**: Controla el acceso a las notificaciones

### Paso 2: Verificar que la tabla `therapists` existe

Asegúrate de haber ejecutado previamente:

```bash
supabase_schema_therapists.sql
```

### Paso 3: Habilitar Realtime en Supabase

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Database** → **Replication**
3. Habilita Realtime para la tabla `notifications`

## Cómo Usar el Sistema

### Crear una Nueva Cita con Fisioterapeuta

1. Ve a **Agenda** → **Nueva Cita**
2. Selecciona el paciente
3. **NUEVO**: Selecciona el fisioterapeuta (opcional)
4. Elige fecha y hora
5. Guarda la cita

**Resultado**: Si se seleccionó un fisioterapeuta, automáticamente se crea una notificación en la base de datos.

### Asignar Fisioterapeuta a Cita Existente

1. Ve a **Agenda**
2. Haz clic en cualquier cita del calendario
3. Esto te llevará a la página de edición
4. Selecciona o cambia el fisioterapeuta
5. Guarda los cambios

**Resultado**: Se crea una nueva notificación informando sobre la asignación o cambio.

### Ver Notificaciones

1. Si el usuario logueado es un fisioterapeuta (su email coincide con un email en la tabla `therapists`):
   - Verá una campana en el header
   - Un número rojo indica cuántas notificaciones sin leer tiene
   - Al hacer clic en la campana, se abre un dropdown con las notificaciones
2. Al hacer clic en una notificación:
   - Se marca automáticamente como leída
   - El contador se actualiza

### Notificaciones en Tiempo Real

El sistema usa Supabase Realtime para mostrar notificaciones instantáneamente:

- Cuando se asigna un fisioterapeuta a una cita, el trigger de la base de datos inserta una fila en `notifications`
- El componente `NotificationBell` escucha cambios en la tabla
- La nueva notificación aparece inmediatamente sin necesidad de refrescar la página

## Contenido de las Notificaciones

Las notificaciones incluyen:

- **Asunto**: "Nueva cita asignada - [Nombre del Paciente]"
- **Cuerpo**:
  ```
  Hola [Nombre del Fisioterapeuta],

  Se te ha asignado una nueva cita:

  Paciente: [Nombre Completo]
  Fecha y hora: DD/MM/YYYY HH:MM
  Notas: [Si existen]

  Por favor, revisa los detalles en el sistema.

  Saludos,
  Clinova
  ```

## Tipos de Notificaciones

El sistema soporta los siguientes tipos:

- `appointment_assigned`: Primera asignación de un fisioterapeuta a una cita
- `appointment_updated`: Cambio de fisioterapeuta en una cita existente
- `appointment_cancelled`: Cancelación de una cita (futuro)
- `session_assigned`: Asignación a una sesión (futuro)

## API de Notificaciones

### Endpoint: POST /api/notifications/send

Este endpoint está preparado para enviar notificaciones por email (actualmente solo las registra en consola).

**Uso futuro**: Integrar con servicios como SendGrid, Resend, o Amazon SES.

```typescript
// Ejemplo de integración futura
const response = await fetch('/api/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ notificationId: 'uuid-here' })
});
```

## Componentes Creados

1. **`TherapistSelect`** (`src/components/therapists/TherapistSelect.tsx`)
   - Selector reutilizable de fisioterapeutas activos
   - Se usa en formularios de nueva cita y edición

2. **`NotificationBell`** (`src/components/notifications/NotificationBell.tsx`)
   - Campana de notificaciones en el header
   - Muestra contador de no leídas
   - Dropdown con lista de notificaciones
   - Realtime updates

3. **`AppointmentEditForm`** (`src/components/appointments/AppointmentEditForm.tsx`)
   - Formulario completo para editar citas
   - Incluye asignación de fisioterapeuta
   - Cambio de estado de la cita

4. **`AppointmentEditDialog`** (`src/components/appointments/AppointmentEditDialog.tsx`)
   - Dialog modal para asignación rápida (opcional)

## Archivos Modificados

- `src/app/dashboard/agenda/nueva/page.tsx`: Añadido selector de fisioterapeuta
- `src/components/layout/Header.tsx`: Añadida campana de notificaciones
- `src/app/globals.css`: Mejorados colores para mejor contraste

## Archivos Nuevos

- `supabase_schema_notifications.sql`: Schema de base de datos
- `src/types/notification.ts`: Tipos TypeScript para notificaciones
- `src/app/api/notifications/send/route.ts`: Endpoint API (preparado para email)
- `src/app/dashboard/agenda/[id]/editar/page.tsx`: Página de edición de citas
- Componentes mencionados arriba

## Próximos Pasos (Opcionales)

### Integración con Servicio de Email

Para enviar emails reales, necesitas:

1. Elegir un proveedor (Resend, SendGrid, etc.)
2. Instalar el SDK correspondiente
3. Configurar las credenciales en variables de entorno
4. Descomentar el código en `/api/notifications/send/route.ts`

**Ejemplo con Resend**:

```bash
npm install resend
```

```typescript
// En .env.local
RESEND_API_KEY=tu_api_key

// En /api/notifications/send/route.ts
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'Clinova <noreply@tudominio.com>',
  to: notification.recipient_email,
  subject: notification.subject,
  html: notification.body.replace(/\n/g, '<br>'),
});
```

### Notificaciones Push (Futuro)

- Implementar web push notifications
- Integrar con Firebase Cloud Messaging o similar

### SMS (Futuro)

- Integrar con Twilio u otro proveedor de SMS
- Añadir campo de teléfono al fisioterapeuta

## Solución de Problemas

### Las notificaciones no aparecen

1. Verifica que ejecutaste `supabase_schema_notifications.sql`
2. Verifica que el fisioterapeuta existe en la tabla `therapists`
3. Verifica que el email del usuario logueado coincide con el email del fisioterapeuta
4. Verifica que Realtime está habilitado en Supabase

### El trigger no se ejecuta

1. Verifica que la función `notify_therapist_assignment()` existe:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'notify_therapist_assignment';
   ```

2. Verifica que el trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_notify_therapist_assignment';
   ```

### Las notificaciones no se marcan como leídas

1. Verifica que la función `mark_notification_read` existe
2. Verifica las políticas RLS en la tabla `notifications`

## Soporte

Para más información sobre el sistema, revisa:

- [Documentación de Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Documentación de Supabase Triggers](https://supabase.com/docs/guides/database/postgres/triggers)
- [README principal del proyecto](./README.md)
