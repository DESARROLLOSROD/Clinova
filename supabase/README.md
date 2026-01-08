# Supabase - Configuración de Base de Datos

Esta carpeta contiene todos los archivos SQL necesarios para configurar la base de datos de Clinova en Supabase.

## Archivos Principales

### 00_schema_completo.sql
**Archivo maestro** que contiene todo el esquema de la base de datos de Clinova:
- Todas las tablas necesarias (clinics, user_profiles, patients, appointments, sessions, etc.)
- Funciones auxiliares (get_user_clinic_id, current_user_role, is_admin)
- Row Level Security (RLS) habilitado en todas las tablas
- Políticas de seguridad configuradas
- Índices para optimización de consultas

**Ejecutar primero este archivo** en Supabase Dashboard → SQL Editor

### 01_create_admin.sql
Script para crear el primer usuario administrador de la clínica.

**Pasos:**
1. Crear el usuario en Supabase Dashboard → Authentication → Users → "Invite user"
2. Editar este archivo y cambiar el email en la línea 21
3. Ejecutar en Supabase Dashboard → SQL Editor

## Carpeta migrations/
Contiene las migraciones incrementales del proyecto. Estas son aplicadas automáticamente por el sistema cuando se ejecuta:
```bash
./run_migrations.sh
```

Las migraciones están organizadas cronológicamente y contienen:
- Creación de tablas adicionales
- Modificaciones de esquema
- Correcciones de políticas RLS
- Seeders de datos iniciales

## Orden de Ejecución

Para una instalación limpia de Clinova:

1. **00_schema_completo.sql** - Crear todo el esquema base
2. **01_create_admin.sql** - Crear tu primer usuario administrador
3. **(Opcional)** Ejecutar migraciones individuales de la carpeta `migrations/` si necesitas características adicionales

## Estructura de Tablas

### Tablas Principales
- **clinics** - Clínicas registradas en la plataforma
- **user_profiles** - Perfiles de usuario con rol y clínica
- **therapists** - Información de fisioterapeutas
- **patients** - Información de pacientes
- **appointments** - Citas programadas
- **sessions** - Sesiones de fisioterapia (formato SOAP)
- **payments** - Pagos de pacientes

### Módulos Adicionales
- **treatment_templates** - Plantillas de tratamiento reutilizables
- **exercise_library** - Biblioteca de ejercicios
- **patient_medical_history** - Historial médico de pacientes
- **initial_assessments** - Evaluaciones iniciales

## Seguridad (RLS)

Todas las tablas tienen Row Level Security (RLS) habilitado. Las políticas garantizan que:
- Los usuarios solo pueden ver datos de su propia clínica
- Los roles (admin, therapist, receptionist, patient) tienen permisos específicos
- Los datos sensibles están protegidos

## Soporte

Si encuentras problemas con la configuración de la base de datos, revisa:
1. Los logs de Supabase para errores específicos
2. La documentación en la carpeta `docs/`
3. El archivo README.md principal del proyecto
