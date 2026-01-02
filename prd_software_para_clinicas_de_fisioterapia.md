# PRD – Software para Clínicas de Fisioterapia

## 1. Visión del producto
Desarrollar un **software web SaaS** para la gestión integral de clínicas de fisioterapia que permita administrar pacientes, citas, sesiones, tratamientos, personal e ingresos de forma segura, rápida y escalable.

El sistema estará diseñado inicialmente para **clínicas pequeñas y medianas**, con posibilidad de escalar a **multi-sucursal y multi-clínica**.

---

## 2. Objetivos

### Objetivos principales
- Centralizar la información clínica y administrativa
- Reducir errores manuales y uso de papel
- Mejorar la experiencia del paciente
- Optimizar la agenda de fisioterapeutas
- Generar reportes claros para toma de decisiones

### KPIs
- Tiempo promedio de registro de paciente
- Ocupación de agenda
- Retención de pacientes
- Ingresos por mes
- Sesiones por fisioterapeuta

---

## 3. Usuarios y roles

### 3.1 Administrador
- Configuración general
- Gestión de personal
- Reportes
- Pagos y suscripciones

### 3.2 Fisioterapeuta
- Ver agenda
- Registrar sesiones
- Consultar expedientes

### 3.3 Recepcionista
- Agendar citas
- Registrar pacientes
- Confirmar pagos

---

## 4. Alcance (Scope)

### Incluido (MVP)
- Autenticación
- Gestión de pacientes
- Agenda de citas
- Registro de sesiones
- Roles y permisos

### No incluido (fases futuras)
- App móvil
- Integración con aseguradoras
- Facturación fiscal automática

---

## 5. Funcionalidades

### 5.1 Autenticación y seguridad
- Login con email/password
- Roles basados en permisos
- Row Level Security

### 5.2 Gestión de pacientes
- Alta / edición / baja lógica
- Expediente clínico
- Historial de sesiones
- Adjuntos (PDF, imágenes)

### 5.3 Agenda y citas
- Calendario por terapeuta
- Estados de cita
- Reprogramación
- Vista diaria / semanal

### 5.4 Sesiones de fisioterapia
- Registro de notas SOAP
- Nivel de dolor
- Evolución
- Ejercicios realizados

### 5.5 Personal
- Fisioterapeutas
- Especialidades
- Horarios

### 5.6 Reportes básicos
- Pacientes activos
- Sesiones por periodo
- Ingresos estimados

---

## 6. Requisitos no funcionales

### Seguridad
- Encriptación
- Backups
- Control de acceso por rol

### Performance
- Respuesta < 300ms
- Soporte mínimo 500 usuarios concurrentes

### Disponibilidad
- 99.5% uptime

---

## 7. Arquitectura técnica

### Frontend
- React (Next.js)
- Tailwind CSS
- React Hook Form

### Backend
- Supabase Auth
- Supabase PostgreSQL
- Supabase Storage

---

## 8. Modelo de datos (alto nivel)

- clinics
- users
- patients
- therapists
- appointments
- sessions
- treatments
- payments

---

## 9. UX / UI

- Diseño limpio y clínico
- Responsive
- Accesible
- Dashboard con KPIs

---

## 10. Roadmap

### Fase 1 – MVP (4–6 semanas)
- Login
- Pacientes
- Agenda
- Sesiones

### Fase 2
- Pagos
- Reportes avanzados
- Notificaciones

### Fase 3
- App móvil
- IA clínica
- Multi-clínica

---

## 11. Riesgos
- Manejo de datos sensibles
- Adopción por personal no técnico
- Escalabilidad

---

## 12. Métricas de éxito
- Clínicas activas
- Usuarios activos mensuales
- Ingresos recurrentes

---

## 13. Monetización

- Plan básico mensual
- Plan profesional
- Plan multi-clínica

---

## 14. Futuro

- Integración con wearables
- IA para recomendaciones
- Tele-rehabilitación

