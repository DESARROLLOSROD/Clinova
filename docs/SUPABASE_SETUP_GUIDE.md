# Guía de Implementación en Supabase - Clinova

## 📋 Resumen

Esta guía te llevará paso a paso para implementar el sistema completo de roles y permisos en Supabase.

**Tiempo estimado**: 10-15 minutos
**Nivel**: Intermedio

---

## 🎯 Pre-requisitos

- ✅ Proyecto de Supabase creado
- ✅ Acceso al Dashboard de Supabase
- ✅ Variables de entorno configuradas en `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=tu-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
  SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
  ```

---

## 📝 Paso 1: Ejecutar el Setup Completo

### 1.1 Abrir SQL Editor

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, click en **SQL Editor**
3. Click en **New query**

### 1.2 Ejecutar Script Principal

1. Abre el archivo: [`supabase/setup_complete.sql`](../supabase/setup_complete.sql)
2. **Copia TODO el contenido** del archivo
3. **Pega** en el editor SQL de Supabase
4. Click en **Run** (o presiona `Ctrl+Enter` / `Cmd+Enter`)

### 1.3 Verificar Resultado

Deberías ver en la parte inferior:

```
✅ Setup completado exitosamente!
📊 Roles creados: 4
📊 Permisos creados: 58
📊 Permisos asignados a Admin: 58

🎯 Siguiente paso: Crear tu primer usuario administrador
   Ver: create_admin_user.sql
```

**✅ Si ves este mensaje, ¡perfecto! Continúa al Paso 2.**

**❌ Si hay errores:**
- Lee el mensaje de error
- Verifica que no hayas ejecutado el script anteriormente
- Si hay conflictos, puedes ejecutar las migraciones individuales

---

## 👤 Paso 2: Crear Primer Usuario Administrador

### Opción A: Crear usuario nuevo (Recomendado)

#### 2.1 Crear usuario en Authentication

1. En Supabase Dashboard, ve a **Authentication** → **Users**
2. Click en **Add user** → **Create new user**
3. Completa:
   - **Email**: `admin@tuempresa.com` (tu email real)
   - **Password**: Genera una contraseña segura
   - **Auto Confirm User**: ✅ Activar (para no esperar confirmación de email)
4. Click **Create user**

#### 2.2 Asignar rol de Admin

1. Ve a **SQL Editor** → **New query**
2. Abre el archivo: [`supabase/create_admin_user.sql`](../supabase/create_admin_user.sql)
3. Busca la línea 25:
   ```sql
   v_user_email TEXT := 'admin@clinova.com'; -- ⚠️ CAMBIAR ESTE EMAIL
   ```
4. **Reemplaza** `admin@clinova.com` con el email que usaste en el paso 2.1
5. Copia la sección **OPCIÓN 1** (líneas 12-50)
6. Pega en el SQL Editor y ejecuta (**Run**)

Deberías ver:
```
✅ Usuario admin creado exitosamente!
📧 Email: tu-email@example.com
🆔 User ID: uuid-del-usuario

🎯 Ahora puedes iniciar sesión con este usuario
```

### Opción B: Convertir usuario existente a admin

Si ya tienes un usuario creado:

1. En **SQL Editor**, ejecuta:
   ```sql
   SELECT public.make_user_admin_by_email(
       'tu-email@example.com',
       'Tu Nombre',
       'Tu Apellido'
   );
   ```

2. Verifica el resultado:
   ```json
   {
     "success": true,
     "user_id": "uuid...",
     "email": "tu-email@example.com",
     "role": "admin",
     "message": "Usuario convertido a administrador exitosamente"
   }
   ```

---

## ✅ Paso 3: Verificar la Instalación

### 3.1 Ejecutar Script de Verificación

1. Ve a **SQL Editor** → **New query**
2. Abre el archivo: [`supabase/verify_setup.sql`](../supabase/verify_setup.sql)
3. Copia TODO el contenido
4. Pega y ejecuta en SQL Editor

### 3.2 Revisar Resultados

El script ejecutará múltiples verificaciones. Revisa que:

- ✅ **4 roles** creados (admin, therapist, receptionist, patient)
- ✅ **58+ permisos** creados
- ✅ Permisos asignados correctamente a cada rol
- ✅ Funciones SQL creadas
- ✅ Políticas RLS activas
- ✅ Al menos **1 administrador** existe

En la parte final verás un resumen:

```
════════════════════════════════════════════════════════
         RESUMEN DEL SISTEMA DE ROLES
════════════════════════════════════════════════════════

📊 Estadísticas:
   • Roles definidos: 4
   • Permisos creados: 58
   • Usuarios totales: 1
   • Usuarios con rol asignado: 1
   • Administradores: 1

✅ Todos los roles están creados
✅ Todos los permisos están creados
✅ Hay al menos un administrador
```

---

## 🚀 Paso 4: Probar en la Aplicación

### 4.1 Iniciar la Aplicación

```bash
npm run dev
```

### 4.2 Iniciar Sesión

1. Ve a `http://localhost:3000/login`
2. Inicia sesión con el email y contraseña del admin
3. Deberías ser redirigido a `/dashboard`

### 4.3 Verificar el Sistema

1. **Header**: Verifica que muestre tu nombre y "Administrador"
2. **Sidebar**: Deberías ver TODOS los items, incluyendo:
   - Dashboard
   - Pacientes
   - Fisioterapeutas
   - Agenda
   - Sesiones
   - Plantillas
   - Ejercicios
   - Pagos
   - Reportes
   - **Usuarios** ← Solo visible para admins
   - Configuración

### 4.4 Crear un Usuario de Prueba

1. Click en **Usuarios** en el sidebar
2. Click en **+ Crear Usuario**
3. Completa el formulario:
   - Rol: **Fisioterapeuta**
   - Nombre: Prueba
   - Apellido: Therapist
   - Email: `therapist@test.com`
   - Especialización: Fisioterapia Deportiva
4. Click en **Crear Usuario**
5. Verifica que se creó correctamente

### 4.5 Probar con Otro Rol

1. Cierra sesión
2. Ve a **Supabase Dashboard** → **Authentication** → **Users**
3. Busca el usuario `therapist@test.com`
4. Click en los 3 puntos → **Send magic link**
5. Copia el link del email (o usa reset password)
6. Configura la contraseña
7. Inicia sesión con ese usuario
8. Verifica que:
   - El sidebar NO muestra "Usuarios" ni "Fisioterapeutas"
   - El header dice "Fisioterapeuta"

---

## 🔧 Troubleshooting

### Error: "type user_role already exists"

**Causa**: Ya ejecutaste el script anteriormente.

**Solución**: El script maneja esto automáticamente con `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object`. Si ves este mensaje pero el script continúa, está bien.

---

### Error: "relation roles already exists"

**Causa**: Las tablas ya existen.

**Solución**: El script usa `CREATE TABLE IF NOT EXISTS`, así que no debería fallar. Si falla, probablemente tengas datos corruptos. Opciones:

1. **Recomendado**: Continúa, el script no afectará datos existentes
2. Si necesitas empezar de cero, ejecuta el rollback (ver abajo)

---

### Error: "insert or update on table violates foreign key constraint"

**Causa**: Intentas asignar un rol a un usuario que no existe.

**Solución**:
1. Verifica que el usuario exista: `SELECT * FROM auth.users WHERE email = 'tu-email';`
2. Si no existe, créalo primero en Authentication
3. Vuelve a ejecutar el script de creación de admin

---

### No veo "Usuarios" en el sidebar

**Causas posibles**:
1. No eres administrador
2. El RoleProvider no está cargando

**Solución**:
```sql
-- Verificar tu rol
SELECT
    u.email,
    r.name as rol
FROM auth.users u
JOIN public.user_roles ur ON ur.user_id = u.id
JOIN public.roles r ON r.id = ur.role_id
WHERE u.email = 'tu-email@example.com';
```

Si no aparece rol:
```sql
-- Asignar admin
SELECT public.make_user_admin_by_email('tu-email@example.com');
```

---

### El sidebar muestra "Cargando..." indefinidamente

**Causa**: Error en el RoleProvider.

**Solución**:
1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que las variables de entorno estén correctas
4. Recarga la página (Ctrl+R)

---

## 🗑️ Rollback (Opcional)

Si necesitas deshacer todo y empezar de cero:

```sql
-- ⚠️ CUIDADO: Esto eliminará TODOS los datos de roles
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.role_permissions CASCADE;
DROP TABLE IF EXISTS public.permissions CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

DROP FUNCTION IF EXISTS public.get_user_role(UUID);
DROP FUNCTION IF EXISTS public.user_has_permission(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_user_permissions(UUID);
DROP FUNCTION IF EXISTS public.make_user_admin(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.make_user_admin_by_email(TEXT, TEXT, TEXT);

DROP TYPE IF EXISTS user_role CASCADE;

-- Luego vuelve a ejecutar setup_complete.sql
```

---

## 📚 Scripts de Referencia

| Script | Propósito |
|--------|-----------|
| [`setup_complete.sql`](../supabase/setup_complete.sql) | Setup completo del sistema |
| [`create_admin_user.sql`](../supabase/create_admin_user.sql) | Crear usuario administrador |
| [`verify_setup.sql`](../supabase/verify_setup.sql) | Verificar instalación |

---

## ✅ Checklist Final

Antes de ir a producción, verifica:

- [ ] Setup completo ejecutado exitosamente
- [ ] Al menos 1 admin creado y funcional
- [ ] Probado inicio de sesión con admin
- [ ] Sidebar muestra items correctos según rol
- [ ] Header muestra rol correcto
- [ ] Creación de usuarios funciona
- [ ] Políticas RLS funcionando (therapist solo ve sus pacientes)
- [ ] Variables de entorno en producción configuradas

---

## 🎉 ¡Listo!

Tu sistema de roles está completamente implementado. Ahora puedes:

1. **Crear usuarios** desde `/dashboard/users/create`
2. **Asignar roles** automáticamente
3. **Controlar acceso** según permisos
4. **Escalar el sistema** añadiendo más permisos si es necesario

---

## 📞 Soporte

Si tienes problemas:

1. Revisa la sección de **Troubleshooting** arriba
2. Ejecuta `verify_setup.sql` para diagnóstico
3. Revisa la documentación:
   - [ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md)
   - [USER_CREATION_GUIDE.md](./USER_CREATION_GUIDE.md)
   - [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Última actualización**: 2026-01-07
**Versión**: 1.0.0
