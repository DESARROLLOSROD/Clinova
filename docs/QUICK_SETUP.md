# Configuración Rápida - Pasos Finales

## ✅ Lo que acabas de hacer

Has agregado el **botón de cerrar sesión** al Header. Ahora verás un botón "Salir" con un ícono de logout.

---

## 🎯 Siguiente Paso: Asignar Rol de Admin

Veo que estás autenticado como `admin@clinova.com`, pero necesitamos **asignar el rol de admin** en Supabase para que veas el menú "Usuarios".

### Opción 1: Usando SQL (Más rápido) ⚡

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard) → Tu proyecto
2. Click en **SQL Editor** → **New query**
3. Copia y pega este código:

```sql
-- Asignar rol de admin al usuario actual
SELECT public.make_user_admin_by_email(
    'admin@clinova.com',  -- Tu email
    'Admin',              -- Tu nombre
    'Principal'           -- Tu apellido
);
```

4. Click **Run** (o presiona Ctrl/Cmd + Enter)
5. Deberías ver:
   ```json
   {
     "success": true,
     "user_id": "...",
     "email": "admin@clinova.com",
     "role": "admin"
   }
   ```

6. **Recarga la página** de la aplicación (F5)
7. Ahora deberías ver **"Usuarios"** en el sidebar

### Opción 2: Verificar si ya tienes el rol

Ejecuta esta query para verificar:

```sql
SELECT
    u.email,
    r.name as rol,
    r.display_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.roles r ON r.id = ur.role_id
WHERE u.email = 'admin@clinova.com';
```

Si **rol** está vacío (NULL), necesitas ejecutar la Opción 1.

---

## 📱 Cómo Crear Usuarios

Una vez que veas "Usuarios" en el sidebar:

### 1. Acceder a la página de Usuarios

- Click en **"Usuarios"** en el sidebar (ícono de escudo)
- O ve directamente a: `http://localhost:3000/dashboard/users`

### 2. Crear un nuevo usuario

1. Click en **"+ Crear Usuario"**
2. Completa el formulario:
   - **Tipo de Usuario**: Selecciona el rol (Admin, Fisioterapeuta, Recepcionista, Paciente)
   - **Información Básica**:
     - Nombre
     - Apellido
     - Email
     - Teléfono (opcional)

   **Si es Fisioterapeuta**, también verás:
   - Especialización
   - Número de Licencia
   - Estado (Activo/Inactivo/De Baja)

   **Si es Paciente**, también verás:
   - Fecha de Nacimiento
   - Dirección
   - Historia Médica
     - Contacto de Emergencia
   - Fisioterapeuta Principal

3. **Enviar invitación**: Deja marcada la casilla para enviar un email de invitación
4. Click **"Crear Usuario"**

### 3. El usuario recibirá:

- Un email con un link para configurar su contraseña
- Al hacer click, será dirigido a `/auth/setup-password`
- Configurará su contraseña y podrá iniciar sesión

---

## 🧪 Probar el Sistema de Roles

### Crear un Fisioterapeuta de prueba:

1. Ve a **Usuarios** → **+ Crear Usuario**
2. Completa:
   - Rol: **Fisioterapeuta**
   - Nombre: Prueba
   - Apellido: Therapist
   - Email: `therapist@test.com`
   - Especialización: Fisioterapia Deportiva
3. Click **Crear Usuario**

### Probar con ese usuario:

1. Click en **Salir** (botón que acabas de agregar)
2. Ve a Supabase Dashboard → Authentication → Users
3. Busca `therapist@test.com`
4. Click en los 3 puntos → **Send password recovery**
5. Copia el link del email simulado
6. Abre el link en tu navegador
7. Configura una contraseña
8. Inicia sesión con ese usuario
9. **Verifica que**:
   - El header muestre "Fisioterapeuta"
   - El sidebar NO muestre "Usuarios"
   - El sidebar NO muestre "Fisioterapeutas"
   - El sidebar solo muestre items permitidos para therapist

---

## ❌ Troubleshooting

### No veo "Usuarios" en el sidebar

**Causa**: No tienes rol de admin asignado.

**Solución**: Ejecuta la query de la Opción 1 arriba.

### El botón "Salir" no funciona

1. Abre la consola del navegador (F12)
2. Busca errores en rojo
3. Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén en `.env.local`

### No puedo crear usuarios

**Causa**: El script de setup no se ejecutó en Supabase.

**Solución**:
1. Ve a [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
2. Ejecuta `setup_complete.sql`

### Error "Missing Supabase credentials"

Verifica que `.env.local` tenga:
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

---

## ✅ Checklist

- [ ] Ejecuté `setup_complete.sql` en Supabase
- [ ] Asigné rol de admin a mi usuario
- [ ] Recargué la página
- [ ] Veo "Usuarios" en el sidebar
- [ ] Veo el botón "Salir" en el header
- [ ] Puedo crear usuarios
- [ ] Probé con un usuario de otro rol

---

## 📚 Siguiente Paso

Una vez que todo funcione, puedes:

1. **Crear usuarios reales** para tu equipo
2. **Configurar emails** en Supabase para que las invitaciones funcionen
3. **Personalizar permisos** si es necesario
4. **Desplegar a producción**

Ver documentación completa:
- [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
- [ROLES_AND_PERMISSIONS.md](./ROLES_AND_PERMISSIONS.md)
- [USER_CREATION_GUIDE.md](./USER_CREATION_GUIDE.md)
