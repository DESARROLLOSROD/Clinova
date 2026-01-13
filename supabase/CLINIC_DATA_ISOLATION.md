# Aislamiento de Datos por Clínica

Este documento explica cómo funciona el aislamiento de datos entre clínicas en Clinova y cómo verificar que está funcionando correctamente.

## Concepto de Multi-Tenancy

Clinova utiliza un modelo de multi-tenancy a nivel de base de datos donde:
- Cada clínica (tenant) tiene sus propios datos aislados
- Los usuarios solo pueden ver y gestionar datos de su propia clínica
- El aislamiento se logra mediante Row Level Security (RLS) de PostgreSQL

## Estructura de Datos

### Tabla Principal: `clinics`
Cada registro representa una clínica registrada en la plataforma.

```sql
- id (uuid): Identificador único de la clínica
- name (text): Nombre de la clínica
- slug (text): Slug único para subdominios
- subscription_tier: Plan de suscripción
```

### Relación con Otras Tablas

Todas las tablas principales tienen una columna `clinic_id` que referencia a `clinics.id`:

- **user_profiles**: Usuarios asignados a una clínica
- **patients**: Pacientes de una clínica
- **appointments**: Citas de una clínica
- **payments**: Pagos de una clínica
- **sessions**: Sesiones de terapia
- **patient_documents**: Documentos de pacientes
- **body_map_annotations**: Anotaciones de mapas corporales
- **patient_consents**: Consentimientos de pacientes
- **patient_exercises**: Ejercicios asignados a pacientes
- **exercise_templates**: Plantillas de ejercicios personalizadas

## Row Level Security (RLS)

### ¿Qué es RLS?

RLS es una característica de PostgreSQL que permite filtrar automáticamente las filas según políticas de seguridad. Esto significa que:

1. Cuando un usuario hace `SELECT * FROM patients`, solo verá pacientes de su clínica
2. No puede insertar/actualizar/eliminar datos de otras clínicas
3. El filtrado es transparente y automático

### Políticas Implementadas

#### Política Base (Ejemplo: Tabla `patients`)

```sql
-- SELECT: Ver solo pacientes de mi clínica
CREATE POLICY "Users can view patients from their clinic"
ON public.patients FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles WHERE id = auth.uid()
  )
);

-- INSERT: Solo crear pacientes en mi clínica
CREATE POLICY "Clinic staff can insert patients"
ON public.patients FOR INSERT
WITH CHECK (
  clinic_id IN (
    SELECT clinic_id FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('clinic_manager', 'admin', 'therapist', 'receptionist')
  )
);
```

## Verificación de Aislamiento

### 1. Ejecutar Script de Diagnóstico

```bash
# En Supabase SQL Editor o mediante CLI
psql -f supabase/migrations/20260113_diagnostic_check_clinic_data.sql
```

Este script verifica:
- ✅ Cuántas clínicas existen
- ✅ Usuarios asignados a cada clínica
- ✅ Cantidad de datos por clínica
- ✅ Datos huérfanos (sin clinic_id)
- ✅ Inconsistencias entre tablas
- ✅ Estado de políticas RLS

### 2. Verificar RLS Está Habilitado

```sql
SELECT
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'appointments', 'payments')
ORDER BY tablename;
```

**Resultado esperado:** Todas las tablas deben tener `rls_enabled = true`

### 3. Probar el Aislamiento

#### Test 1: Verificar que un usuario solo ve datos de su clínica

```sql
-- Como usuario admin@demo.com
SELECT
  p.id,
  p.first_name,
  p.clinic_id,
  c.name as clinic_name
FROM patients p
JOIN clinics c ON c.id = p.clinic_id;
```

**Resultado esperado:** Solo pacientes de la clínica del usuario actual

#### Test 2: Intentar insertar paciente en otra clínica (debe fallar)

```sql
-- Esto debería fallar si intento usar clinic_id de otra clínica
INSERT INTO patients (first_name, last_name, email, clinic_id)
VALUES ('Test', 'Patient', 'test@test.com', '<clinic_id_de_otra_clinica>');
```

**Resultado esperado:** Error de política RLS

### 4. Verificar No Hay Datos Mezclados

```sql
-- Verificar que no haya pacientes con citas de otra clínica
SELECT
  p.id,
  p.first_name,
  p.clinic_id as patient_clinic,
  a.clinic_id as appointment_clinic
FROM patients p
JOIN appointments a ON a.patient_id = p.id
WHERE p.clinic_id != a.clinic_id;
```

**Resultado esperado:** 0 registros

## Aplicar las Migraciones

### Orden de Ejecución

```bash
# 1. Primero, ejecutar el diagnóstico para ver el estado actual
supabase db execute < supabase/migrations/20260113_diagnostic_check_clinic_data.sql

# 2. Aplicar la migración de aislamiento
supabase db push

# O manualmente:
supabase db execute < supabase/migrations/20260113_enforce_clinic_data_isolation.sql

# 3. Volver a ejecutar el diagnóstico para verificar
supabase db execute < supabase/migrations/20260113_diagnostic_check_clinic_data.sql
```

## Solución de Problemas

### Problema: Veo datos de otras clínicas

**Causas posibles:**
1. RLS no está habilitado en alguna tabla
2. El usuario actual no tiene `clinic_id` asignado
3. Hay datos huérfanos sin `clinic_id`

**Solución:**
```sql
-- 1. Verificar RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- 2. Verificar mi clinic_id
SELECT id, clinic_id, role FROM user_profiles WHERE id = auth.uid();

-- 3. Buscar datos huérfanos
SELECT COUNT(*) FROM patients WHERE clinic_id IS NULL;
```

### Problema: No puedo ver mis propios datos

**Causas posibles:**
1. Mi usuario no tiene `clinic_id` asignado
2. Las políticas RLS son demasiado restrictivas

**Solución:**
```sql
-- Verificar mi perfil
SELECT * FROM user_profiles WHERE id = auth.uid();

-- Si no tengo clinic_id, asignarlo (como admin)
UPDATE user_profiles
SET clinic_id = '<id_de_mi_clinica>'
WHERE id = auth.uid();
```

### Problema: Datos de una clínica aparecen en otra

**Causa:** Datos fueron creados antes de implementar RLS o con `clinic_id` incorrecto

**Solución:**
```sql
-- Identificar datos con clinic_id incorrecto
SELECT
  p.id,
  p.clinic_id,
  c.name
FROM patients p
LEFT JOIN clinics c ON c.id = p.clinic_id
WHERE p.clinic_id != '<clinic_id_correcto>';

-- Corregir (solo si estás seguro)
UPDATE patients
SET clinic_id = '<clinic_id_correcto>'
WHERE clinic_id = '<clinic_id_incorrecto>';
```

## Mejores Prácticas

### 1. Siempre Especificar clinic_id al Crear Datos

```typescript
// ❌ MAL - Sin clinic_id
await supabase.from('patients').insert({
  first_name: 'Juan',
  last_name: 'Pérez'
});

// ✅ BIEN - Con clinic_id
const { data: user } = await supabase.auth.getUser();
const { clinic_id } = await supabase
  .from('user_profiles')
  .select('clinic_id')
  .eq('id', user.id)
  .single();

await supabase.from('patients').insert({
  first_name: 'Juan',
  last_name: 'Pérez',
  clinic_id: clinic_id
});
```

### 2. Usar Funciones Helper en el Frontend

```typescript
// utils/clinic.ts
export async function getCurrentClinicId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('clinic_id')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data.clinic_id;
}
```

### 3. Validar en Triggers (Backend)

Las migraciones incluyen triggers que validan:
- Appointments pertenecen a la misma clínica que el paciente
- Payments pertenecen a la misma clínica que el paciente

Esto previene inconsistencias a nivel de base de datos.

## Monitoreo

### Dashboard de Métricas por Clínica

```sql
-- Crear vista para monitoreo
CREATE OR REPLACE VIEW public.clinic_metrics AS
SELECT
  c.id,
  c.name,
  c.slug,
  COUNT(DISTINCT p.id) as total_patients,
  COUNT(DISTINCT a.id) as total_appointments,
  COUNT(DISTINCT up.id) as total_users,
  COALESCE(SUM(pay.amount), 0) as total_revenue
FROM clinics c
LEFT JOIN patients p ON p.clinic_id = c.id
LEFT JOIN appointments a ON a.clinic_id = c.id
LEFT JOIN user_profiles up ON up.clinic_id = c.id
LEFT JOIN payments pay ON pay.clinic_id = c.id
GROUP BY c.id, c.name, c.slug;

-- Usar la vista
SELECT * FROM clinic_metrics ORDER BY total_patients DESC;
```

## Soporte Multi-Clínica para Super Admins

Si necesitas que algunos usuarios (super admins) vean datos de todas las clínicas:

```sql
-- Modificar políticas para permitir super_admin
CREATE POLICY "Super admins can view all patients"
ON public.patients FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'super_admin'
  )
  OR
  clinic_id IN (
    SELECT clinic_id FROM user_profiles WHERE id = auth.uid()
  )
);
```

**Nota:** Usa esto con cuidado y solo para roles administrativos de la plataforma.

## Referencias

- [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Multi-Tenancy Patterns](https://docs.microsoft.com/en-us/azure/architecture/patterns/multi-tenancy)
