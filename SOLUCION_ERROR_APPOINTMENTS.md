# Solución al Error: "foreign key constraint appointments_therapist_id_fkey"

## Problema

Al intentar crear una cita y asignar un fisioterapeuta, aparece el siguiente error:

```
insert or update on table "appointments" violates foreign key constraint "appointments_therapist_id_fkey"
```

## Causa

La tabla `appointments` tiene una foreign key `therapist_id` que actualmente referencia `auth.users(id)`, pero nuestra aplicación usa una tabla separada `therapists` con sus propios IDs UUID.

Cuando intentamos asignar un fisioterapeuta desde el selector, estamos usando el ID de la tabla `therapists`, pero la base de datos espera un ID de la tabla `auth.users`.

## Solución

Ejecuta el siguiente script SQL en tu editor SQL de Supabase para corregir la foreign key:

### Paso 1: Ejecutar el Script de Migración

En el **SQL Editor de Supabase**, ejecuta el archivo:

```sql
supabase_migration_fix_appointments_therapist.sql
```

O copia y pega este código directamente:

```sql
-- Migration: Fix appointments.therapist_id to reference therapists table

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS appointments_therapist_id_fkey;

-- Step 2: Update any existing therapist_id values to NULL
-- (ya que referencian la tabla incorrecta)
UPDATE public.appointments
SET therapist_id = NULL
WHERE therapist_id IS NOT NULL;

-- Step 3: Add the new foreign key constraint pointing to therapists table
ALTER TABLE public.appointments
ADD CONSTRAINT appointments_therapist_id_fkey
FOREIGN KEY (therapist_id)
REFERENCES public.therapists(id)
ON DELETE SET NULL;

-- Step 4: Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_id
ON public.appointments(therapist_id);
```

### Paso 2: Verificar que Funcionó

Ejecuta esta consulta para verificar:

```sql
SELECT
  a.id,
  a.patient_id,
  a.therapist_id,
  t.first_name || ' ' || t.last_name as therapist_name,
  p.first_name || ' ' || p.last_name as patient_name
FROM appointments a
LEFT JOIN therapists t ON a.therapist_id = t.id
LEFT JOIN patients p ON a.patient_id = p.id
LIMIT 5;
```

Si la consulta funciona sin errores, la migración fue exitosa.

### Paso 3: Probar en la Aplicación

1. Ve a **Agenda** → **Nueva Cita**
2. Selecciona un paciente
3. Selecciona un fisioterapeuta del dropdown
4. Elige fecha y hora
5. Haz clic en "Agendar Cita"

La cita debería crearse exitosamente y el fisioterapeuta recibirá una notificación.

## ¿Por Qué Sucedió Esto?

El schema original de `appointments` fue creado antes de implementar la tabla de `therapists`. En ese momento, se asumió que los terapeutas serían usuarios del sistema (tabla `auth.users`).

Ahora que tenemos una tabla dedicada `therapists` con información adicional (especialidades, licencia, horarios, etc.), necesitamos que las citas referencien esta tabla en lugar de `auth.users`.

## Archivos Actualizados

Los siguientes archivos ya fueron corregidos para futuras instalaciones:

- ✅ `supabase_schema_appointments.sql` - Schema corregido
- ✅ `supabase_migration_fix_appointments_therapist.sql` - Script de migración

## Notas Importantes

- **ADVERTENCIA**: El paso 2 del script establece todos los `therapist_id` existentes a `NULL`. Si ya tienes citas con terapeutas asignados y quieres mantener esas asignaciones, necesitarás mapear manualmente los IDs de `auth.users` a los IDs de `therapists` antes de ejecutar la migración.

- Si tienes datos existentes que quieres preservar, contacta al desarrollador para un script de migración personalizado.

## Soporte

Si después de ejecutar el script sigues teniendo problemas, verifica:

1. Que la tabla `therapists` existe y tiene fisioterapeutas registrados
2. Que ejecutaste el script completo sin errores
3. Que refrescaste la página de la aplicación después de la migración
