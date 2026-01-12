# Clinova – Sistema de Gestión para Clínicas de Fisioterapia

[![License](https://img.shields.io/badge/license-Private-blue)](LICENSE)

Clinova es una solución completa para la gestión de clínicas de fisioterapia, construida con **Next.js 15**, **Supabase** y **TypeScript**. Ofrece módulos robustos para pacientes, agenda, terapeutas, sesiones, pagos y más, con una interfaz moderna y responsiva.

---

## Tabla de Contenidos
- [Características Principales](#características-principales)
- [Instalación y Configuración](#instalación-y-configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Flujos de Trabajo](#flujos-de-trabajo)
- [Tecnologías](#tecnologías)
- [Scripts Disponibles](#scripts-disponibles)
- [Estado del Proyecto](#estado-del-proyecto)
- [Próximas Mejoras](#próximas-mejoras)
- [Licencia](#licencia)

---

## Características Principales

### Módulos Principales
- **Gestión de Pacientes**: registro, historial médico completo, cálculo de IMC, ejercicios prescritos y planes de tratamiento.
- **Agenda de Citas**: calendario interactivo, asignación de fisioterapeutas, estados de citas y filtros avanzados.
- **Gestión de Fisioterapeutas**: perfiles, horarios, notificaciones en tiempo real y estadísticas.
- **Sesiones Clínicas**: notas SOAP, registro de dolor, asociación automática a citas.
- **Plantillas de Tratamiento**: creación, asignación y seguimiento de planes.
- **Biblioteca de Ejercicios**: catálogo con videos, imágenes y dosis personalizadas.
- **Módulo de Pagos**: múltiples métodos, facturación PDF y estadísticas financieras.
- **Configuración del Sistema**: datos de la clínica, precios, políticas y notificaciones.
- **Reportes y Estadísticas**: KPIs, ingresos, asistencia y crecimiento de pacientes.

### Características Técnicas
- Autenticación con **Supabase Auth**.
- Base de datos **PostgreSQL** con **Row Level Security**.
- **Realtime** y **Triggers** para notificaciones automáticas.
- UI moderna con **Tailwind CSS**, **shadcn/ui** y **Lucide Icons**.
- Componentes reutilizables y arquitectura basada en **feature‑folders**.

---

## Instalación y Configuración

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Variables de entorno**
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-de-supabase
   ```

3. **Base de datos Supabase**
   - Ejecuta el script `supabase_schema_complete.sql` en el editor SQL de Supabase.
   - Habilita **Realtime** para la tabla `notifications` (Dashboard → Database → Replication).

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   Visita <http://localhost:3000>.

---

## Estructura del Proyecto
```
src/
├─ app/                # Rutas y páginas (App Router)
│  ├─ dashboard/       # Módulos principales (pacientes, agenda, etc.)
│  └─ login/           # Autenticación
├─ components/         # UI por dominio (agenda, patients, therapists, …)
├─ contexts/           # Contextos React globales
├─ lib/                # Helpers y configuraciones
├─ types/              # Definiciones TypeScript
├─ utils/              # Utilidades (Supabase client, etc.)
└─ ...
```

---

## Flujos de Trabajo
### Atención Básica
1. Crear paciente → Completar historial médico → Agendar cita → Registrar sesión SOAP → Registrar pago.

### Prescripción de Ejercicios
1. Crear ejercicio → Prescribir a paciente → Paciente visualiza en "mis‑ejercicios" → Registra adherencia.

### Planes de Tratamiento
1. Crear plantilla → Asignar a paciente → Personalizar fechas y notas → Seguimiento de progreso.

---

## Tecnologías
- **Frontend**: Next.js 15 (App Router), React, TypeScript.
- **Styling**: Tailwind CSS, shadcn/ui.
- **Backend**: Supabase (PostgreSQL, Auth, Realtime).
- **Calendario**: FullCalendar.
- **Iconos**: Lucide React.

---

## Scripts Disponibles
```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run start    # Ejecutar versión de producción
npm run lint     # Linter ESLint
```

---

## Estado del Proyecto
- ✅ Funcionalidades completadas: gestión de pacientes, terapeutas, agenda, sesiones, pagos, reportes y configuración.
- ⬜ Próximas mejoras: gráficas visuales, exportación de datos, dark mode, i18n, app móvil, recordatorios automáticos, roles y permisos.

---

## Licencia
Proyecto privado – Todos los derechos reservados.
