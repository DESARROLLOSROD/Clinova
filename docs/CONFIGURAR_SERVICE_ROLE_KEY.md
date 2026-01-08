# Configurar Service Role Key para Gestión de Usuarios

Para que funcione la creación automática de usuarios para fisioterapeutas, necesitas añadir la **Service Role Key** de Supabase a las variables de entorno.

## ⚠️ IMPORTANTE - Seguridad

La Service Role Key tiene **acceso completo** a tu base de datos y **NO debe exponerse públicamente**. Solo úsala en el servidor (archivos API routes).

## 📝 Pasos para Configurar

### 1. Obtener la Service Role Key de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** (Configuración) en el menú lateral izquierdo
4. Haz clic en **API**
5. En la sección **Project API keys**, busca:
   - `service_role` key (NO la `anon` key)
6. Haz clic en el ícono del ojo para revelar la clave
7. Copia la clave completa

### 2. Añadir la Variable de Entorno

Abre tu archivo `.env.local` y añade la siguiente línea:

```env
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

Tu archivo `.env.local` debería verse así:

```env
NEXT_PUBLIC_SUPABASE_URL=https://pstimobmmlmdouiwwkfx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ← AÑADE ESTA LÍNEA
```

### 3. Reiniciar el Servidor de Desarrollo

```bash
# Detén el servidor (Ctrl+C)
# Luego reinícialo:
npm run dev
```

### 4. Verificar que Funciona

1. Ve a cualquier fisioterapeuta en el dashboard
2. Haz clic en "Crear Acceso y Enviar Invitación"
3. Deberías ver un mensaje de éxito

## 🚀 Para Producción (Railway)

También necesitas añadir la variable en Railway:

1. Ve a tu proyecto en [Railway](https://railway.app)
2. Ve a la pestaña **Variables**
3. Añade una nueva variable:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: Tu service role key
4. Haz clic en **Add** y el proyecto se redespl automáticamente

## ❓ Preguntas Frecuentes

### ¿Por qué necesito esta clave?

La creación de usuarios requiere privilegios de administrador que solo la Service Role Key proporciona. La clave `anon` (pública) no tiene estos permisos por seguridad.

### ¿Es seguro usar la Service Role Key?

Sí, siempre y cuando:
- ✅ Solo se use en **API routes** del servidor (archivos en `/api/`)
- ✅ NUNCA se exponga en el código del cliente
- ✅ NUNCA se incluya en el código que va al navegador
- ✅ Esté en `.env.local` (que está en `.gitignore`)

### ¿Qué pasa si no la configuro?

Verás el error: **"Server configuration error: Missing Supabase credentials"** cuando intentes crear acceso para un fisioterapeuta.

### ¿Dónde se usa esta clave?

Solo en dos archivos del servidor:
- `/api/therapists/create-user/route.ts` - Para crear usuarios
- (Potencialmente) otros endpoints admin que agregues en el futuro

## 🔐 Verificación de Seguridad

Para verificar que tu Service Role Key está segura:

1. ✅ Debe estar en `.env.local` (archivo local, no en Git)
2. ✅ `.env.local` debe estar en `.gitignore`
3. ✅ Solo se usa en archivos `/api/` (server-side)
4. ✅ NUNCA se pasa a componentes de React
5. ✅ NUNCA se usa en código que tiene `'use client'`

## 📚 Más Información

- [Documentación de Supabase - Service Role](https://supabase.com/docs/guides/api/api-keys)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
