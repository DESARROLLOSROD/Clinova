# Guía: Dar Acceso al Sistema a Fisioterapeutas

Esta guía explica cómo dar acceso al sistema a los fisioterapeutas que das de alta en Clinova.

## 📋 Requisitos Previos

Antes de poder dar acceso a fisioterapeutas, necesitas:

1. ✅ Ejecutar el script de migración para añadir el campo `auth_user_id`:
   ```sql
   -- En el SQL Editor de Supabase:
   supabase_migration_add_auth_user_id.sql
   ```

2. ✅ Asegurarte de que el email SMTP esté configurado en Supabase (para envío de invitaciones)

## 🚀 Cómo Dar Acceso a un Fisioterapeuta

Hay dos formas de dar acceso a los fisioterapeutas:

### Opción 1: Desde la Página de Detalles (Recomendado)

1. **Ir a la lista de fisioterapeutas**
   - Dashboard → Fisioterapeutas

2. **Hacer clic en "Ver Detalles"** del fisioterapeuta al que quieres dar acceso

3. **Buscar la sección "Gestión de Acceso al Sistema"**
   - Verás el estado actual (con o sin acceso)

4. **Hacer clic en "Crear Acceso y Enviar Invitación"**
   - El sistema automáticamente:
     - ✅ Crea una cuenta de usuario en Supabase Auth
     - ✅ Vincula la cuenta con el registro del fisioterapeuta
     - ✅ Envía un email de invitación al fisioterapeuta

5. **El fisioterapeuta recibe el email**
   - Contiene un link para establecer su contraseña
   - Al hacer clic, puede crear su contraseña
   - Después puede iniciar sesión normalmente

### Opción 2: Manualmente en Supabase (Temporal)

Si no quieres esperar la configuración de email, puedes:

1. **Ir a Supabase Dashboard**
   - Authentication → Users → Add user

2. **Crear el usuario**
   - Email: El mismo email del fisioterapeuta en la tabla `therapists`
   - Password: Una contraseña temporal
   - **MUY IMPORTANTE:** Auto Confirm User = ☑ (activado)

3. **Copiar el User ID generado**

4. **Actualizar la tabla therapists**
   ```sql
   UPDATE therapists
   SET auth_user_id = 'EL_USER_ID_COPIADO'
   WHERE email = 'email@fisioterapeuta.com';
   ```

5. **Compartir las credenciales**
   - Envía el email y contraseña temporal al fisioterapeuta
   - Recuérdale que cambie su contraseña después de iniciar sesión

## 🔧 Funcionalidades Adicionales

### Reenviar Invitación

Si el fisioterapeuta no recibió el email o expiró:

1. Ve a la página de detalles del fisioterapeuta
2. En "Gestión de Acceso al Sistema"
3. Haz clic en **"Reenviar Invitación"**

### Resetear Contraseña

Si el fisioterapeuta olvidó su contraseña:

1. Ve a la página de detalles del fisioterapeuta
2. En "Gestión de Acceso al Sistema"
3. Haz clic en **"Resetear Contraseña"**
4. El fisioterapeuta recibirá un email para establecer una nueva contraseña

## 📧 Configuración de Emails (Importante)

Para que las invitaciones funcionen automáticamente, necesitas configurar el email SMTP en Supabase:

### En Supabase Dashboard:

1. **Project Settings** → **Auth** → **Email Templates**

2. **Configura SMTP** (opcional pero recomendado):
   - Enable Custom SMTP: ☑
   - Sender email: `noreply@tudominio.com`
   - Sender name: `Clinova`
   - Host: `smtp.gmail.com` (o tu proveedor)
   - Port: `587`
   - Usuario y contraseña de tu servidor SMTP

3. **Personaliza las plantillas** (opcional):
   - **Invite user**: Email que recibe el fisioterapeuta cuando creas su acceso
   - **Reset password**: Email para resetear contraseña

### Sin SMTP Configurado:

Si no configuras SMTP, Supabase usará su servicio de email por defecto, pero tiene límites:
- Solo para desarrollo
- Puede marcar como spam
- Límite de emails por día

## 🎯 Flujo Completo de Acceso

```
1. Admin crea fisioterapeuta en Clinova
   ↓
2. Admin da clic en "Crear Acceso y Enviar Invitación"
   ↓
3. Sistema crea usuario en Supabase Auth
   ↓
4. Sistema vincula auth_user_id en tabla therapists
   ↓
5. Sistema envía email de invitación
   ↓
6. Fisioterapeuta recibe email
   ↓
7. Fisioterapeuta hace clic en link del email
   ↓
8. Fisioterapeuta establece su contraseña
   ↓
9. Fisioterapeuta puede iniciar sesión en Clinova
   ↓
10. Fisioterapeuta ve sus citas y notificaciones
```

## 🔒 Seguridad y Mejores Prácticas

1. **Nunca compartas contraseñas** por canales inseguros
2. **Usa la función "Crear Acceso"** en lugar de crear usuarios manualmente
3. **Verifica el email** antes de enviar invitaciones
4. **Revoca acceso** cambiando el estado del fisioterapeuta a "inactive"

## ❓ Preguntas Frecuentes

### ¿Qué pasa si el email ya tiene una cuenta?

El sistema detectará que ya existe un usuario con ese email y mostrará un error. Deberás:
- Usar un email diferente para el fisioterapeuta, O
- Eliminar la cuenta existente en Supabase primero

### ¿El fisioterapeuta puede cambiar su email?

Actualmente no directamente. Como admin, puedes:
1. Actualizar el email en la tabla `therapists`
2. Actualizar el email en Auth → Users de Supabase
3. El sistema sincronizará automáticamente

### ¿Cómo sé si un fisioterapeuta ya tiene acceso?

En la lista de fisioterapeutas o en la página de detalles, verás:
- ✅ **Icono verde con check**: Tiene acceso
- ❌ **Icono gris con X**: Sin acceso

### ¿Puedo revocar el acceso?

Sí, hay dos opciones:

**Opción 1: Cambiar estado** (recomendado)
```sql
UPDATE therapists
SET status = 'inactive'
WHERE id = 'fisioterapeuta_id';
```

**Opción 2: Eliminar usuario de Auth**
- En Supabase Dashboard → Authentication → Users
- Busca el usuario y elimínalo
- Esto no elimina el registro del fisioterapeuta, solo su acceso

## 🛠️ Troubleshooting

### No se envía el email de invitación

**Solución:**
1. Verifica que SMTP esté configurado en Supabase
2. Revisa los logs en Supabase Dashboard → Logs
3. Verifica que el email del fisioterapeuta sea válido
4. Como alternativa temporal, usa la Opción 2 (manual)

### El link de invitación expiró

**Solución:**
- Usa el botón "Reenviar Invitación"
- Los links de invitación expiran después de 24 horas

### El fisioterapeuta no puede iniciar sesión

**Posibles causas:**
1. Email no confirmado (si creaste manualmente, marca "Auto Confirm")
2. Contraseña incorrecta (usa "Resetear Contraseña")
3. Usuario deshabilitado en Supabase
4. Status del fisioterapeuta es 'inactive'

## 📞 Soporte

Para más información, consulta:
- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [README principal](./README.md)
- [NOTIFICATIONS_SETUP.md](./NOTIFICATIONS_SETUP.md)
