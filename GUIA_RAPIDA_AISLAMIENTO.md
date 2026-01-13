# Guía Rápida: Solucionar Aislamiento de Datos

## El Problema

Tu clínica de prueba (`admin@demo.com`) está mostrando datos de otra clínica. Esto se debe a que:
- Row Level Security (RLS) no está completamente configurado
- Hay datos sin `clinic_id` asignado (datos huérfanos)

## La Solución (3 Pasos Simples)

### ✅ Paso 1: Diagnóstico (1 minuto)

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Copia y pega el contenido de: **`supabase/quick_fix.sql`**
3. Haz clic en **Run**

**¿Qué buscar?**
- Cuántas clínicas hay
- Si hay pacientes/citas/usuarios sin `clinic_id`
- Si RLS está habilitado

### ⚠️ Paso 2: Corregir Datos Huérfanos (2 minutos)

**Solo si el Paso 1 mostró datos sin `clinic_id`:**

1. Copia y pega el contenido de: **`supabase/migrations/20260113_fix_orphan_data.sql`**
2. Lee los resultados - te mostrará qué datos están huérfanos

**Opciones:**

#### A) Si tienes UNA sola clínica:
- Descomenta la sección marcada como "OPCIÓN A" en el script
- Ejecuta el script
- Todos los datos se asignarán a esa clínica automáticamente

#### B) Si tienes MÚLTIPLES clínicas:
- Usa los ejemplos de UPDATE en "OPCIÓN B" del script
- Asigna manualmente cada dato a su clínica correcta
- Ejecuta los UPDATEs uno por uno

3. Verifica que ya no haya huérfanos (ejecuta la sección VERIFICACIÓN FINAL del script)

### 🚀 Paso 3: Aplicar Aislamiento (2 minutos)

**Solo después de que NO haya datos huérfanos:**

1. Copia y pega el contenido de: **`supabase/migrations/20260113_enforce_clinic_data_isolation.sql`**
2. Haz clic en **Run**

**¿Qué hace?**
- ✅ Activa RLS en todas las tablas
- ✅ Crea políticas para que cada clínica solo vea sus datos
- ✅ Hace `clinic_id` obligatorio (NOT NULL)
- ✅ Agrega validaciones automáticas

## Verificación Final

Ejecuta esto en SQL Editor:

```sql
-- Ver tu clínica y datos
SELECT
  'Mi clínica' as info,
  c.name as clinic_name,
  COUNT(DISTINCT p.id) as mis_pacientes,
  COUNT(DISTINCT a.id) as mis_citas
FROM user_profiles up
JOIN clinics c ON c.id = up.clinic_id
LEFT JOIN patients p ON p.clinic_id = up.clinic_id
LEFT JOIN appointments a ON a.clinic_id = up.clinic_id
WHERE up.id = auth.uid()
GROUP BY c.name;
```

**Resultado esperado:**
- Debes ver solo TU clínica y TUS datos
- No debes ver datos de otras clínicas

## Si Algo Sale Mal

### Error: "column clinic_id contains null values"

**Causa:** Aún hay datos sin `clinic_id`

**Solución:**
1. Vuelve al Paso 2
2. Ejecuta `20260113_fix_orphan_data.sql` para ver qué falta
3. Asigna los `clinic_id` faltantes
4. Intenta el Paso 3 de nuevo

### Error: "Patient does not exist or has no clinic assigned"

**Causa:** Intentas crear una cita para un paciente sin clínica

**Solución:**
```sql
-- Encuentra el paciente
SELECT id, first_name, last_name, clinic_id
FROM patients
WHERE id = '<patient_id>';

-- Si clinic_id es NULL, asígnalo
UPDATE patients
SET clinic_id = '<tu_clinic_id>'
WHERE id = '<patient_id>';
```

### Aún veo datos de otras clínicas

**Posibles causas:**
1. RLS no se aplicó correctamente
2. Tu usuario no tiene `clinic_id` asignado

**Diagnóstico:**
```sql
-- Verificar mi usuario
SELECT
  id,
  clinic_id,
  role
FROM user_profiles
WHERE id = auth.uid();

-- Verificar RLS
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'patients';
```

**Solución:**
- Si `clinic_id` es NULL: Asígnalo manualmente
- Si `rowsecurity` es false: Ejecuta el Paso 3 de nuevo

## Componente de Depuración (Opcional)

Para monitorear el aislamiento visualmente en tu app:

```tsx
// En tu dashboard principal
import { ClinicDebugInfo } from '@/components/debug/ClinicDebugInfo';

export default function Dashboard() {
  return (
    <div>
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
- Si RLS está funcionando
- Cuántos datos ves

## Archivos Creados

Tienes estos archivos disponibles:

1. **`supabase/quick_fix.sql`** - Diagnóstico rápido
2. **`supabase/migrations/20260113_fix_orphan_data.sql`** - Corregir huérfanos
3. **`supabase/migrations/20260113_enforce_clinic_data_isolation.sql`** - Migración principal
4. **`supabase/CLINIC_DATA_ISOLATION.md`** - Documentación completa
5. **`SOLUCION_AISLAMIENTO_CLINICAS.md`** - Guía detallada
6. **`src/lib/utils/clinic.ts`** - Utilidades para obtener clinic_id
7. **`src/hooks/useClinic.ts`** - Hook de React
8. **`src/components/debug/ClinicDebugInfo.tsx`** - Componente de depuración

## Resumen de 30 Segundos

```bash
# 1. Diagnóstico
→ Ejecuta: quick_fix.sql

# 2. ¿Hay datos sin clinic_id?
   SÍ → Ejecuta: 20260113_fix_orphan_data.sql
   NO → Salta al paso 3

# 3. Aplicar aislamiento
→ Ejecuta: 20260113_enforce_clinic_data_isolation.sql

# 4. ✅ Listo!
→ Cada clínica solo ve sus datos
```

## Soporte

- **Documentación completa:** [supabase/CLINIC_DATA_ISOLATION.md](supabase/CLINIC_DATA_ISOLATION.md)
- **Guía detallada:** [SOLUCION_AISLAMIENTO_CLINICAS.md](SOLUCION_AISLAMIENTO_CLINICAS.md)
- **Diagnóstico:** `supabase/migrations/20260113_diagnostic_check_clinic_data.sql`

---

**Última actualización:** 2026-01-13
**Autor:** Claude Code
