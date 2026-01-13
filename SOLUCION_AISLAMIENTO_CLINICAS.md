# Solución: Aislamiento de Datos entre Clínicas

## Problema Identificado

Tu clínica de prueba (`admin@demo.com`) está mostrando datos de otra clínica. Esto puede suceder por:

1. **RLS no está habilitado o configurado correctamente** en algunas tablas
2. **Datos creados antes de implementar RLS** tienen `clinic_id` incorrecto o NULL
3. **El usuario no tiene `clinic_id` asignado** correctamente

## Solución Rápida (5 minutos)

### Paso 1: Verificar el Estado Actual

1. Abre Supabase Dashboard
2. Ve a **SQL Editor**
3. Ejecuta el archivo: `supabase/quick_fix.sql`
4. Revisa los resultados para identificar el problema

**Busca:**
- ✅ ¿Cuántas clínicas existen?
- ✅ ¿Tu usuario tiene `clinic_id` asignado?
- ✅ ¿Hay datos huérfanos (sin `clinic_id`)?
- ✅ ¿RLS está habilitado en todas las tablas?

### Paso 2: Aplicar la Migración de Aislamiento

#### Opción A: Desde Supabase Dashboard (Recomendado)

1. Ve a **SQL Editor** en Supabase
2. Abre el archivo: `supabase/migrations/20260113_enforce_clinic_data_isolation.sql`
3. Copia todo el contenido
4. Pégalo en el SQL Editor
5. Haz clic en **Run**

#### Opción B: Desde la Terminal

```bash
# Si tienes Supabase CLI instalado
cd c:\Users\ADMIN_SISTEMAS\OneDrive - Desarrollos ROD\Documentos\Desarrollos\Clinova
supabase db push

# O ejecutar la migración específica
supabase db execute < supabase/migrations/20260113_enforce_clinic_data_isolation.sql
```

### Paso 3: Verificar que Funciona

#### 3.1. Ejecutar Diagnóstico Final

```sql
-- En SQL Editor de Supabase
SELECT '=== TU CLÍNICA ===' as info;
SELECT
  up.id,
  u.email,
  up.role,
  c.name as clinic_name,
  c.id as clinic_id
FROM user_profiles up
JOIN auth.users u ON u.id = up.id
JOIN clinics c ON c.id = up.clinic_id
WHERE u.email = 'admin@demo.com';

SELECT '=== DATOS QUE VES ===' as info;
SELECT
  'Pacientes' as tipo,
  COUNT(*) as cantidad,
  COUNT(DISTINCT clinic_id) as clinicas_diferentes
FROM patients
UNION ALL
SELECT
  'Citas',
  COUNT(*),
  COUNT(DISTINCT clinic_id)
FROM appointments;
```

**Resultado esperado:**
- `clinicas_diferentes` debe ser **1** (solo tu clínica)
- Si ves más de 1, RLS no está funcionando

#### 3.2. Agregar Componente de Depuración (Opcional)

En tu panel principal, agrega el componente de depuración:

```tsx
// En tu página principal (ej: src/app/dashboard/page.tsx)
import { ClinicDebugInfo } from '@/components/debug/ClinicDebugInfo';

export default function Dashboard() {
  return (
    <div>
      {/* Solo mostrar en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ClinicDebugInfo />
      )}

      {/* Resto de tu dashboard */}
    </div>
  );
}
```

Esto mostrará un panel con:
- Tu clinic_id actual
- Cuántas clínicas hay en total
- Si RLS está funcionando correctamente

## Solución Manual (Si hay Problemas)

### Problema 1: Usuario sin clinic_id

```sql
-- Verificar tu usuario
SELECT id, clinic_id, role FROM user_profiles
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@demo.com');

-- Si clinic_id es NULL, asignarlo
UPDATE user_profiles
SET clinic_id = (SELECT id FROM clinics WHERE slug = 'tu-slug-aqui')
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@demo.com');
```

### Problema 2: Datos con clinic_id Incorrecto

```sql
-- 1. Identifica tu clinic_id correcto
SELECT id, name, slug FROM clinics WHERE name LIKE '%tu nombre%';

-- 2. Actualiza pacientes (reemplaza <tu_clinic_id>)
UPDATE patients
SET clinic_id = '<tu_clinic_id>'
WHERE clinic_id IS NULL OR clinic_id != '<tu_clinic_id>';

-- 3. Actualiza citas
UPDATE appointments
SET clinic_id = '<tu_clinic_id>'
WHERE clinic_id IS NULL OR clinic_id != '<tu_clinic_id>';

-- 4. Actualiza pagos
UPDATE payments
SET clinic_id = '<tu_clinic_id>'
WHERE clinic_id IS NULL OR clinic_id != '<tu_clinic_id>';
```

### Problema 3: RLS No Habilitado

```sql
-- Habilitar RLS en todas las tablas críticas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verificar
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'appointments', 'payments');
```

## Prevención Futura

### 1. Siempre Obtener clinic_id del Usuario Actual

```typescript
// lib/utils/clinic.ts
import { createClient } from '@/lib/supabase/client';

export async function getCurrentClinicId(): Promise<string> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('clinic_id')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  if (!data?.clinic_id) throw new Error('Usuario sin clínica asignada');

  return data.clinic_id;
}
```

### 2. Usar clinic_id al Crear Datos

```typescript
// ❌ INCORRECTO
await supabase.from('patients').insert({
  first_name: 'Juan',
  last_name: 'Pérez'
});

// ✅ CORRECTO
const clinic_id = await getCurrentClinicId();
await supabase.from('patients').insert({
  first_name: 'Juan',
  last_name: 'Pérez',
  clinic_id
});
```

### 3. Crear Hook Personalizado

```typescript
// hooks/useClinic.ts
import { useEffect, useState } from 'react';
import { getCurrentClinicId } from '@/lib/utils/clinic';

export function useClinic() {
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentClinicId()
      .then(setClinicId)
      .finally(() => setLoading(false));
  }, []);

  return { clinicId, loading };
}

// Uso en componentes
function MyComponent() {
  const { clinicId, loading } = useClinic();

  if (loading) return <div>Cargando...</div>;

  // Usar clinicId en tus queries...
}
```

## Testing del Aislamiento

### Test Manual

1. Crea una segunda clínica de prueba:

```sql
INSERT INTO clinics (name, slug, email)
VALUES ('Clínica Test 2', 'test-2', 'test2@test.com');
```

2. Crea un paciente en la segunda clínica:

```sql
INSERT INTO patients (first_name, last_name, email, clinic_id)
VALUES ('Test', 'Patient', 'test@test.com', (SELECT id FROM clinics WHERE slug = 'test-2'));
```

3. Inicia sesión con `admin@demo.com` y verifica:
   - ✅ NO debes ver el paciente "Test Patient"
   - ✅ Solo ves pacientes de tu clínica

### Test Automatizado (Recomendado)

```typescript
// __tests__/rls-isolation.test.ts
import { createClient } from '@supabase/supabase-js';

describe('RLS Isolation', () => {
  it('should only see patients from own clinic', async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Login como admin de clínica 1
    await supabase.auth.signInWithPassword({
      email: 'admin@demo.com',
      password: 'password'
    });

    // Obtener pacientes
    const { data: patients } = await supabase
      .from('patients')
      .select('clinic_id');

    // Verificar que todos los pacientes son de la misma clínica
    const uniqueClinicIds = new Set(patients?.map(p => p.clinic_id));
    expect(uniqueClinicIds.size).toBe(1);
  });
});
```

## Archivos Creados

He creado los siguientes archivos para ayudarte:

1. **`supabase/quick_fix.sql`**
   - Script de diagnóstico rápido
   - Ejecutar primero para ver el estado actual

2. **`supabase/migrations/20260113_enforce_clinic_data_isolation.sql`**
   - Migración completa para garantizar aislamiento
   - Incluye políticas RLS, triggers y validaciones

3. **`supabase/migrations/20260113_diagnostic_check_clinic_data.sql`**
   - Diagnóstico detallado del estado de aislamiento

4. **`supabase/CLINIC_DATA_ISOLATION.md`**
   - Documentación completa sobre el aislamiento
   - Incluye mejores prácticas y solución de problemas

5. **`src/components/debug/ClinicDebugInfo.tsx`**
   - Componente React para depuración visual
   - Muestra información de clinic_id en tiempo real

## Resumen Ejecutivo

**Para resolver el problema ahora:**

1. ✅ Ejecuta `quick_fix.sql` en Supabase SQL Editor
2. ✅ Ejecuta la migración `20260113_enforce_clinic_data_isolation.sql`
3. ✅ Verifica con `diagnostic_check_clinic_data.sql`
4. ✅ Agrega `<ClinicDebugInfo />` a tu dashboard para monitorear

**Resultado esperado:**
- Cada clínica solo ve sus propios datos
- No hay datos mezclados entre clínicas
- RLS funciona automáticamente en todas las tablas

## Soporte

Si después de seguir estos pasos aún ves datos de otras clínicas:

1. Verifica los logs de Supabase
2. Revisa las políticas RLS: `SELECT * FROM pg_policies WHERE schemaname = 'public'`
3. Confirma que tu usuario tiene `clinic_id` asignado
4. Contacta con el equipo de desarrollo con los resultados del diagnóstico

---

**Última actualización:** 2026-01-13
