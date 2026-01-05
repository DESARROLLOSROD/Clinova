# PRD – Software para Clínicas de Fisioterapia
**Clinova** - Sistema de Gestión Integral para Clínicas de Fisioterapia

**Versión:** 2.0
**Fecha:** Enero 2026
**Estado del Proyecto:** MVP Completo + Features Avanzadas Implementadas
**Autor:** Equipo Desarrollos ROD

---

## Tabla de Contenidos
1. [Visión del Producto](#1-visión-del-producto)
2. [Objetivos](#2-objetivos)
3. [Usuarios y Roles](#3-usuarios-y-roles)
4. [Alcance](#4-alcance-scope)
5. [Funcionalidades](#5-funcionalidades)
6. [Requisitos No Funcionales](#6-requisitos-no-funcionales)
7. [Arquitectura Técnica](#7-arquitectura-técnica)
8. [Modelo de Datos](#8-modelo-de-datos-alto-nivel)
9. [UX / UI](#9-ux--ui)
10. [Roadmap](#10-roadmap)
11. [Riesgos](#11-riesgos)
12. [Métricas de Éxito](#12-métricas-de-éxito)
13. [Monetización](#13-monetización)
14. [APIs y Contratos](#14-apis-y-contratos)
15. [Estrategia de Testing](#15-estrategia-de-testing)
16. [Seguridad y Compliance](#16-seguridad-y-compliance)
17. [Deployment y DevOps](#17-deployment-y-devops)
18. [Futuro](#18-futuro)

---

## 1. Visión del producto

### Propuesta de Valor
**Clinova** es un **software web SaaS** diseñado para transformar la gestión de clínicas de fisioterapia, permitiendo a profesionales de la salud enfocarse en lo que mejor hacen: cuidar pacientes.

El sistema centraliza toda la operación clínica y administrativa en una plataforma moderna, intuitiva y basada en la nube.

### Problema que Resuelve
Las clínicas de fisioterapia actuales enfrentan:
- **Gestión fragmentada**: Expedientes en papel, agendas en Google Calendar, pagos en Excel
- **Pérdida de información**: Notas clínicas incompletas, historial médico disperso
- **Ineficiencia operativa**: Tiempo excesivo en tareas administrativas
- **Falta de insights**: Dificultad para medir desempeño y tomar decisiones basadas en datos
- **Experiencia del paciente mejorable**: Poca transparencia sobre tratamientos y ejercicios prescritos

### Solución
Una plataforma unificada que integra:
- ✅ **Expediente clínico electrónico** completo con historial médico, evaluaciones y notas SOAP
- ✅ **Gestión de agenda** inteligente con calendario visual y estados de citas
- ✅ **Biblioteca de ejercicios** con videos, imágenes y prescripciones personalizadas
- ✅ **Portal del paciente** para seguimiento de adherencia a ejercicios
- ✅ **Sistema de pagos** con generación automática de facturas PDF
- ✅ **Reportes y analytics** en tiempo real para toma de decisiones
- ✅ **Plantillas de tratamiento** reutilizables para agilizar la prescripción

### Mercado Objetivo
#### Segmento Primario (Fase 1-2)
- **Clínicas pequeñas**: 1-3 fisioterapeutas, 50-200 pacientes activos
- **Clínicas medianas**: 4-10 fisioterapeutas, 200-1000 pacientes activos

#### Segmento Secundario (Fase 3)
- **Clínicas multi-sucursal**: Más de 10 fisioterapeutas, múltiples ubicaciones
- **Centros de rehabilitación**: Equipos multidisciplinarios

### Diferenciadores Clave
1. **Especialización en fisioterapia**: No es un EMR genérico, sino diseñado específicamente para flujos de trabajo de fisioterapia
2. **Portal del paciente incluido**: Adherencia y engagement desde el MVP
3. **Prescripción de ejercicios avanzada**: Biblioteca completa con dosificación, videos y tracking
4. **Experiencia de usuario moderna**: Next.js 15, diseño responsive, performance optimizado
5. **Precio accesible**: Modelo SaaS sin costos iniciales de setup

---

## 2. Objetivos

### 2.1 Objetivos de Negocio

#### Corto Plazo (0-6 meses)
- Validar product-market fit con 10-15 clínicas piloto
- Alcanzar NPS (Net Promoter Score) > 50
- Reducir tiempo de onboarding de nuevas clínicas a < 2 horas
- Lograr 95% de satisfacción en usabilidad

#### Mediano Plazo (6-12 meses)
- Escalar a 100+ clínicas activas
- Generar $50K USD en MRR (Monthly Recurring Revenue)
- Lograr churn rate < 5% mensual
- Implementar programa de referidos con 30% de nuevas clínicas provenientes de referencias

#### Largo Plazo (12-24 meses)
- Convertirse en el software líder de gestión de clínicas de fisioterapia en LATAM
- Alcanzar 500+ clínicas activas
- Expandir a mercado norteamericano
- Levantar ronda de inversión semilla

### 2.2 Objetivos del Usuario

#### Para Fisioterapeutas
- **Reducir tiempo administrativo en 40%**: De 2 horas/día a 1.2 horas/día
- **Mejorar calidad de documentación clínica**: 100% de sesiones con notas SOAP completas
- **Incrementar adherencia del paciente**: De 60% a 80% en seguimiento de ejercicios
- **Facilitar continuidad de atención**: Acceso instantáneo a historial completo del paciente

#### Para Administradores/Dueños
- **Visibilidad financiera en tiempo real**: Dashboard con ingresos, pagos pendientes y proyecciones
- **Optimización de ocupación**: Incrementar utilización de agenda de 60% a 80%
- **Retención de pacientes**: Aumentar lifetime value del paciente en 25%
- **Toma de decisiones basada en datos**: Reportes automáticos semanales

#### Para Recepcionistas
- **Agilizar agendamiento**: Reducir tiempo de agendar cita de 5 min a 2 min
- **Eliminar doble bookings**: Sistema de validación automática
- **Simplificar cobranza**: Generación automática de facturas y recordatorios

#### Para Pacientes
- **Claridad en el tratamiento**: Acceso 24/7 a ejercicios prescritos con videos
- **Seguimiento de progreso**: Visualización de adherencia y evolución
- **Comunicación mejorada**: Menos confusión sobre qué ejercicios hacer y cómo

### 2.3 KPIs Medibles

#### KPIs de Producto
| Métrica | Baseline | Objetivo Q1 | Objetivo Q2 |
|---------|----------|-------------|-------------|
| Tiempo de registro de paciente | 10 min | 5 min | 3 min |
| Ocupación de agenda | 60% | 70% | 80% |
| Sesiones documentadas con SOAP | 70% | 90% | 100% |
| Ejercicios prescritos por paciente | 3 | 5 | 7 |
| Adherencia a ejercicios | 60% | 70% | 80% |

#### KPIs de Negocio
| Métrica | Baseline | Objetivo 6m | Objetivo 12m |
|---------|----------|-------------|--------------|
| Clínicas activas | 5 | 50 | 150 |
| Usuarios activos mensuales (MAU) | 20 | 200 | 600 |
| Monthly Recurring Revenue (MRR) | $500 | $10K | $35K |
| Churn mensual | - | < 5% | < 3% |
| Customer Acquisition Cost (CAC) | - | < $200 | < $150 |
| Lifetime Value (LTV) | - | $1200 | $2000 |
| LTV/CAC Ratio | - | 6:1 | 13:1 |

#### KPIs Técnicos
| Métrica | Target |
|---------|--------|
| Uptime | 99.5% |
| Response time (p95) | < 300ms |
| Time to First Byte (TTFB) | < 100ms |
| Lighthouse Performance Score | > 90 |
| Error rate | < 0.1% |
| Mean Time to Recovery (MTTR) | < 1 hora |

---

## 3. Usuarios y roles

### 3.1 User Personas Detalladas

#### Persona 1: Dr. Carlos Méndez - Fisioterapeuta y Dueño de Clínica
**Demografía:**
- Edad: 38 años
- Rol: Fisioterapeuta y propietario
- Clínica: 2 fisioterapeutas, 120 pacientes activos
- Ubicación: Ciudad de México

**Contexto:**
- Atiende 8-10 pacientes/día
- Gestiona aspectos administrativos en las tardes
- Tech-savvy moderado (usa WhatsApp, Google, redes sociales)

**Pain Points:**
- "Pierdo 2 horas al día buscando expedientes y llenando formatos"
- "No tengo visibilidad clara de mis ingresos mensuales"
- "Los pacientes olvidan hacer sus ejercicios en casa"
- "Tengo que explicar los mismos ejercicios una y otra vez"

**Objetivos:**
- Reducir carga administrativa
- Mejorar resultados clínicos
- Escalar su clínica sin contratar más personal administrativo
- Tener métricas para mejorar el negocio

**Escenarios de Uso:**
1. Revisar agenda del día en la mañana (8:00 AM)
2. Registrar notas SOAP después de cada sesión
3. Prescribir ejercicios personalizados con videos
4. Revisar dashboard financiero al final de la semana
5. Generar reporte mensual de desempeño

---

#### Persona 2: Laura Gómez - Recepcionista
**Demografía:**
- Edad: 26 años
- Rol: Recepcionista y asistente administrativa
- Experiencia: 2 años en clínicas de salud
- Tech comfort: Medio (usa Excel, WhatsApp Business)

**Pain Points:**
- "Pacientes llaman mientras estoy agendando a otro, se generan errores"
- "Tengo que buscar manualmente espacios disponibles en la agenda"
- "Los pacientes no recuerdan cuánto deben o qué pagos han hecho"
- "Manejo agenda en Excel, lista de espera en WhatsApp, y pagos en cuaderno"

**Objetivos:**
- Agendar citas rápido y sin errores
- Gestionar lista de espera eficientemente
- Tener claridad sobre pagos pendientes
- Evitar confrontaciones por cobros

**Escenarios de Uso:**
1. Agendar cita de paciente nuevo (nombre, teléfono, primera vez)
2. Reprogramar cita de paciente que cancela
3. Confirmar citas del día siguiente vía WhatsApp
4. Registrar pago de sesión y generar factura
5. Consultar adeudos pendientes

---

#### Persona 3: Ana Rodríguez - Paciente
**Demografía:**
- Edad: 45 años
- Condición: Dolor lumbar crónico
- Frecuencia: 2 sesiones/semana, 8 semanas de tratamiento
- Tech: Usuario promedio de smartphone

**Pain Points:**
- "No recuerdo qué ejercicios debo hacer en casa"
- "No sé si los estoy haciendo correctamente"
- "Olvido cuántas repeticiones me indicaron"
- "No veo mi progreso, me desmotivo"

**Objetivos:**
- Entender claramente su tratamiento
- Hacer ejercicios correctamente
- Ver que está mejorando
- No olvidar sus citas

**Escenarios de Uso:**
1. Revisar ejercicios prescritos en su teléfono
2. Ver video demostrativo de ejercicio
3. Marcar ejercicio como completado
4. Ver su progreso de adherencia
5. Recibir recordatorio de cita (futuro)

---

### 3.2 Roles y Permisos del Sistema

#### 3.2.1 Administrador (Owner/Manager)
**Permisos Completos:**
- ✅ Configuración de clínica (nombre, logo, horarios)
- ✅ Gestión de usuarios (crear, editar, desactivar fisioterapeutas y recepcionistas)
- ✅ Acceso a todos los módulos
- ✅ Reportes financieros y estadísticas completas
- ✅ Configuración de plantillas de tratamiento
- ✅ Gestión de biblioteca de ejercicios
- ✅ Configuración de métodos de pago y facturación
- ✅ Exportación de datos
- ✅ Auditoría de acciones del sistema

**Flujos Principales:**
1. Onboarding inicial de la clínica
2. Creación de cuentas para equipo
3. Configuración de biblioteca de ejercicios estándar
4. Revisión semanal de reportes
5. Gestión de suscripción y facturación

---

#### 3.2.2 Fisioterapeuta
**Permisos:**
- ✅ Ver y gestionar **su propia agenda**
- ✅ Crear y editar pacientes
- ✅ Acceso completo a expedientes clínicos
- ✅ Registrar sesiones (notas SOAP)
- ✅ Prescribir ejercicios
- ✅ Crear y asignar plantillas de tratamiento
- ✅ Ver reportes de sus propios pacientes
- ✅ Consultar pagos relacionados con sus sesiones
- ❌ No puede ver agenda de otros fisioterapeutas (por default)
- ❌ No puede eliminar pacientes
- ❌ No puede acceder a reportes financieros globales

**Flujos Principales:**
1. Revisar agenda del día
2. Preparar sesión consultando historial del paciente
3. Registrar notas SOAP post-sesión
4. Prescribir plan de ejercicios domiciliarios
5. Ajustar plantilla de tratamiento según evolución
6. Revisar adherencia del paciente a ejercicios

---

#### 3.2.3 Recepcionista
**Permisos:**
- ✅ Ver agenda de **todos** los fisioterapeutas
- ✅ Crear y agendar citas
- ✅ Editar y cancelar citas
- ✅ Registrar pacientes nuevos (datos básicos)
- ✅ Registrar pagos
- ✅ Generar facturas
- ✅ Ver lista de pagos pendientes
- ✅ Consultar información de contacto de pacientes
- ❌ No puede ver expediente clínico completo (solo datos demográficos)
- ❌ No puede editar notas SOAP
- ❌ No puede prescribir ejercicios
- ❌ No puede ver reportes financieros detallados

**Flujos Principales:**
1. Registrar paciente nuevo que llega a la clínica
2. Agendar primera cita
3. Confirmar citas del día siguiente
4. Recibir pago de sesión y emitir factura
5. Consultar disponibilidad para reprogramación
6. Gestionar lista de espera

---

#### 3.2.4 Paciente (Portal - Fase Actual)
**Permisos:**
- ✅ Ver **solo sus propios** ejercicios prescritos
- ✅ Reproducir videos demostrativos
- ✅ Marcar ejercicios como completados
- ✅ Ver su propio progreso de adherencia
- ❌ No puede ver su expediente clínico completo
- ❌ No puede agendar citas (futuro)
- ❌ No puede ver otras secciones del sistema

**Flujos Principales:**
1. Login con credenciales proporcionadas por la clínica
2. Ver lista de ejercicios prescritos
3. Reproducir video de ejercicio
4. Registrar completado de ejercicio
5. Revisar progreso semanal

---

### 3.3 Matriz de Permisos Detallada

| Funcionalidad | Admin | Fisio | Recepcionista | Paciente |
|---------------|-------|-------|---------------|----------|
| **Pacientes** |
| Crear paciente | ✅ | ✅ | ✅ (básico) | ❌ |
| Editar datos demográficos | ✅ | ✅ | ✅ | ❌ |
| Ver expediente clínico completo | ✅ | ✅ | ❌ | ❌ |
| Editar historial médico | ✅ | ✅ | ❌ | ❌ |
| Eliminar paciente | ✅ | ❌ | ❌ | ❌ |
| Desactivar paciente | ✅ | ✅ | ❌ | ❌ |
| **Agenda** |
| Ver agenda propia | ✅ | ✅ | N/A | ❌ |
| Ver agenda de todos | ✅ | ❌ | ✅ | ❌ |
| Crear cita | ✅ | ✅ | ✅ | ❌ |
| Editar cita | ✅ | ✅ | ✅ | ❌ |
| Cancelar cita | ✅ | ✅ | ✅ | ❌ |
| **Sesiones Clínicas** |
| Registrar notas SOAP | ✅ | ✅ | ❌ | ❌ |
| Editar propias notas SOAP | ✅ | ✅ | ❌ | ❌ |
| Ver notas SOAP de otros fisios | ✅ | ✅ | ❌ | ❌ |
| Eliminar notas SOAP | ✅ | ❌ | ❌ | ❌ |
| **Ejercicios** |
| Ver biblioteca de ejercicios | ✅ | ✅ | ❌ | ❌ |
| Crear ejercicio | ✅ | ✅ | ❌ | ❌ |
| Editar ejercicio | ✅ | ✅ | ❌ | ❌ |
| Eliminar ejercicio | ✅ | ❌ | ❌ | ❌ |
| Prescribir ejercicios | ✅ | ✅ | ❌ | ❌ |
| Ver ejercicios propios | ❌ | ❌ | ❌ | ✅ |
| Marcar ejercicio como completado | ❌ | ❌ | ❌ | ✅ |
| **Plantillas de Tratamiento** |
| Ver plantillas | ✅ | ✅ | ❌ | ❌ |
| Crear plantilla | ✅ | ✅ | ❌ | ❌ |
| Editar plantilla | ✅ | ✅ | ❌ | ❌ |
| Eliminar plantilla | ✅ | ❌ | ❌ | ❌ |
| Asignar plantilla a paciente | ✅ | ✅ | ❌ | ❌ |
| **Pagos** |
| Registrar pago | ✅ | ✅ | ✅ | ❌ |
| Ver todos los pagos | ✅ | ❌ | ✅ | ❌ |
| Ver pagos de sus pacientes | ✅ | ✅ | ❌ | ❌ |
| Generar factura | ✅ | ✅ | ✅ | ❌ |
| Editar pago | ✅ | ❌ | ✅ | ❌ |
| Eliminar pago | ✅ | ❌ | ❌ | ❌ |
| **Reportes** |
| Dashboard general | ✅ | ❌ | ❌ | ❌ |
| Reportes financieros | ✅ | ❌ | ❌ | ❌ |
| Reportes de pacientes | ✅ | ✅ (propios) | ❌ | ❌ |
| Reportes de adherencia | ✅ | ✅ | ❌ | ❌ |
| Exportar datos | ✅ | ❌ | ❌ | ❌ |
| **Configuración** |
| Configuración de clínica | ✅ | ❌ | ❌ | ❌ |
| Gestión de usuarios | ✅ | ❌ | ❌ | ❌ |
| Configuración de perfil propio | ✅ | ✅ | ✅ | ✅ |

---

## 4. Alcance (Scope)

### 4.1 Estado Actual del Proyecto (Enero 2026)

#### ✅ Implementado y Funcional (Fase 1 + Fase 2 Parcial)

##### Módulo de Autenticación
- [x] Login con email/password via Supabase Auth
- [x] Logout seguro
- [x] Protección de rutas con middleware
- [x] Row Level Security (RLS) en base de datos
- [ ] Recuperación de contraseña (pendiente)
- [ ] Cambio de contraseña desde perfil (pendiente)
- [ ] Two-Factor Authentication (futuro)

##### Módulo de Pacientes
- [x] Crear paciente con datos demográficos completos
- [x] Editar información del paciente
- [x] Búsqueda y filtrado de pacientes
- [x] Vista de detalle del paciente
- [x] Desactivación lógica (no eliminación física)
- [x] Cálculo automático de edad desde fecha de nacimiento
- [x] Cálculo de IMC (BMI)
- [x] Contactos de emergencia
- [x] Historial médico completo:
  - [x] Alergias (arreglo dinámico)
  - [x] Condiciones crónicas
  - [x] Medicamentos actuales
  - [x] Cirugías previas
  - [x] Antecedentes familiares
  - [x] Notas de estilo de vida
- [x] Evaluación inicial:
  - [x] Motivo de consulta
  - [x] Evaluación de dolor (ubicación, intensidad 0-10, duración)
  - [x] Limitaciones funcionales
  - [x] Objetivos del tratamiento
  - [x] Diagnóstico
  - [x] Pronóstico
- [x] Mediciones y valoraciones:
  - [x] Rango de movimiento (ROM)
  - [x] Fuerza muscular
  - [x] Balance/equilibrio
  - [x] Tracking histórico de mediciones
- [ ] Adjuntar archivos (PDF, imágenes) - pendiente
- [ ] Galería de fotos de progreso - pendiente

##### Módulo de Agenda y Citas
- [x] Calendario semanal con FullCalendar
- [x] Vista por fisioterapeuta
- [x] Crear cita con:
  - [x] Selección de paciente
  - [x] Selección de fisioterapeuta
  - [x] Fecha y hora
  - [x] Duración
  - [x] Título y notas
- [x] Editar cita existente
- [x] Eliminar cita
- [x] Estados de cita:
  - [x] Programada (scheduled)
  - [x] Completada (completed)
  - [x] Cancelada (cancelled)
  - [x] Inasistencia (no_show)
- [x] Código de colores por estado
- [ ] Vista mensual - pendiente
- [ ] Vista diaria - pendiente
- [ ] Drag & drop para reprogramar - pendiente
- [ ] Recordatorios automáticos - pendiente
- [ ] Lista de espera - pendiente

##### Módulo de Sesiones Clínicas
- [x] Registro de notas SOAP completas:
  - [x] Subjetivo: síntomas reportados por paciente
  - [x] Objetivo: observaciones del terapeuta, mediciones
  - [x] Análisis (Assessment): diagnóstico, progreso
  - [x] Plan: tratamiento realizado, próximos pasos
- [x] Escala de dolor 0-10 con slider
- [x] Vinculación automática a cita
- [x] Timestamp de creación
- [ ] Edición de sesiones previas - pendiente
- [ ] Plantillas de texto frecuente - pendiente
- [ ] Dictado por voz - futuro

##### Módulo de Ejercicios
- [x] Biblioteca de ejercicios con:
  - [x] Nombre y descripción
  - [x] Categoría (estiramiento, fortalecimiento, movilidad, equilibrio, cardio, funcional)
  - [x] Parte del cuerpo (cuello, hombro, espalda alta, lumbar, cadera, rodilla, tobillo, core, general)
  - [x] Nivel de dificultad (principiante, intermedio, avanzado)
  - [x] Equipo necesario
  - [x] URL de video demostrativo
  - [x] URL de imagen
  - [x] Instrucciones detalladas
  - [x] Contraindicaciones
- [x] Crear nuevo ejercicio
- [x] Vista de detalle de ejercicio
- [x] Prescripción de ejercicios a pacientes:
  - [x] Selección de ejercicio de biblioteca
  - [x] Dosificación personalizada:
    - [x] Series
    - [x] Repeticiones
    - [x] Duración por ejercicio
  - [x] Frecuencia (ej: "2 veces al día")
  - [x] Instrucciones especiales
  - [x] Fecha de inicio y fin
  - [x] Estado (activo, completado, discontinuado)
- [x] Vista de ejercicios prescritos por paciente
- [ ] Editar ejercicio existente - pendiente
- [ ] Eliminar ejercicio - pendiente
- [ ] Búsqueda y filtros en biblioteca - pendiente
- [ ] Importación masiva de ejercicios - pendiente

##### Portal de Adherencia del Paciente
- [x] Login independiente para pacientes
- [x] Vista de ejercicios prescritos activos
- [x] Reproducción de videos demostrativos
- [x] Vista de imágenes de referencia
- [x] Instrucciones de dosificación claras
- [x] Marcar ejercicio como completado por fecha
- [x] Tracking de adherencia:
  - [x] Registro de sets/reps completados
  - [x] Nivel de dolor durante ejercicio (0-10)
  - [x] Fecha de completado
- [x] Visualización de tasa de cumplimiento
- [ ] Gráficas de progreso - pendiente
- [ ] Historial de completados - pendiente
- [ ] Notificaciones/recordatorios - pendiente

##### Módulo de Plantillas de Tratamiento
- [x] Crear plantillas reutilizables:
  - [x] Nombre de la plantilla
  - [x] Categoría de tratamiento
  - [x] Objetivos
  - [x] Contraindicaciones
  - [x] Duración estimada en semanas
- [x] Agregar técnicas a plantilla:
  - [x] Nombre de técnica (ej: "Masaje descontracturante", "Ultrasonido")
  - [x] Duración en minutos
  - [x] Orden de aplicación
- [x] Vista de lista de plantillas
- [x] Vista de detalle de plantilla
- [x] Asignar plantilla a paciente:
  - [x] Selección de plantilla base
  - [x] Personalización de técnicas
  - [x] Fecha de inicio
  - [x] Tracking de estado (activo, completado, pausado, cancelado)
  - [x] Conteo de sesiones completadas
- [ ] Editar plantilla existente - pendiente
- [ ] Eliminar plantilla - pendiente
- [ ] Duplicar plantilla - pendiente
- [ ] Compartir plantillas entre fisioterapeutas - futuro

##### Módulo de Pagos y Facturación
- [x] Registro de pagos:
  - [x] Vinculación a paciente
  - [x] Vinculación a sesión (opcional)
  - [x] Monto
  - [x] Método de pago (efectivo, tarjeta, transferencia, seguro)
  - [x] Estado (pendiente, completado, cancelado, reembolsado)
  - [x] Número de factura auto-generado
  - [x] Fecha de pago
  - [x] Notas
- [x] Generación de factura PDF:
  - [x] Información de la clínica
  - [x] Información del paciente
  - [x] Desglose de conceptos
  - [x] Total
  - [x] Método de pago
  - [x] Número de factura
- [x] Lista de pagos con filtros:
  - [x] Por paciente
  - [x] Por rango de fechas
  - [x] Por estado
  - [x] Por método de pago
- [x] Vista de pagos pendientes
- [x] Cálculo de totales
- [ ] Editar pago - pendiente
- [ ] Anular pago con motivo - pendiente
- [ ] Pagos recurrentes/paquetes - pendiente
- [ ] Integración con pasarelas de pago - futuro
- [ ] Facturación fiscal (CFDI México, etc.) - futuro

##### Módulo de Reportes y Analytics
- [x] Dashboard principal con KPIs en tiempo real:
  - [x] Total de pacientes activos
  - [x] Citas del día
  - [x] Ingresos del mes
  - [x] Pagos pendientes
- [x] Reportes avanzados:
  - [x] Pacientes activos vs. inactivos
  - [x] Estadísticas de citas (total, completadas, canceladas, inasistencias)
  - [x] Análisis de ingresos por periodo
  - [x] Sesiones registradas por periodo
  - [x] Tasa de asistencia
  - [x] Distribución de métodos de pago
- [ ] Gráficas visuales (Chart.js/Recharts) - pendiente
- [ ] Exportación a Excel/PDF - pendiente
- [ ] Reportes por fisioterapeuta - pendiente
- [ ] Reportes de ejercicios más prescritos - pendiente
- [ ] Análisis de adherencia agregado - pendiente

---

### 4.2 Roadmap de Funcionalidades Futuras

#### 🔄 En Desarrollo / Próxima Iteración (Q1 2026)

##### Mejoras de Usabilidad
- [ ] Editar y eliminar ejercicios de biblioteca
- [ ] Editar y eliminar plantillas de tratamiento
- [ ] Búsqueda avanzada de pacientes con filtros múltiples
- [ ] Vista mensual y diaria de agenda
- [ ] Drag & drop para reprogramar citas
- [ ] Edición de sesiones SOAP previas

##### Gestión Multi-Usuario
- [ ] Gestión de perfiles de fisioterapeutas:
  - [ ] Especialidades
  - [ ] Horarios de disponibilidad
  - [ ] Foto de perfil
- [ ] Gestión de perfiles de recepcionistas
- [ ] Configuración granular de permisos por rol
- [ ] Auditoría de acciones (quién hizo qué y cuándo)

##### Reportes Visuales
- [ ] Integración de Chart.js o Recharts
- [ ] Gráfica de ingresos por mes (últimos 12 meses)
- [ ] Gráfica de ocupación de agenda
- [ ] Gráfica de adherencia a ejercicios
- [ ] Gráfica de evolución de dolor del paciente
- [ ] Exportación de reportes a PDF
- [ ] Exportación de datos a Excel

---

#### 📋 Fase 3 - Notificaciones y Comunicación (Q2 2026)

##### Sistema de Notificaciones
- [ ] Recordatorios de citas vía email/SMS
  - [ ] 24 horas antes
  - [ ] 1 hora antes
  - [ ] Configuración por paciente
- [ ] Notificaciones push en navegador
- [ ] Recordatorios de ejercicios para pacientes
- [ ] Alertas de pagos pendientes
- [ ] Notificaciones de nuevos mensajes (futuro chat)

##### Comunicación
- [ ] Envío de mensajes WhatsApp (integración con API)
- [ ] Templates de mensajes predefinidos
- [ ] Confirmación de cita bidireccional
- [ ] Chat interno clínica-paciente (futuro)

---

#### 🚀 Fase 4 - Features Avanzadas (Q3 2026)

##### Gestión Financiera Avanzada
- [ ] Paquetes de sesiones:
  - [ ] Creación de paquetes (ej: 10 sesiones por $X)
  - [ ] Venta de paquetes
  - [ ] Tracking de sesiones consumidas/restantes
- [ ] Facturación recurrente automática
- [ ] Integración con pasarelas de pago (Stripe, Mercado Pago)
- [ ] Generación de recibos fiscales (CFDI en México)
- [ ] Reportes contables para contador
- [ ] Flujo de cuentas por cobrar

##### Mejoras Clínicas
- [ ] Galería de fotos de progreso del paciente
- [ ] Comparación lado a lado de fotos (antes/después)
- [ ] Adjuntar archivos PDF (estudios, recetas, referencias)
- [ ] Plantillas de texto frecuente para SOAP
- [ ] Notas de progreso entre sesiones
- [ ] Integración con dispositivos de medición (goniómetros digitales, dinamómetros)
- [ ] Firma digital de consentimientos
- [ ] Generación automática de reportes de evolución para médicos

##### Gestión Operativa
- [ ] Inventario de equipo:
  - [ ] Registro de equipos (camillas, tens, ultrasonido)
  - [ ] Control de mantenimientos
  - [ ] Alertas de calibración
- [ ] Gestión de sala:
  - [ ] Asignación de salas a citas
  - [ ] Disponibilidad de salas
- [ ] Lista de espera inteligente:
  - [ ] Auto-notificación cuando hay cancelación
  - [ ] Priorización por urgencia

---

#### 🌐 Fase 5 - Escalabilidad y Expansión (Q4 2026)

##### Multi-Clínica
- [ ] Arquitectura multi-tenant mejorada
- [ ] Dashboard consolidado de múltiples sucursales
- [ ] Transferencia de pacientes entre sucursales
- [ ] Reportes comparativos entre clínicas
- [ ] Configuración independiente por clínica

##### Integraciones
- [ ] Integración con aseguradoras:
  - [ ] Verificación de cobertura
  - [ ] Envío de facturas electrónicas a aseguradoras
  - [ ] Tracking de autorizaciones
- [ ] Integración con laboratorios y centros de imagen
- [ ] API pública para integraciones de terceros
- [ ] Webhooks para eventos importantes

##### Inteligencia Artificial
- [ ] Sugerencias de ejercicios basadas en diagnóstico
- [ ] Predicción de adherencia del paciente
- [ ] Detección de patrones en notas SOAP
- [ ] Transcripción automática de notas por voz
- [ ] Análisis predictivo de deserción de pacientes

---

#### 📱 Fase 6 - Aplicación Móvil (2027)

##### App Móvil para Pacientes (React Native)
- [ ] Login con mismas credenciales
- [ ] Vista de ejercicios prescritos
- [ ] Reproducción de videos offline
- [ ] Tracking de ejercicios con calendario
- [ ] Notificaciones push de recordatorios
- [ ] Ver próximas citas
- [ ] Historial de sesiones
- [ ] Mensajería con fisioterapeuta

##### App Móvil para Fisioterapeutas
- [ ] Vista de agenda del día
- [ ] Registro rápido de notas SOAP (voz a texto)
- [ ] Consulta de expediente del paciente
- [ ] Toma de fotos de progreso
- [ ] Modo offline para áreas sin conexión

---

### 4.3 Fuera del Alcance (Out of Scope)

Las siguientes funcionalidades NO están planificadas para las fases actuales:

#### Funcionalidades No Planificadas
- ❌ Telemedicina con videollamadas integradas (posible partnership con Zoom/Whereby)
- ❌ E-commerce de productos (vendas, aparatos, suplementos)
- ❌ Sistema de referencias médicas complejo
- ❌ Gestión de nómina y RRHH
- ❌ Sistema de CRM completo para marketing
- ❌ Plataforma de educación/cursos para pacientes
- ❌ Comunidad/foro de pacientes
- ❌ Integración con wearables (Fitbit, Apple Watch) - evaluando para futuro lejano
- ❌ Blockchain para registros médicos
- ❌ Marketplace de fisioterapeutas

#### Razones de Exclusión
- **Complejidad vs. Valor**: Funcionalidades que requieren meses de desarrollo pero benefician a < 20% de usuarios
- **No Core**: Features que no están directamente relacionadas con la gestión clínica/administrativa
- **Partnership > Build**: Funcionalidades mejor resueltas integrando con soluciones existentes
- **Regulatorio**: Features que requerirían certificaciones médicas especiales (ej: diagnóstico asistido por IA)

---

## 5. Funcionalidades

Esta sección detalla cada funcionalidad del sistema con user stories, criterios de aceptación, flujos de usuario y especificaciones técnicas.

### 5.1 Autenticación y Seguridad

#### User Story AUTH-001: Login de Usuario
**Como** fisioterapeuta/recepcionista/admin
**Quiero** iniciar sesión con mi email y contraseña
**Para** acceder al sistema de manera segura

**Criterios de Aceptación:**
- ✅ El sistema valida el formato del email antes de enviar la solicitud
- ✅ La contraseña es encriptada en tránsito (HTTPS)
- ✅ Supabase Auth valida credenciales
- ✅ Si las credenciales son correctas:
  - Usuario es redirigido al dashboard
  - Se establece una sesión con cookie segura (httpOnly, secure, sameSite)
  - Token JWT almacenado en memoria del navegador
- ✅ Si las credenciales son incorrectas:
  - Mensaje de error claro: "Email o contraseña incorrectos"
  - No revelar si el email existe o no (seguridad)
  - Límite de 5 intentos fallidos en 15 minutos (rate limiting)
- ✅ Botón "Olvidé mi contraseña" visible (pendiente de implementar)

**Flujo Técnico:**
1. Usuario ingresa email/password en [LoginForm](src/components/auth/LoginForm.tsx)
2. Cliente hace POST a Supabase Auth API
3. Supabase valida contra tabla `auth.users`
4. Si válido: retorna JWT + refresh token
5. Middleware verifica token en cada request subsecuente
6. Token se refresca automáticamente antes de expirar (1 hora)

**Implementación:**
- Archivo: [src/components/auth/LoginForm.tsx](src/components/auth/LoginForm.tsx)
- Método: `signInWithPassword()` de Supabase client
- Protección: [src/middleware.ts](src/middleware.ts)

---

#### User Story AUTH-002: Protección de Rutas
**Como** sistema
**Quiero** validar que solo usuarios autenticados accedan a rutas protegidas
**Para** mantener la seguridad de los datos

**Criterios de Aceptación:**
- ✅ Todas las rutas bajo `/dashboard/*` requieren autenticación
- ✅ Si un usuario no autenticado intenta acceder:
  - Es redirigido a `/login`
  - Se guarda la URL original para redirección post-login
- ✅ Si el token expira durante una sesión:
  - El sistema intenta refrescar automáticamente
  - Si falla, se cierra sesión y redirige a login
- ✅ Logout destruye la sesión completamente
- ✅ Botón "Salir" visible en todas las páginas del dashboard

**Implementación:**
- Middleware: [src/middleware.ts](src/middleware.ts)
- Auth helpers: [src/utils/supabase/middleware.ts](src/utils/supabase/middleware.ts)

---

#### User Story AUTH-003: Row Level Security (RLS)
**Como** administrador del sistema
**Quiero** que los datos estén protegidos a nivel de base de datos
**Para** que usuarios solo accedan a datos de su clínica

**Criterios de Aceptación:**
- ✅ Todas las tablas principales tienen políticas RLS habilitadas
- ✅ Los queries automáticamente filtran por `clinic_id` (cuando aplique)
- ✅ Fisioterapeutas solo ven sus propios pacientes/citas por defecto
- ✅ Administradores ven todos los datos de su clínica
- ✅ No es posible hacer query directo a datos de otra clínica (SQL injection protection)
- ✅ Las políticas se aplican tanto en SELECT, INSERT, UPDATE como DELETE

**Políticas RLS Implementadas:**
```sql
-- Ejemplo: tabla patients
CREATE POLICY "Users can view patients from their clinic"
ON patients FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM user_clinics
  WHERE clinic_id = patients.clinic_id
));

-- Ejemplo: tabla appointments
CREATE POLICY "Therapists see their own appointments"
ON appointments FOR SELECT
USING (
  therapist_id = auth.uid()
  OR auth.uid() IN (SELECT user_id FROM admins)
);
```

**Pendiente:**
- [ ] Políticas RLS para multi-clínica (Fase 5)
- [ ] Políticas para pacientes (solo sus datos)

---

### 5.2 Gestión de Pacientes

#### User Story PAT-001: Registrar Nuevo Paciente
**Como** recepcionista o fisioterapeuta
**Quiero** registrar un paciente nuevo con su información demográfica
**Para** crear su expediente en el sistema

**Criterios de Aceptación:**
- ✅ Formulario con campos obligatorios:
  - Nombre(s) ✓
  - Apellido(s) ✓
  - Teléfono ✓
  - Email (opcional)
  - Fecha de nacimiento ✓
  - Género ✓
- ✅ Campos opcionales:
  - Dirección completa
  - Ocupación
  - Contacto de emergencia (nombre, teléfono, relación)
- ✅ Validaciones en tiempo real:
  - Teléfono: 10 dígitos
  - Email: formato válido
  - Fecha de nacimiento: edad entre 5 y 120 años
- ✅ Cálculo automático de edad
- ✅ Al guardar:
  - Paciente se crea con estado `active: true`
  - Timestamp de `created_at` automático
  - Usuario es redirigido a la página del paciente
  - Mensaje de éxito: "Paciente registrado exitosamente"
- ✅ Si hay error:
  - Mensaje claro del problema
  - Datos del formulario se mantienen (no se pierden)

**Validaciones de Negocio:**
- No se permite duplicados exactos (mismo nombre + apellido + fecha nacimiento)
  - Si existe coincidencia, mostrar advertencia con opción de continuar
- Email debe ser único si se proporciona

**Flujo de Usuario:**
1. Click en "Nuevo Paciente" desde [/dashboard/pacientes](src/app/dashboard/pacientes/page.tsx)
2. Navegar a [/dashboard/pacientes/nuevo](src/app/dashboard/pacientes/nuevo/page.tsx)
3. Llenar formulario
4. Click "Guardar"
5. Validación client-side
6. POST a Supabase tabla `patients`
7. Redirección a `/dashboard/pacientes/[id]`

**Archivos Relacionados:**
- Ruta: [src/app/dashboard/pacientes/nuevo/page.tsx](src/app/dashboard/pacientes/nuevo/page.tsx)
- Tipos: [src/types/patient.ts](src/types/patient.ts)

---

#### User Story PAT-002: Editar Información del Paciente
**Como** fisioterapeuta
**Quiero** actualizar la información demográfica de un paciente
**Para** mantener los datos actualizados

**Criterios de Aceptación:**
- ✅ Mismo formulario que creación, pero pre-llenado con datos actuales
- ✅ No se puede cambiar el ID del paciente
- ✅ Al guardar:
  - Se actualiza timestamp `updated_at`
  - Solo los campos modificados se envían (optimización)
  - Mensaje de confirmación
- ✅ Botón "Cancelar" que descarta cambios
- ✅ Si otro usuario editó el registro (conflicto):
  - Mostrar advertencia
  - Permitir sobrescribir o cancelar

**Permisos:**
- ✅ Fisioterapeutas: pueden editar pacientes asignados a ellos
- ✅ Admin: puede editar cualquier paciente
- ❌ Recepcionistas: solo pueden editar datos demográficos básicos

---

#### User Story PAT-003: Buscar y Filtrar Pacientes
**Como** usuario del sistema
**Quiero** buscar pacientes rápidamente
**Para** encontrar su expediente sin navegar toda la lista

**Criterios de Aceptación:**
- ✅ Barra de búsqueda visible en [/dashboard/pacientes](src/app/dashboard/pacientes/page.tsx)
- ✅ Búsqueda en tiempo real (debounced 300ms) por:
  - Nombre completo (insensible a mayúsculas)
  - Teléfono
  - Email
- ✅ Resultados se actualizan conforme se escribe
- ✅ Si no hay resultados: mensaje "No se encontraron pacientes"
- ✅ Límite de 50 resultados por página (paginación)
- ✅ Filtros adicionales:
  - Estado: Activos / Inactivos / Todos
  - Ordenar por: Nombre, Fecha de registro, Última sesión

**Pendiente:**
- [ ] Filtro por rango de edad
- [ ] Filtro por fisioterapeuta asignado
- [ ] Búsqueda avanzada (múltiples criterios simultáneos)

**Implementación:**
```typescript
// Búsqueda con Supabase
const { data, error } = await supabase
  .from('patients')
  .select('*')
  .ilike('first_name', `%${searchTerm}%`)
  .or(`last_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
  .eq('active', true)
  .order('created_at', { ascending: false })
  .limit(50);
```

---

#### User Story PAT-004: Ver Expediente Completo
**Como** fisioterapeuta
**Quiero** ver toda la información del paciente en una sola pantalla
**Para** tener contexto completo antes/durante la sesión

**Criterios de Aceptación:**
- ✅ Vista en [/dashboard/pacientes/[id]](src/app/dashboard/pacientes/[id]/page.tsx) contiene:
  - **Header**: Foto (placeholder), nombre, edad, estado
  - **Datos demográficos**: Teléfono, email, dirección
  - **Información médica**:
    - Alergias (badges rojos)
    - Condiciones crónicas
    - Medicamentos actuales
    - Cirugías previas
  - **Evaluación inicial**: Si existe, resumen del diagnóstico
  - **Mediciones recientes**: Última ROM, fuerza, balance
  - **Historial de sesiones**: Lista con fechas, enlaces a SOAP notes
  - **Ejercicios activos**: Lista de prescripciones vigentes
  - **Planes de tratamiento**: Plantillas asignadas y progreso
  - **Pagos**: Resumen de pagos/adeudos
- ✅ Botones de acción rápida:
  - "Agendar Cita"
  - "Registrar Sesión"
  - "Prescribir Ejercicios"
  - "Editar Información"
- ✅ Navegación por tabs para organizar información:
  - Tab "Información General"
  - Tab "Historial Médico"
  - Tab "Sesiones"
  - Tab "Ejercicios"
  - Tab "Pagos"

**Performance:**
- Carga inicial < 500ms
- Lazy loading de historial de sesiones (solo últimas 10, botón "Ver más")

---

#### User Story PAT-005: Registrar Historial Médico
**Como** fisioterapeuta
**Quiero** documentar el historial médico del paciente
**Para** conocer condiciones preexistentes y evitar contraindicaciones

**Criterios de Aceptación:**
- ✅ Formulario en sección "Historial Médico" de perfil del paciente
- ✅ Campos con arrays dinámicos:
  - **Alergias**: Lista con input para agregar/eliminar
  - **Condiciones crónicas**: (diabetes, hipertensión, artritis, etc.)
  - **Medicamentos actuales**: Nombre y dosis
  - **Cirugías previas**: Procedimiento y fecha (aproximada)
- ✅ Campos de texto libre:
  - **Antecedentes familiares**: Enfermedades hereditarias relevantes
  - **Notas de estilo de vida**: Actividad física, trabajo, hábitos
- ✅ Se puede editar en cualquier momento
- ✅ Cambios se guardan automáticamente (debounced) o con botón "Guardar"
- ✅ Historial de cambios (audit log) - futuro

**Alertas Automáticas:**
- Si el paciente tiene alergias, mostrar badge rojo en header del perfil
- Advertencia al prescribir ejercicio si hay contraindicaciones relacionadas

**Implementación:**
- Tabla: `medical_history`
- Relación: 1-1 con `patients`
- Arrays de PostgreSQL para listas dinámicas

---

#### User Story PAT-006: Realizar Evaluación Inicial
**Como** fisioterapeuta
**Quiero** registrar la evaluación inicial del paciente
**Para** documentar el diagnóstico y establecer objetivos de tratamiento

**Criterios de Aceptación:**
- ✅ Formulario en [/dashboard/pacientes/[id]/evaluacion](src/app/dashboard/pacientes/[id]/evaluacion/page.tsx)
- ✅ Secciones del formulario:
  - **Motivo de consulta**: Texto libre, por qué vino el paciente
  - **Evaluación del dolor**:
    - Ubicación (texto o selector de región corporal - futuro)
    - Intensidad (escala 0-10 con slider)
    - Duración (agudo < 6 sem, subagudo 6-12 sem, crónico > 12 sem)
    - Tipo (punzante, sordo, ardoroso, etc.)
  - **Limitaciones funcionales**: Qué actividades no puede hacer
  - **Objetivos del tratamiento**: Metas del paciente y del terapeuta
  - **Diagnóstico**: Impresión diagnóstica
  - **Pronóstico**: Estimación de duración del tratamiento
- ✅ Solo se puede crear UNA evaluación inicial por paciente
- ✅ Si ya existe, el botón cambia a "Ver/Editar Evaluación"
- ✅ Se guarda con fecha y hora
- ✅ Aparece en resumen del perfil del paciente

**Validaciones:**
- Motivo de consulta y diagnóstico son obligatorios
- Nivel de dolor debe estar entre 0-10

---

#### User Story PAT-007: Registrar Mediciones y Valoraciones
**Como** fisioterapeuta
**Quiero** registrar mediciones objetivas (ROM, fuerza, balance)
**Para** trackear el progreso del paciente de forma cuantitativa

**Criterios de Aceptación:**
- ✅ Formulario en sección de mediciones del perfil
- ✅ Tipos de mediciones:
  - **ROM (Rango de Movimiento)**:
    - Articulación (hombro, rodilla, cadera, etc.)
    - Tipo de movimiento (flexión, extensión, abducción, etc.)
    - Grados medidos
    - Lado (izquierdo/derecho)
  - **Fuerza Muscular**:
    - Grupo muscular
    - Escala 0-5 (escala de Daniels)
    - Lado
  - **Balance/Equilibrio**:
    - Prueba utilizada (Romberg, Berg Balance Scale, etc.)
    - Puntuación
- ✅ Cada medición incluye:
  - Fecha de medición
  - Notas opcionales
- ✅ Historial de mediciones:
  - Lista ordenada por fecha (más reciente primero)
  - Comparación con medición anterior (± diferencia)
  - Gráfica de evolución (futuro)
- ✅ Se pueden agregar mediciones desde sesiones SOAP también

**Visualización:**
- Tabla con últimas 5 mediciones
- Indicador de mejoría (verde), estable (amarillo), empeoramiento (rojo)

---

#### User Story PAT-008: Desactivar Paciente
**Como** administrador
**Quiero** desactivar pacientes que ya no asisten
**Para** mantener la lista de pacientes activos limpia

**Criterios de Aceptación:**
- ✅ Botón "Desactivar Paciente" en perfil (solo para admin)
- ✅ Confirmación antes de desactivar
- ✅ Al desactivar:
  - Campo `active` se pone en `false`
  - Paciente NO se elimina físicamente
  - Ya no aparece en búsquedas por defecto
  - Historial se preserva
- ✅ Opción de "Reactivar" si se desactiva por error
- ✅ Filtro para ver pacientes inactivos

**Reglas de Negocio:**
- No se puede desactivar paciente con citas programadas futuras (advertencia)
- No se puede eliminar paciente físicamente (solo admin con confirmación especial)

---

### 5.3 Agenda y Citas

#### User Story AGE-001: Ver Calendario de la Semana
**Como** recepcionista o fisioterapeuta
**Quiero** ver la agenda semanal de manera visual
**Para** saber qué citas hay cada día

**Criterios de Aceptación:**
- ✅ Vista de calendario en [/dashboard/agenda](src/app/dashboard/agenda/page.tsx)
- ✅ Librería: FullCalendar con vista semanal por defecto
- ✅ Elementos visuales:
  - Eje X: Días de la semana (Lun-Dom)
  - Eje Y: Horario (8 AM - 8 PM configurable)
  - Cada cita es un bloque de color
- ✅ Código de colores por estado:
  - Azul: Programada
  - Verde: Completada
  - Rojo: Cancelada
  - Gris: Inasistencia (no_show)
- ✅ Al hacer hover sobre cita, tooltip con:
  - Nombre del paciente
  - Fisioterapeuta
  - Hora
  - Estado
- ✅ Click en cita abre modal/página de detalle
- ✅ Botón "Hoy" para volver a semana actual
- ✅ Navegación anterior/siguiente semana con flechas
- ✅ Selector de fisioterapeuta (admin/recepcionista ven todos, fisio ve solo su agenda)

**Performance:**
- Carga solo citas del rango visible (no cargar todo el año)
- Refetch automático cada 5 minutos si hay múltiples usuarios

**Pendiente:**
- [ ] Vista mensual
- [ ] Vista diaria
- [ ] Drag & drop para reprogramar

---

#### User Story AGE-002: Agendar Nueva Cita
**Como** recepcionista
**Quiero** agendar una cita para un paciente
**Para** reservar un espacio en la agenda

**Criterios de Aceptación:**
- ✅ Formulario en [/dashboard/agenda/nueva](src/app/dashboard/agenda/nueva/page.tsx)
- ✅ Campos requeridos:
  - Paciente: Select con búsqueda (typeahead)
  - Fisioterapeuta: Select
  - Fecha: Date picker
  - Hora de inicio: Time picker
  - Duración: Selector (30min, 45min, 60min, custom)
- ✅ Campos opcionales:
  - Título: Auto-generado como "Sesión con [nombre paciente]" si se deja vacío
  - Notas: Observaciones especiales
- ✅ Validaciones en tiempo real:
  - Hora de inicio debe ser en el futuro (no permitir agendar en el pasado)
  - No permitir doble booking (validar que el slot esté libre)
  - Validar horario de atención del fisioterapeuta (8 AM - 8 PM por defecto)
- ✅ Estado inicial: `scheduled`
- ✅ Al guardar:
  - Insertar en tabla `appointments`
  - Redirigir a calendario
  - Mensaje: "Cita agendada exitosamente"
- ✅ Botón "Agendar y Crear Otra" para agendar múltiples citas seguidas

**Mejoras Futuras:**
- [ ] Ver disponibilidad en tiempo real mientras se llena el form
- [ ] Sugerir próximo slot disponible
- [ ] Agendar citas recurrentes (ej: 2x/semana por 8 semanas)

---

#### User Story AGE-003: Editar Cita Existente
**Como** recepcionista
**Quiero** modificar una cita programada
**Para** cambiar fecha, hora o fisioterapeuta

**Criterios de Aceptación:**
- ✅ Click en cita del calendario abre modal o página [/dashboard/agenda/[id]/editar](src/app/dashboard/agenda/[id]/editar/page.tsx)
- ✅ Mismo formulario que crear, pero pre-llenado
- ✅ Cambios permitidos:
  - Fecha y hora
  - Duración
  - Fisioterapeuta
  - Estado (cambiar a completada, cancelada, no_show)
  - Notas
- ✅ No se puede cambiar el paciente (si necesita cambiar, eliminar y crear nueva)
- ✅ Validaciones:
  - Nueva fecha/hora no genera conflicto
  - Si la cita ya tiene sesión registrada (SOAP), advertir antes de editar
- ✅ Historial de cambios guardado (audit log - futuro)

**Cambio de Estado:**
- Si se marca como "Completada", habilitar botón "Registrar Sesión"
- Si se marca como "Cancelada" o "No Show", agregar campo de motivo (opcional)

---

#### User Story AGE-004: Cancelar Cita
**Como** recepcionista o fisioterapeuta
**Quiero** cancelar una cita
**Para** liberar el espacio en la agenda

**Criterios de Aceptación:**
- ✅ Botón "Cancelar Cita" en página de edición
- ✅ Confirmación: "¿Está seguro de cancelar esta cita?"
- ✅ Opciones:
  - Cancelar cita: Cambia estado a `cancelled`, slot queda libre
  - Eliminar cita: Elimina el registro completamente (solo admin)
- ✅ Campo opcional: "Motivo de cancelación" (futuro para reportes)
- ✅ Si hay sesión registrada, no permitir eliminación (solo cancelación)
- ✅ Notificación al paciente (futuro)

---

#### User Story AGE-005: Marcar Inasistencia
**Como** recepcionista
**Quiero** marcar cuando un paciente no asistió
**Para** trackear asistencia y identificar pacientes problemáticos

**Criterios de Aceptación:**
- ✅ Botón "Marcar como No Show" en cita
- ✅ Solo disponible para citas del pasado
- ✅ Estado cambia a `no_show`
- ✅ Aparece en reportes de asistencia
- ✅ Futuro: cobro por inasistencia o política de penalización

---

### 5.4 Sesiones de Fisioterapia (Notas SOAP)

#### User Story SES-001: Registrar Nota SOAP
**Como** fisioterapeuta
**Quiero** documentar la sesión con el método SOAP
**Para** llevar un registro estructurado y profesional

**Criterios de Aceptación:**
- ✅ Formulario en [/dashboard/sesiones/nueva](src/app/dashboard/sesiones/nueva/page.tsx)
- ✅ Vinculación a cita:
  - Idealmente, se accede desde la cita (botón "Registrar Sesión")
  - Si se accede directo, selector de paciente + fecha
- ✅ Estructura SOAP completa:
  - **S - Subjetivo**: Textarea libre
    - Placeholder: "¿Qué reporta el paciente? Síntomas, dolor, cambios desde última sesión..."
  - **O - Objetivo**: Textarea libre
    - Placeholder: "Observaciones del terapeuta, mediciones, pruebas realizadas..."
  - **A - Assessment**: Textarea libre
    - Placeholder: "Análisis del progreso, diagnóstico, respuesta al tratamiento..."
  - **P - Plan**: Textarea libre
    - Placeholder: "Intervenciones realizadas, plan para próxima sesión, recomendaciones..."
- ✅ Campo adicional: **Nivel de dolor** (0-10 slider con emoji visual)
- ✅ Al guardar:
  - Timestamp automático
  - Si está vinculada a cita, marcar cita como `completed`
  - Mensaje: "Sesión registrada exitosamente"
- ✅ Botón "Guardar y Prescribir Ejercicios" (flujo rápido)

**Validaciones:**
- Todos los campos SOAP deben tener al menos 10 caracteres
- Nivel de dolor es opcional pero recomendado

---

#### User Story SES-002: Ver Historial de Sesiones del Paciente
**Como** fisioterapeuta
**Quiero** revisar sesiones anteriores del paciente
**Para** entender la evolución y continuidad del tratamiento

**Criterios de Aceptación:**
- ✅ Lista de sesiones en perfil del paciente, tab "Sesiones"
- ✅ Cada sesión muestra:
  - Fecha y hora
  - Fisioterapeuta que la registró
  - Preview de nota subjetiva (primeras 100 caracteres)
  - Nivel de dolor
  - Botón "Ver completa"
- ✅ Ordenadas de más reciente a más antigua
- ✅ Click en sesión abre modal/página con SOAP completo
- ✅ Gráfica de evolución de dolor a lo largo del tiempo (futuro)

---

#### User Story SES-003: Editar Sesión Previa
**Como** fisioterapeuta
**Quiero** corregir o ampliar una nota SOAP que registré
**Para** completar información que omití

**Criterios de Aceptación (Pendiente):**
- [ ] Solo el fisioterapeuta que creó la sesión puede editarla
- [ ] Solo se puede editar dentro de las primeras 24 horas
- [ ] Después de 24 horas, requiere aprobación de admin
- [ ] Historial de ediciones visible (audit log)
- [ ] No se puede eliminar sesión, solo editar

**Razón de Restricción:**
- Integridad legal del expediente clínico
- Compliance con regulaciones de salud

---

### 5.5 Ejercicios y Prescripción

#### User Story EJE-001: Crear Ejercicio en Biblioteca
**Como** administrador o fisioterapeuta
**Quiero** agregar un nuevo ejercicio a la biblioteca
**Para** poder prescribirlo a mis pacientes

**Criterios de Aceptación:**
- ✅ Formulario en [/dashboard/ejercicios/nuevo](src/app/dashboard/ejercicios/nuevo/page.tsx)
- ✅ Campos requeridos:
  - Nombre del ejercicio
  - Descripción breve
  - Categoría: (estiramiento, fortalecimiento, movilidad, equilibrio, cardio, funcional)
  - Parte del cuerpo: (cuello, hombro, espalda alta, lumbar, cadera, rodilla, tobillo, core, general)
- ✅ Campos opcionales:
  - Nivel de dificultad: (principiante, intermedio, avanzado)
  - Equipo necesario: texto libre (ej: "banda elástica, pelota")
  - URL de video: link de YouTube o almacenamiento propio
  - URL de imagen: para mostrar posición/movimiento
  - Instrucciones detalladas: paso a paso
  - Contraindicaciones: cuándo NO hacer el ejercicio
- ✅ Preview del video/imagen en el form
- ✅ Al guardar:
  - Ejercicio se agrega a biblioteca compartida de la clínica
  - Mensaje: "Ejercicio creado exitosamente"
  - Redirigir a lista de ejercicios

**Validaciones:**
- Nombre debe ser único en la biblioteca (advertir si ya existe similar)
- Si se proporciona URL de video, validar formato

**Pendiente:**
- [ ] Subir video/imagen directamente (Supabase Storage)
- [ ] Biblioteca pública de ejercicios pre-cargados

---

#### User Story EJE-002: Prescribir Ejercicios a Paciente
**Como** fisioterapeuta
**Quiero** asignar ejercicios específicos a un paciente con dosificación
**Para** que sepa qué hacer en casa

**Criterios de Aceptación:**
- ✅ Formulario en perfil del paciente o en vista de prescripciones
- ✅ Selector de ejercicios de la biblioteca (typeahead search)
- ✅ Configuración de dosificación:
  - **Series**: número (ej: 3)
  - **Repeticiones**: número (ej: 15)
  - **Duración**: minutos por ejercicio (ej: 10 min)
  - **Frecuencia**: texto libre (ej: "2 veces al día", "3 días a la semana")
  - **Instrucciones especiales**: texto opcional (ej: "Hacer después de calentamiento")
- ✅ Fechas de prescripción:
  - Fecha de inicio (default: hoy)
  - Fecha de fin (default: +4 semanas)
- ✅ Estado inicial: `active`
- ✅ Se puede prescribir múltiples ejercicios a la vez (lista)
- ✅ Preview del ejercicio (video/imagen) en el form
- ✅ Al guardar:
  - Se crean registros en tabla `exercise_prescriptions`
  - Paciente puede verlos en su portal inmediatamente
  - Mensaje: "Ejercicios prescritos exitosamente"

**Flujo Rápido:**
- Desde sesión SOAP, botón "Prescribir Ejercicios" lleva directamente a este form pre-llenado con el paciente

---

#### User Story EJE-003: Ver Ejercicios Prescritos como Paciente
**Como** paciente
**Quiero** ver los ejercicios que me prescribieron
**Para** hacerlos en casa correctamente

**Criterios de Aceptación:**
- ✅ Portal en [/dashboard/mis-ejercicios](src/app/dashboard/mis-ejercicios/page.tsx)
- ✅ Login separado para pacientes (credenciales proporcionadas por clínica)
- ✅ Vista de lista de ejercicios activos:
  - Thumbnail de imagen/video
  - Nombre del ejercicio
  - Dosificación clara: "3 series x 15 repeticiones, 2 veces al día"
  - Botón "Ver Detalles"
- ✅ Vista de detalle de ejercicio:
  - Video embebido (reproducible)
  - Imagen(es)
  - Instrucciones paso a paso
  - Dosificación
  - Botón "Marcar como Completado"
- ✅ Al marcar como completado:
  - Modal para ingresar:
    - Fecha (default: hoy)
    - Sets/reps completados
    - Nivel de dolor durante ejercicio (0-10)
    - Notas opcionales
  - Se crea registro en tabla `exercise_adherence`
- ✅ Indicador visual de adherencia:
  - Barra de progreso semanal
  - Porcentaje de cumplimiento
  - Streak de días consecutivos (gamification - futuro)

**Diseño:**
- Mobile-first (mayoría de pacientes usarán desde teléfono)
- Videos con controles grandes, fácil de pausar/reproducir
- Botones grandes y claros

---

#### User Story EJE-004: Trackear Adherencia del Paciente
**Como** fisioterapeuta
**Quiero** ver si el paciente está haciendo sus ejercicios
**Para** ajustar el plan si no hay adherencia

**Criterios de Aceptación:**
- ✅ Sección "Adherencia" en perfil del paciente
- ✅ Métricas visibles:
  - Porcentaje de adherencia (completados / esperados)
  - Ejercicios completados esta semana
  - Días consecutivos con ejercicios (streak)
  - Gráfica de evolución de dolor durante ejercicios (futuro)
- ✅ Tabla de ejercicios prescritos con:
  - Nombre
  - Fecha prescrito
  - Completados / Esperados
  - Última vez completado
  - % adherencia individual
- ✅ Filtros:
  - Mostrar solo activos / todos
  - Rango de fechas
- ✅ Alertas:
  - Badge rojo si adherencia < 50%
  - Badge amarillo si 50-70%
  - Badge verde si > 70%

**Acciones:**
- Si adherencia baja, fisioterapeuta puede:
  - Simplificar plan (reducir ejercicios)
  - Contactar al paciente para entender barreras
  - Ajustar dosificación

---

#### User Story EJE-005: Editar/Eliminar Ejercicio de Biblioteca
**Como** administrador
**Quiero** corregir o eliminar ejercicios de la biblioteca
**Para** mantener el catálogo actualizado y preciso

**Criterios de Aceptación (Pendiente):**
- [ ] Botón "Editar" en vista de ejercicio
- [ ] Mismo formulario que crear, pre-llenado
- [ ] Al editar ejercicio:
  - Cambios se reflejan en todas las prescripciones futuras
  - Prescripciones existentes NO se modifican (mantener integridad histórica)
- [ ] Botón "Eliminar" solo para admin
- [ ] Al eliminar:
  - Confirmación: "¿Está seguro? Esto NO afectará prescripciones existentes"
  - Soft delete: ejercicio se marca como `deleted: true`
  - Ya no aparece en búsquedas, pero prescripciones previas lo conservan

**Validación:**
- No permitir eliminar ejercicio si tiene prescripciones activas (advertir y sugerir desactivar en su lugar)

---

### 5.6 Plantillas de Tratamiento

#### User Story PLA-001: Crear Plantilla de Tratamiento
**Como** fisioterapeuta
**Quiero** crear una plantilla de tratamiento reutilizable
**Para** agilizar la prescripción de tratamientos comunes

**Criterios de Aceptación:**
- ✅ Formulario en [/dashboard/plantillas/nueva](src/app/dashboard/plantillas/nueva/page.tsx)
- ✅ Campos de la plantilla:
  - Nombre (ej: "Tratamiento para lumbalgia crónica")
  - Categoría (ej: dolor lumbar, hombro, rodilla, post-operatorio, etc.)
  - Objetivos (texto libre)
  - Contraindicaciones
  - Duración estimada en semanas
- ✅ Agregar técnicas a la plantilla:
  - Lista dinámica de técnicas
  - Cada técnica tiene:
    - Nombre (ej: "Masaje descontracturante", "Ultrasonido", "Movilización")
    - Duración en minutos
    - Orden de aplicación (arrastrable - futuro)
  - Botón "Agregar otra técnica"
- ✅ Preview de la plantilla antes de guardar
- ✅ Al guardar:
  - Se crea en tabla `treatment_templates`
  - Técnicas se guardan en `template_techniques`
  - Mensaje: "Plantilla creada exitosamente"

**Ejemplos de Plantillas:**
- "Tratamiento básico de hombro doloroso": TENS 15min, masaje 10min, movilización pasiva 10min
- "Rehabilitación post-esguince de tobillo": Crioterapia 10min, movilización 15min, fortalecimiento 20min

---

#### User Story PLA-002: Asignar Plantilla a Paciente
**Como** fisioterapeuta
**Quiero** asignar una plantilla de tratamiento a un paciente
**Para** establecer su plan de tratamiento rápidamente

**Criterios de Aceptación:**
- ✅ Desde perfil del paciente, botón "Asignar Plan de Tratamiento"
- ✅ Selector de plantilla de la biblioteca
- ✅ Preview de la plantilla seleccionada
- ✅ Opción de personalizar:
  - Modificar técnicas (agregar, quitar, cambiar duración)
  - Ajustar duración total en semanas
  - Agregar notas específicas del paciente
- ✅ Fecha de inicio (default: hoy)
- ✅ Estado inicial: `active`
- ✅ Al guardar:
  - Se crea registro en `patient_treatment_plans`
  - Plan aparece en perfil del paciente
- ✅ Se puede asignar múltiples plantillas (ej: plan para hombro + plan para espalda)

---

#### User Story PLA-003: Trackear Progreso del Plan de Tratamiento
**Como** fisioterapeuta
**Quiero** ver el progreso del plan de tratamiento del paciente
**Para** saber cuántas sesiones lleva y si debe continuar

**Criterios de Aceptación:**
- ✅ Sección "Planes de Tratamiento" en perfil del paciente
- ✅ Cada plan muestra:
  - Nombre de la plantilla
  - Estado (activo, completado, pausado, cancelado)
  - Fecha de inicio
  - Duración estimada
  - Sesiones completadas / estimadas
  - Barra de progreso
- ✅ Click en plan abre detalle con:
  - Lista de técnicas
  - Historial de sesiones donde se aplicó
  - Botón "Marcar como Completado"
  - Botón "Pausar Plan"
  - Botón "Cancelar Plan"
- ✅ Actualización automática de conteo de sesiones al registrar SOAP (futuro)

---

### 5.7 Pagos y Facturación

#### User Story PAG-001: Registrar Pago de Sesión
**Como** recepcionista
**Quiero** registrar el pago de un paciente
**Para** llevar control financiero

**Criterios de Aceptación:**
- ✅ Formulario en [/dashboard/pagos/nuevo](src/app/dashboard/pagos/nuevo/page.tsx)
- ✅ Campos requeridos:
  - Paciente (select con búsqueda)
  - Monto (número con 2 decimales)
  - Método de pago (efectivo, tarjeta, transferencia, seguro)
  - Fecha de pago (default: hoy)
- ✅ Campos opcionales:
  - Vinculación a sesión específica
  - Concepto (texto libre, ej: "Sesión de fisioterapia", "Paquete 10 sesiones")
  - Notas internas
- ✅ Número de factura auto-generado (formato: INV-YYYYMMDD-XXX)
- ✅ Estado inicial: `completed`
- ✅ Al guardar:
  - Se crea registro en tabla `payments`
  - Se genera PDF de factura automáticamente
  - Opción de imprimir/descargar factura
  - Mensaje: "Pago registrado exitosamente"

**Validaciones:**
- Monto debe ser > 0
- Si se vincula a sesión, validar que no esté ya pagada

---

#### User Story PAG-002: Generar Factura PDF
**Como** recepcionista
**Quiero** generar una factura imprimible
**Para** entregarla al paciente

**Criterios de Aceptación:**
- ✅ Factura se genera automáticamente al registrar pago
- ✅ Contenido de la factura:
  - **Header**: Logo y nombre de la clínica, dirección, teléfono
  - **Número de factura**: Auto-generado único
  - **Fecha de emisión**
  - **Información del paciente**: Nombre, dirección (si disponible)
  - **Desglose**:
    - Concepto del servicio
    - Cantidad (ej: 1 sesión)
    - Precio unitario
    - Total
  - **Método de pago**
  - **Footer**: "Gracias por su preferencia"
- ✅ Formato PDF generado con react-pdf
- ✅ Botones:
  - "Descargar PDF"
  - "Imprimir"
  - "Enviar por Email" (futuro)
- ✅ Factura se almacena en Supabase Storage (futuro) o genera on-demand

**Diseño:**
- Profesional, limpio, fácil de leer
- Compatible con impresoras térmicas de recibos

---

#### User Story PAG-003: Ver Lista de Pagos con Filtros
**Como** administrador
**Quiero** ver todos los pagos registrados
**Para** analizar ingresos y cobranza

**Criterios de Aceptación:**
- ✅ Vista en [/dashboard/pagos](src/app/dashboard/pagos/page.tsx)
- ✅ Tabla con columnas:
  - Fecha
  - Paciente
  - Concepto
  - Monto
  - Método de pago
  - Estado
  - Número de factura
  - Acciones (ver factura, editar - futuro)
- ✅ Filtros:
  - Por paciente (select)
  - Por rango de fechas (date picker)
  - Por método de pago (checkboxes)
  - Por estado (completado, pendiente, cancelado, reembolsado)
- ✅ Totales:
  - Total de la página actual
  - Total del periodo filtrado
  - Desglose por método de pago
- ✅ Exportar a Excel (futuro)
- ✅ Paginación (50 registros por página)

---

#### User Story PAG-004: Gestionar Pagos Pendientes
**Como** recepcionista
**Quiero** ver qué pacientes tienen pagos pendientes
**Para** hacer seguimiento de cobranza

**Criterios de Aceptación:**
- ✅ Vista/filtro de pagos con estado `pending`
- ✅ Lista ordenada por fecha (más antiguos primero)
- ✅ Para cada pago pendiente:
  - Nombre del paciente
  - Monto adeudado
  - Días de retraso
  - Botón "Marcar como Pagado"
  - Botón "Enviar Recordatorio" (futuro)
- ✅ Alertas:
  - Badge rojo si > 30 días
  - Badge amarillo si 15-30 días
- ✅ Total adeudado visible en dashboard principal

**Proceso de Cobranza:**
- Futuro: envío automático de recordatorios por email/SMS

---

### 5.8 Reportes y Analytics

#### User Story REP-001: Dashboard de KPIs
**Como** administrador
**Quiero** ver métricas clave al entrar al sistema
**Para** tener visibilidad del desempeño de la clínica

**Criterios de Aceptación:**
- ✅ Dashboard en [/dashboard](src/app/dashboard/page.tsx) al login
- ✅ KPIs en cards grandes:
  - **Pacientes activos**: Conteo de pacientes con `active: true`
  - **Citas del día**: Conteo de citas para hoy
  - **Ingresos del mes**: Suma de pagos `completed` del mes actual
  - **Pagos pendientes**: Suma de pagos con estado `pending`
- ✅ Cada card con:
  - Número grande
  - Icono representativo
  - Comparación con periodo anterior (ej: "+12% vs mes pasado") - futuro
- ✅ Acceso rápido:
  - Botón "Ver Pacientes"
  - Botón "Ver Agenda"
  - Botón "Ver Pagos"
- ✅ Actualización en tiempo real (refetch cada 5 min)

---

#### User Story REP-002: Reporte de Citas y Asistencia
**Como** administrador
**Quiero** ver estadísticas de citas
**Para** medir ocupación y tasa de inasistencia

**Criterios de Aceptación:**
- ✅ Vista en [/dashboard/reportes](src/app/dashboard/reportes/page.tsx)
- ✅ Selector de rango de fechas
- ✅ Métricas mostradas:
  - Total de citas programadas
  - Citas completadas
  - Citas canceladas
  - Inasistencias (no_show)
  - Tasa de asistencia (completadas / programadas * 100)
- ✅ Desglose por:
  - Fisioterapeuta
  - Día de la semana
  - Rango horario (mañana vs tarde)
- ✅ Gráficas (futuro):
  - Barras: citas por día
  - Pie chart: distribución de estados

---

#### User Story REP-003: Reporte Financiero
**Como** administrador
**Quiero** ver análisis de ingresos
**Para** entender la salud financiera

**Criterios de Aceptación:**
- ✅ Sección en reportes para finanzas
- ✅ Selector de rango de fechas (mes actual por default)
- ✅ Métricas:
  - Total de ingresos
  - Ingresos por método de pago
  - Promedio de ingreso por sesión
  - Ingresos por fisioterapeuta (futuro)
  - Ticket promedio por paciente
- ✅ Comparación mes anterior (% crecimiento)
- ✅ Proyección de ingresos del mes (basado en citas programadas)
- ✅ Gráfica de línea: ingresos por día del mes (futuro)

---

#### User Story REP-004: Reporte de Adherencia a Ejercicios
**Como** fisioterapeuta
**Quiero** ver tasas de adherencia agregadas
**Para** identificar qué ejercicios funcionan mejor

**Criterios de Aceptación (Futuro):**
- [ ] Métricas:
  - Tasa de adherencia promedio de todos los pacientes
  - Top 10 ejercicios más prescritos
  - Top 10 ejercicios con mejor adherencia
  - Top 10 pacientes con mejor adherencia
- [ ] Filtros:
  - Por fisioterapeuta
  - Por categoría de ejercicio
  - Por rango de fechas
- [ ] Insights:
  - Alertar si adherencia global < 60%
  - Sugerir simplificar prescripciones

---

### 5.9 Configuración y Administración

#### User Story ADM-001: Configurar Información de la Clínica (Futuro)
**Como** administrador
**Quiero** configurar los datos de mi clínica
**Para** que aparezcan en facturas y sistema

**Criterios de Aceptación (Pendiente):**
- [ ] Formulario de configuración
- [ ] Campos:
  - Nombre de la clínica
  - Logo (subir imagen)
  - Dirección completa
  - Teléfono(s)
  - Email de contacto
  - Horario de atención
  - RFC (México) o Tax ID
  - Configuración de facturación
- [ ] Preview en tiempo real de cómo se verá en facturas

---

#### User Story ADM-002: Gestionar Usuarios (Fisioterapeutas, Recepcionistas) (Futuro)
**Como** administrador
**Quiero** crear cuentas para mi equipo
**Para** que cada uno tenga su propio acceso

**Criterios de Aceptación (Pendiente):**
- [ ] Lista de usuarios en configuración
- [ ] Botón "Invitar Usuario"
- [ ] Formulario:
  - Email
  - Nombre
  - Rol (fisioterapeuta, recepcionista, admin)
  - Especialidad (si es fisio)
  - Horario de disponibilidad
- [ ] Envío de invitación por email
- [ ] Usuario crea su propia contraseña al aceptar invitación
- [ ] Opción de desactivar usuario (no eliminar)

---

#### User Story ADM-003: Auditoría de Acciones (Futuro)
**Como** administrador
**Quiero** ver un log de acciones importantes
**Para** auditar quién hizo qué

**Criterios de Aceptación (Futuro):**
- [ ] Tabla `audit_log` que registra:
  - Timestamp
  - Usuario que ejecutó la acción
  - Tipo de acción (create, update, delete)
  - Tabla afectada
  - ID del registro
  - Cambios realizados (JSON)
- [ ] Vista de auditoría en configuración
- [ ] Filtros por usuario, fecha, tipo de acción
- [ ] No se puede editar ni eliminar el audit log

---

## 6. Requisitos no funcionales

Los requisitos no funcionales definen las características de calidad del sistema más allá de su funcionalidad.

### 6.1 Seguridad

#### 6.1.1 Autenticación y Autorización
**Objetivo**: Garantizar que solo usuarios autorizados accedan al sistema.

- ✅ **Autenticación**:
  - Supabase Auth con email/password
  - Hash de contraseñas con bcrypt (gestionado por Supabase)
  - Tokens JWT con expiración de 1 hora
  - Refresh tokens con rotación automática
  - Rate limiting: máximo 5 intentos de login fallidos en 15 minutos
  - Protección contra ataques de fuerza bruta

- ✅ **Autorización**:
  - Row Level Security (RLS) en todas las tablas
  - Políticas RLS basadas en `auth.uid()` y roles
  - Validación de permisos en frontend (UI) y backend (base de datos)
  - Principio de mínimo privilegio: usuarios solo acceden a lo necesario

- [ ] **Pendiente** (Futuro):
  - Two-Factor Authentication (2FA) vía SMS/email
  - Single Sign-On (SSO) con Google/Microsoft (para empresas)
  - Biometric authentication en app móvil

**Métricas:**
- 0 brechas de seguridad en autenticación
- < 0.1% de intentos de acceso no autorizados exitosos

---

#### 6.1.2 Encriptación de Datos
**Objetivo**: Proteger datos sensibles en tránsito y en reposo.

- ✅ **En tránsito**:
  - HTTPS obligatorio (TLS 1.3)
  - Certificados SSL gestionados por Supabase/Vercel
  - API requests siempre sobre HTTPS
  - Cookies con flags `secure`, `httpOnly`, `sameSite=strict`

- ✅ **En reposo**:
  - PostgreSQL encryption at rest (AES-256) por Supabase
  - Backup encriptados automáticamente
  - Datos sensibles (contraseñas) nunca almacenados en texto plano

- [ ] **Pendiente**:
  - Encriptación de campos específicos (ej: números de seguro social) - si aplica
  - Key rotation automática

**Compliance:**
- Cumplimiento con estándares HIPAA para datos de salud (preparación para certificación futura)
- Cumplimiento con GDPR para datos personales (EU)
- Cumplimiento con Ley Federal de Protección de Datos Personales (México)

---

#### 6.1.3 Backups y Recuperación
**Objetivo**: Garantizar recuperabilidad ante pérdida de datos.

- ✅ **Backups Automáticos** (Supabase):
  - Backup diario completo de base de datos
  - Retención de 7 días en plan Pro
  - Point-in-Time Recovery (PITR) disponible
  - Backups almacenados en múltiples zonas geográficas

- [ ] **Pendiente** (Configuración manual):
  - Backup semanal exportado a almacenamiento externo (AWS S3 o Google Cloud Storage)
  - Testing trimestral de restauración de backups
  - Documentación de procedimiento de disaster recovery

**Métricas:**
- RPO (Recovery Point Objective): < 24 horas (pérdida máxima de datos)
- RTO (Recovery Time Objective): < 4 horas (tiempo para restaurar servicio)
- 100% de backups exitosos mensuales

---

#### 6.1.4 Privacidad y Protección de Datos
**Objetivo**: Cumplir con regulaciones de privacidad de datos médicos.

- ✅ **Implementado**:
  - Anonimización de datos en logs (no almacenar PII en logs de error)
  - Acceso granular basado en roles (fisios no ven datos de otros fisios)
  - Soft delete: datos nunca se eliminan físicamente (compliance)

- [ ] **Pendiente**:
  - Derecho al olvido: funcionalidad para eliminar datos de paciente a solicitud (GDPR)
  - Exportación de datos personales en formato portable
  - Consentimiento explícito del paciente para almacenar datos (checkbox en registro)
  - Política de privacidad y términos de servicio
  - Cookie consent banner (si se usan cookies de analytics)

**Auditoría:**
- Log de acceso a expedientes sensibles (quién vio qué y cuándo)
- Reporte trimestral de compliance para administradores

---

### 6.2 Performance

#### 6.2.1 Tiempos de Respuesta
**Objetivo**: Garantizar experiencia de usuario fluida y responsiva.

| Operación | Target (p95) | Current |
|-----------|--------------|---------|
| Carga de página (Time to First Byte) | < 100ms | ~80ms |
| Renderizado inicial (First Contentful Paint) | < 1s | ~800ms |
| Interactividad completa (Time to Interactive) | < 2s | ~1.5s |
| Query a base de datos | < 300ms | ~150ms |
| Búsqueda de pacientes (typeahead) | < 200ms | ~120ms |
| Carga de calendario semanal | < 500ms | ~400ms |
| Generación de PDF de factura | < 2s | ~1.5s |

**Optimizaciones Implementadas:**
- ✅ Server-Side Rendering (SSR) con Next.js para páginas críticas
- ✅ Static Generation para páginas de login y landing
- ✅ Lazy loading de componentes pesados (FullCalendar)
- ✅ Debouncing en búsquedas (300ms)
- ✅ Paginación de resultados (límite 50 por página)
- ✅ Índices en base de datos para queries frecuentes

**Pendiente:**
- [ ] Image optimization con Next.js Image component
- [ ] Caching de queries con React Query / SWR
- [ ] CDN para assets estáticos (imágenes, videos de ejercicios)
- [ ] Database connection pooling optimization

---

#### 6.2.2 Escalabilidad
**Objetivo**: Soportar crecimiento de usuarios sin degradación de performance.

**Capacidad Actual:**
- Concurrencia: Hasta 100 usuarios simultáneos sin degradación
- Base de datos: 10GB storage (suficiente para 1,000+ clínicas)
- Transacciones: ~50 queries/segundo en horas pico

**Target de Escalabilidad:**
| Métrica | 6 meses | 12 meses | 24 meses |
|---------|---------|----------|----------|
| Usuarios concurrentes | 500 | 2,000 | 10,000 |
| Clínicas activas | 100 | 500 | 2,000 |
| Pacientes totales | 10K | 50K | 200K |
| Transacciones/seg | 200 | 1,000 | 5,000 |
| Storage (DB) | 50GB | 200GB | 1TB |

**Plan de Escalamiento:**
1. **0-100 clínicas**: Arquitectura actual suficiente
2. **100-500 clínicas**:
   - Upgrade a Supabase Pro plan
   - Implementar caching agresivo con Redis
   - CDN para archivos multimedia
3. **500-2000 clínicas**:
   - Database sharding por clínica
   - Microservicios para módulos pesados (PDF generation, analytics)
   - Kubernetes para orquestación de containers

**Bottlenecks Identificados:**
- Generación de PDFs (CPU-intensive) → mover a worker queue
- Queries de reportes sin índices → crear índices compuestos
- Carga de calendario con 100+ citas → implementar virtualización

---

#### 6.2.3 Monitoreo y Observabilidad
**Objetivo**: Detectar y resolver problemas de performance proactivamente.

**Herramientas:**
- [ ] **APM (Application Performance Monitoring)**:
  - Opción 1: Vercel Analytics (integrado con Next.js)
  - Opción 2: New Relic / Datadog
  - Métricas: response time, error rate, throughput

- [ ] **Error Tracking**:
  - Sentry para captura de errores en producción
  - Alertas automáticas vía Slack/Email
  - Source maps para debugging

- [ ] **Database Monitoring**:
  - Supabase Dashboard para query performance
  - Alertas de slow queries (> 1s)
  - Monitoring de connection pool

**Métricas Clave (KPIs técnicos):**
- Uptime: 99.5% mensual
- Error rate: < 0.1%
- Mean Time to Detection (MTTD): < 5 minutos
- Mean Time to Recovery (MTTR): < 1 hora

---

### 6.3 Disponibilidad y Confiabilidad

#### 6.3.1 Uptime
**Objetivo**: Mantener el servicio disponible 24/7 con mínimas interrupciones.

**SLA (Service Level Agreement):**
- **Target**: 99.5% uptime mensual
  - Downtime permitido: ~3.6 horas/mes
  - Downtime permitido: ~50 minutos/semana

**Redundancia:**
- ✅ Base de datos replicada en múltiples zonas (Supabase)
- ✅ Hosting en Vercel con auto-scaling
- ✅ Failover automático en caso de caída de zona

**Mantenimiento Programado:**
- Ventanas de mantenimiento: Domingos 2-4 AM (horario con menor tráfico)
- Notificación con 48 horas de anticipación vía email
- Duración máxima: 1 hora

---

#### 6.3.2 Tolerancia a Fallos
**Objetivo**: El sistema debe degradar gracefully en caso de fallos parciales.

**Escenarios:**
1. **Supabase caído**:
   - Frontend muestra mensaje: "Estamos experimentando problemas técnicos. Intente en unos minutos"
   - Retry automático cada 30 segundos
   - No se pierde información en formularios (localStorage)

2. **API lenta (> 5s)**:
   - Mostrar loading spinner
   - Opción de cancelar request
   - Timeout después de 10s

3. **Error en generación de PDF**:
   - Mostrar error claro al usuario
   - Opción de "Reintentar" o "Reportar problema"
   - Factura se guarda en BD aunque PDF falle (generar después)

**Circuit Breaker Pattern:**
- Después de 5 errores consecutivos en una operación, pausar intentos por 1 minuto
- Evitar cascading failures

---

### 6.4 Usabilidad

#### 6.4.1 Accesibilidad
**Objetivo**: El sistema debe ser usable por personas con diferentes capacidades.

**Estándares:**
- [ ] Cumplimiento con WCAG 2.1 Level AA
  - Contraste de colores mínimo 4.5:1
  - Navegación completa por teclado (tab, enter, esc)
  - Screen reader friendly (ARIA labels)
  - Textos alternativos en imágenes
  - Formularios con labels explícitos

**Testing:**
- Herramientas: Lighthouse Accessibility Audit
- Target score: > 90

---

#### 6.4.2 Responsividad
**Objetivo**: Funcionalidad completa en desktop, tablet y móvil.

**Breakpoints de Tailwind:**
- Mobile: < 640px (sm)
- Tablet: 640px - 1024px (md, lg)
- Desktop: > 1024px (xl, 2xl)

**Prioridades de Diseño:**
1. **Mobile-first para portal de pacientes** (mayoría usa smartphone)
2. **Desktop-first para dashboard de clínica** (mayoría usa computadora)

**Testing:**
- Browsers: Chrome, Safari, Firefox (últimas 2 versiones)
- Devices: iPhone 12+, Samsung Galaxy, iPad, Desktop

---

#### 6.4.3 Internacionalización (i18n)
**Objetivo** (Futuro): Soportar múltiples idiomas y regiones.

**Fase 1**: Solo español (México)
**Fase 2** (2027):
- Español (España, Colombia, Argentina)
- Inglés (US, Canadá)
- Portugués (Brasil)

**Consideraciones:**
- Fechas en formato local (DD/MM/YYYY vs MM/DD/YYYY)
- Moneda local (MXN, USD, BRL)
- Traducción de interfaz con next-i18next

---

### 6.5 Mantenibilidad

#### 6.5.1 Calidad de Código
**Objetivo**: Código limpio, bien documentado y fácil de mantener.

**Estándares:**
- ✅ TypeScript strict mode
- ✅ ESLint configurado con reglas estrictas
- ✅ Prettier para formato consistente
- [ ] Husky para pre-commit hooks
- [ ] Code coverage > 70% (testing - futuro)

**Documentación:**
- ✅ README con instrucciones de setup
- ✅ Tipos TypeScript documentados
- [ ] Comentarios JSDoc en funciones complejas
- [ ] Architectural Decision Records (ADR) para decisiones importantes

---

#### 6.5.2 Versionado y Deployment
**Objetivo**: Despliegues seguros y rastreables.

**Estrategia de Branches:**
- `main`: código en producción (protected)
- `develop`: staging para QA
- `feature/*`: features en desarrollo

**CI/CD:**
- [ ] GitHub Actions para testing automático en PRs
- [ ] Deploy preview automático en Vercel para cada PR
- [ ] Deploy a producción solo desde `main` con aprobación manual

**Versionado Semántico:**
- MAJOR.MINOR.PATCH (ej: 2.1.3)
- Tag en cada release

---

### 6.6 Compatibilidad

#### 6.6.1 Navegadores Soportados
| Navegador | Versión Mínima |
|-----------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

**No soportado**: Internet Explorer (EOL)

---

#### 6.6.2 Dispositivos
**Desktop:**
- Resolución mínima: 1280x720
- Recomendada: 1920x1080

**Móvil:**
- iOS 14+
- Android 10+

---

### 6.7 Regulaciones y Compliance

#### 6.7.1 Datos Médicos
**Regulaciones Aplicables:**
- **México**: NOM-024-SSA3-2013 (Sistemas de información de registro electrónico)
- **US** (futuro): HIPAA para Protected Health Information (PHI)
- **EU** (futuro): GDPR para datos personales sensibles

**Requisitos:**
- [ ] Política de privacidad visible y aceptada por usuarios
- [ ] Consentimiento informado del paciente para almacenar datos
- [ ] Derecho de acceso, rectificación y eliminación de datos
- [ ] Notificación de brechas de seguridad dentro de 72 horas (GDPR)

---

#### 6.7.2 Facturación Electrónica
**México** (Futuro - Fase 4):
- Integración con PAC (Proveedor Autorizado de Certificación) para CFDI
- Cumplimiento con requisitos del SAT
- Almacenamiento de facturas por 5 años

---

## 7. Arquitectura técnica

Esta sección describe la arquitectura de software y decisiones técnicas del sistema Clinova.

### 7.1 Visión General de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Next.js 15 (App Router)                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │   Pages      │  │  Components  │  │  Hooks   │  │   │
│  │  │ (RSC + CSR)  │  │  (shadcn/ui) │  │  (React) │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │  Middleware  │  │    Utils     │                │   │
│  │  │   (Auth)     │  │  (Supabase)  │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS / REST API
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Supabase (BaaS)                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │   │
│  │  │   Auth       │  │  PostgreSQL  │  │ Storage  │  │   │
│  │  │ (JWT tokens) │  │ (RLS enabled)│  │ (S3-like)│  │   │
│  │  └──────────────┘  └──────────────┘  └──────────┘  │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │  Edge Funcs  │  │   Realtime   │                │   │
│  │  │ (Serverless) │  │ (WebSockets) │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

### 7.2 Stack Tecnológico Detallado

#### 7.2.1 Frontend

##### Core Framework
**Next.js 15.1.1** - React framework con SSR/SSG
- **Por qué Next.js:**
  - Server-Side Rendering para SEO y performance
  - File-based routing (simplicidad)
  - API routes para endpoints simples
  - Image optimization out-of-the-box
  - Ecosystem maduro con gran soporte

**Patrón de Arquitectura**: App Router (nueva arquitectura de Next.js 13+)
- Server Components por defecto (menos JavaScript al cliente)
- Client Components solo cuando se necesita interactividad
- Streaming y Suspense para better UX

##### Lenguaje
**TypeScript 5.x** - JavaScript con tipado estático
- **Beneficios**:
  - Type safety en compile-time (menos bugs)
  - IntelliSense mejorado en VSCode
  - Refactoring seguro
  - Documentación implícita vía tipos

**Configuración**:
```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true
}
```

##### Styling
**Tailwind CSS 4** - Utility-first CSS framework
- **Por qué Tailwind:**
  - Desarrollo rápido (no escribir CSS custom)
  - Consistencia de diseño
  - Tree-shaking automático (CSS mínimo en producción)
  - Responsive design fácil

**Alternativas evaluadas y descartadas:**
- Material-UI: Demasiado opinionado, bundle size grande
- Chakra UI: Bueno pero menos popular que Tailwind
- CSS Modules: Mucho boilerplate, difícil de mantener

##### UI Components
**shadcn/ui** - Componentes de UI copiables (no npm package)
- Basado en Radix UI (accesibilidad out-of-the-box)
- Customizable con Tailwind
- No lock-in de vendor

**Componentes personalizados:**
- [Header](src/components/layout/Header.tsx)
- [Sidebar](src/components/layout/Sidebar.tsx)
- [LoginForm](src/components/auth/LoginForm.tsx)
- [CalendarView](src/components/agenda/CalendarView.tsx) (FullCalendar wrapper)

##### Form Management
**React Hook Form** - Librería de formularios performant
- **Por qué:**
  - Menos re-renders (mejor performance)
  - Validación integrada con Zod
  - API intuitiva

**Ejemplo de uso:**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(patientSchema)
});
```

##### State Management
**Enfoque actual**: React built-in state (useState, useContext)
- Suficiente para MVP
- No hay estado global complejo todavía

**Futuro** (si se requiere):
- Zustand para estado global ligero
- React Query para server state caching

##### Calendar
**FullCalendar 6.x** - Librería de calendario completa
- Vista semanal/mensual/diaria
- Drag & drop
- Integración con eventos de clic

---

#### 7.2.2 Backend (Supabase)

##### Base de Datos
**PostgreSQL 15** (gestionado por Supabase)
- **Por qué PostgreSQL:**
  - Relacional (datos estructurados)
  - ACID compliant (integridad de datos críticos de salud)
  - JSON support para campos flexibles (alergias, medicamentos)
  - Extensiones ricas (pg_cron para tareas programadas - futuro)

**Row Level Security (RLS)**:
- Políticas a nivel de base de datos (no solo en código)
- Protección contra SQL injection
- Multi-tenancy seguro

**Ejemplo de política RLS:**
```sql
CREATE POLICY "Users can only view their clinic's patients"
ON patients FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id
    FROM user_clinics
    WHERE user_id = auth.uid()
  )
);
```

##### Autenticación
**Supabase Auth**
- Built-in JWT tokens
- Email/password authentication
- OAuth providers listos (Google, GitHub - futuro)
- Hooks para lógica custom (ej: asignar role al crear usuario)

##### Storage
**Supabase Storage** (S3-compatible)
- **Uso actual**: Planificado para futuro
  - Videos de ejercicios
  - Imágenes de ejercicios
  - Fotos de progreso de pacientes
  - PDFs de estudios médicos

- **Configuración**:
  - Buckets públicos para imágenes de ejercicios
  - Buckets privados para documentos de pacientes (RLS)

##### Edge Functions (Serverless)
**Deno runtime** - Funciones serverless en Supabase
- **Uso futuro**:
  - Generación de PDFs pesados (mover de cliente a servidor)
  - Envío de emails/SMS
  - Procesamiento de webhooks de pasarelas de pago

---

#### 7.2.3 Hosting y Deploy

##### Frontend Hosting
**Vercel** - Platform optimizada para Next.js
- **Beneficios**:
  - Deploy automático en cada push a GitHub
  - Preview deployments para cada PR
  - Edge network global (CDN)
  - Serverless functions para API routes
  - Analytics incluido

**Configuración:**
- Production: Deploy desde branch `main`
- Staging: Deploy desde branch `develop`
- Feature branches: Preview URLs automáticas

##### Backend Hosting
**Supabase Cloud**
- Región: US East (más cercana a LATAM)
- Plan: Free (actual) → Pro (cuando supere límites)

**Límites del plan Free:**
- 500MB storage
- 2GB bandwidth/mes
- Suficiente para primeras 20-30 clínicas

---

### 7.3 Decisiones de Arquitectura (ADRs)

#### ADR-001: Por qué Supabase vs. Backend Custom

**Contexto:**
Necesitamos un backend para manejar autenticación, base de datos y storage.

**Opciones consideradas:**
1. **Supabase** (BaaS)
2. Backend custom con Node.js + Express + PostgreSQL
3. Firebase (BaaS de Google)

**Decisión:** Supabase

**Razones:**
- ✅ Open source (no lock-in, podemos self-host en el futuro)
- ✅ PostgreSQL (base de datos robusta y familiar)
- ✅ Row Level Security nativa (seguridad por defecto)
- ✅ Desarrollo más rápido (no mantener infraestructura)
- ✅ Costo bajo en etapa inicial
- ✅ Ecosystem de Next.js bien integrado

**Desventajas aceptadas:**
- ❌ Menos control sobre infraestructura
- ❌ Vendor lock-in parcial (mitigado por ser open source)

---

#### ADR-002: Por qué Next.js App Router vs. Pages Router

**Contexto:**
Next.js tiene dos sistemas de routing: Pages (legacy) y App Router (nuevo en v13+).

**Decisión:** App Router

**Razones:**
- ✅ Server Components por defecto (menos JS al cliente)
- ✅ Streaming y Suspense para mejor UX
- ✅ Layouts compartidos más fáciles
- ✅ Futuro de Next.js (Pages será deprecado eventualmente)
- ✅ Loading states y error boundaries más simples

**Desventajas aceptadas:**
- ❌ Curva de aprendizaje más alta
- ❌ Ecosystem menos maduro (menos ejemplos en Stack Overflow)

---

#### ADR-003: Por qué NO usar GraphQL

**Contexto:**
Supabase soporta tanto REST API como GraphQL vía PostgREST.

**Decisión:** Usar REST API (PostgREST)

**Razones:**
- ✅ Simplicidad: REST es más simple para equipo pequeño
- ✅ Performance: No necesitamos resolver el problema de over-fetching todavía
- ✅ Debugging más fácil: Herramientas de dev más maduras para REST
- ✅ RLS funciona mejor con REST

**Reevaluación futura:**
- Considerar GraphQL si tenemos > 50 queries diferentes y problemas de over-fetching

---

#### ADR-004: Generación de PDFs en Cliente vs. Servidor

**Contexto:**
Necesitamos generar facturas PDF.

**Opciones:**
1. Cliente (react-pdf en navegador)
2. Servidor (Edge Function con Puppeteer/Playwright)

**Decisión:** Cliente (actual) → mover a servidor (futuro)

**Razones para cliente:**
- ✅ Implementación rápida en MVP
- ✅ No requiere Edge Function
- ✅ Facturas simples (< 1 página)

**Plan de migración a servidor:**
- Cuando facturas sean más complejas
- Cuando necesitemos generar múltiples PDFs (batch)
- Cuando queramos almacenar PDFs en Storage automáticamente

---

### 7.4 Flujo de Datos

#### Ejemplo: Crear un Paciente

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│ Usuario  │      │ Next.js  │      │ Supabase │      │ Postgres │
│ (Browser)│      │  Client  │      │   API    │      │    DB    │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                 │                 │
     │ 1. Llena form   │                 │                 │
     │────────────────>│                 │                 │
     │                 │                 │                 │
     │ 2. Submit       │                 │                 │
     │────────────────>│                 │                 │
     │                 │                 │                 │
     │                 │ 3. Validación   │                 │
     │                 │    (Zod)        │                 │
     │                 │                 │                 │
     │                 │ 4. POST /rest/v1/patients         │
     │                 │─────────────────>                 │
     │                 │   (con JWT)     │                 │
     │                 │                 │                 │
     │                 │                 │ 5. Verify JWT   │
     │                 │                 │ 6. Check RLS    │
     │                 │                 │                 │
     │                 │                 │ 7. INSERT INTO  │
     │                 │                 │    patients     │
     │                 │                 │────────────────>│
     │                 │                 │                 │
     │                 │                 │ 8. Return ID    │
     │                 │                 │<────────────────│
     │                 │                 │                 │
     │                 │ 9. 201 Created  │                 │
     │                 │<─────────────────                 │
     │                 │                 │                 │
     │ 10. Redirect to │                 │                 │
     │     /pacientes/[id]                │                 │
     │<────────────────│                 │                 │
```

---

### 7.5 Seguridad en Capas

```
Layer 1: Network
  ├─ HTTPS/TLS obligatorio
  ├─ CORS configurado
  └─ Rate limiting (Vercel + Supabase)

Layer 2: Authentication
  ├─ JWT tokens (1h expiration)
  ├─ Refresh tokens rotados
  └─ Logout invalida tokens

Layer 3: Authorization
  ├─ Row Level Security (RLS) en DB
  ├─ Validación de permisos en queries
  └─ UI oculta acciones no permitidas

Layer 4: Application
  ├─ Validación de inputs (Zod)
  ├─ SQL injection protection (parametrized queries)
  ├─ XSS protection (React escapes automáticamente)
  └─ CSRF protection (SameSite cookies)

Layer 5: Data
  ├─ Encryption at rest (AES-256)
  ├─ Encryption in transit (TLS)
  └─ Backups encriptados
```

---

## 8. Modelo de datos (alto nivel)

Esta sección describe el esquema de base de datos completo con relaciones, tipos y constraints.

### 8.1 Diagrama Entidad-Relación (ERD)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   clinics   │◄────────│    users     │────────►│user_clinics │
└─────────────┘ 1     n └──────────────┘ n     n └─────────────┘
                               │ 1
                               │
                               │ n
                        ┌──────▼───────┐
                        │   patients   │
                        └──────┬───────┘
                               │ 1
          ┌────────────────────┼────────────────────┐
          │ n                  │ n                  │ n
  ┌───────▼────────┐  ┌────────▼──────┐  ┌─────────▼────────┐
  │  appointments  │  │medical_history│  │exercise_prescrip.│
  └───────┬────────┘  └───────────────┘  └─────────┬────────┘
          │ 1                                       │ n
          │ n                                       │ 1
  ┌───────▼────────┐                      ┌─────────▼────────┐
  │   sessions     │                      │   exercises      │
  └───────┬────────┘                      └──────────────────┘
          │ 1
          │ n
  ┌───────▼────────┐
  │    payments    │
  └────────────────┘
```

---

### 8.2 Tablas Principales

#### 8.2.1 clinics
**Descripción**: Información de cada clínica (multi-tenant).

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único de clínica |
| name | VARCHAR(200) | NOT NULL | Nombre de la clínica |
| slug | VARCHAR(100) | UNIQUE, NOT NULL | Slug para URLs (ej: fisio-cdmx) |
| logo_url | TEXT | NULL | URL del logo |
| address | TEXT | NULL | Dirección completa |
| phone | VARCHAR(20) | NULL | Teléfono principal |
| email | VARCHAR(100) | NULL | Email de contacto |
| tax_id | VARCHAR(50) | NULL | RFC (México) / Tax ID |
| subscription_plan | ENUM | DEFAULT 'free' | Plan: free, pro, enterprise |
| subscription_status | ENUM | DEFAULT 'active' | Estado: active, trial, cancelled |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Última actualización |

**Índices:**
- `idx_clinics_slug` en `slug`

---

#### 8.2.2 users
**Descripción**: Usuarios del sistema (fisioterapeutas, recepcionistas, admins).

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users | ID del usuario (Supabase Auth) |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email (sincronizado con auth.users) |
| first_name | VARCHAR(100) | NULL | Nombre(s) |
| last_name | VARCHAR(100) | NULL | Apellido(s) |
| role | ENUM | NOT NULL | Role: admin, therapist, receptionist |
| phone | VARCHAR(20) | NULL | Teléfono |
| specialties | TEXT[] | NULL | Especialidades (solo therapists) |
| avatar_url | TEXT | NULL | URL de foto de perfil |
| active | BOOLEAN | DEFAULT TRUE | Usuario activo |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Última actualización |

**Relación:**
- `id` es FK a `auth.users(id)` (tabla de Supabase Auth)

**Índices:**
- `idx_users_email` en `email`
- `idx_users_role` en `role`

---

#### 8.2.3 user_clinics (Tabla de unión many-to-many)
**Descripción**: Relación entre usuarios y clínicas (un usuario puede pertenecer a múltiples clínicas).

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| user_id | UUID | FK → users(id), NOT NULL | ID del usuario |
| clinic_id | UUID | FK → clinics(id), NOT NULL | ID de la clínica |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de asignación |

**Constraint único:**
- `UNIQUE(user_id, clinic_id)` - Un usuario no puede estar duplicado en la misma clínica

---

#### 8.2.4 patients
**Descripción**: Pacientes de la clínica.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único del paciente |
| clinic_id | UUID | FK → clinics(id), NOT NULL | Clínica a la que pertenece |
| first_name | VARCHAR(100) | NOT NULL | Nombre(s) |
| last_name | VARCHAR(100) | NOT NULL | Apellido(s) |
| date_of_birth | DATE | NOT NULL | Fecha de nacimiento |
| gender | ENUM | NOT NULL | Género: male, female, other |
| email | VARCHAR(255) | NULL | Email del paciente |
| phone | VARCHAR(20) | NOT NULL | Teléfono principal |
| address | TEXT | NULL | Dirección completa |
| occupation | VARCHAR(100) | NULL | Ocupación |
| emergency_contact_name | VARCHAR(200) | NULL | Nombre de contacto de emergencia |
| emergency_contact_phone | VARCHAR(20) | NULL | Teléfono de emergencia |
| emergency_contact_relationship | VARCHAR(50) | NULL | Relación (madre, esposo, etc.) |
| active | BOOLEAN | DEFAULT TRUE | Paciente activo |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de registro |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Última actualización |

**Índices:**
- `idx_patients_clinic_id` en `clinic_id`
- `idx_patients_active` en `active`
- `idx_patients_full_name` en `(first_name, last_name)`
- Full-text search index (futuro) en `first_name || ' ' || last_name`

---

#### 8.2.5 medical_history
**Descripción**: Historial médico del paciente (relación 1-1 con patients).

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| patient_id | UUID | FK → patients(id), UNIQUE, NOT NULL | ID del paciente |
| allergies | TEXT[] | DEFAULT ARRAY[]::TEXT[] | Alergias (array) |
| chronic_conditions | TEXT[] | DEFAULT ARRAY[]::TEXT[] | Condiciones crónicas |
| medications | JSONB | DEFAULT '[]'::JSONB | Medicamentos actuales [{name, dose}] |
| surgeries | JSONB | DEFAULT '[]'::JSONB | Cirugías previas [{procedure, date}] |
| family_history | TEXT | NULL | Antecedentes familiares |
| lifestyle_notes | TEXT | NULL | Notas de estilo de vida |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Última actualización |

**Ejemplo de medications JSONB:**
```json
[
  {"name": "Ibuprofeno", "dose": "400mg cada 8 horas"},
  {"name": "Omeprazol", "dose": "20mg en ayunas"}
]
```

---

#### 8.2.6 initial_assessments
**Descripción**: Evaluación inicial del paciente (primera consulta).

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| patient_id | UUID | FK → patients(id), UNIQUE, NOT NULL | ID del paciente (solo 1 evaluación inicial) |
| chief_complaint | TEXT | NOT NULL | Motivo de consulta |
| pain_location | VARCHAR(200) | NULL | Ubicación del dolor |
| pain_intensity | INTEGER | CHECK (>= 0 AND <= 10) | Intensidad 0-10 |
| pain_duration | VARCHAR(50) | NULL | Duración (agudo, subagudo, crónico) |
| pain_type | VARCHAR(100) | NULL | Tipo de dolor |
| functional_limitations | TEXT | NULL | Limitaciones funcionales |
| treatment_goals | TEXT | NULL | Objetivos del tratamiento |
| diagnosis | TEXT | NOT NULL | Impresión diagnóstica |
| prognosis | TEXT | NULL | Pronóstico estimado |
| therapist_id | UUID | FK → users(id), NOT NULL | Fisioterapeuta que realizó la evaluación |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de evaluación |

---

#### 8.2.7 patient_measurements
**Descripción**: Mediciones objetivas (ROM, fuerza, balance).

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| patient_id | UUID | FK → patients(id), NOT NULL | ID del paciente |
| measurement_type | ENUM | NOT NULL | Tipo: rom, strength, balance |
| measurement_subtype | VARCHAR(100) | NULL | Subtipo (ej: shoulder_flexion) |
| value | NUMERIC | NOT NULL | Valor medido |
| unit | VARCHAR(20) | NOT NULL | Unidad (degrees, scale_0_5, points) |
| side | ENUM | NULL | Lado: left, right, bilateral |
| notes | TEXT | NULL | Notas adicionales |
| measured_by | UUID | FK → users(id), NOT NULL | Fisioterapeuta que midió |
| measured_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de medición |

**Índices:**
- `idx_measurements_patient_type` en `(patient_id, measurement_type)`

---

#### 8.2.8 appointments
**Descripción**: Citas agendadas.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| clinic_id | UUID | FK → clinics(id), NOT NULL | Clínica |
| patient_id | UUID | FK → patients(id), NOT NULL | Paciente |
| therapist_id | UUID | FK → users(id), NOT NULL | Fisioterapeuta |
| title | VARCHAR(200) | NULL | Título de la cita |
| start_time | TIMESTAMPTZ | NOT NULL | Hora de inicio |
| end_time | TIMESTAMPTZ | NOT NULL | Hora de fin |
| status | ENUM | DEFAULT 'scheduled' | Estado: scheduled, completed, cancelled, no_show |
| notes | TEXT | NULL | Notas adicionales |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Última actualización |

**Constraints:**
- `CHECK (end_time > start_time)`

**Índices:**
- `idx_appts_therapist_date` en `(therapist_id, start_time)`
- `idx_appts_patient` en `patient_id`
- `idx_appts_status` en `status`

**RLS Policy Ejemplo:**
```sql
-- Fisioterapeutas solo ven sus propias citas
CREATE POLICY "Therapists see own appointments"
ON appointments FOR SELECT
USING (therapist_id = auth.uid());

-- Recepcionistas ven todas las citas de su clínica
CREATE POLICY "Receptionists see all clinic appointments"
ON appointments FOR SELECT
USING (
  clinic_id IN (
    SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid()
  )
  AND (SELECT role FROM users WHERE id = auth.uid()) = 'receptionist'
);
```

---

#### 8.2.9 sessions
**Descripción**: Notas de sesión SOAP.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| appointment_id | UUID | FK → appointments(id), NULL | Cita asociada (opcional) |
| patient_id | UUID | FK → patients(id), NOT NULL | Paciente |
| therapist_id | UUID | FK → users(id), NOT NULL | Fisioterapeuta |
| subjective | TEXT | NOT NULL | S - Subjetivo |
| objective | TEXT | NOT NULL | O - Objetivo |
| assessment | TEXT | NOT NULL | A - Assessment |
| plan | TEXT | NOT NULL | P - Plan |
| pain_level | INTEGER | CHECK (>= 0 AND <= 10) | Nivel de dolor 0-10 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de la sesión |

**Índices:**
- `idx_sessions_patient` en `patient_id`
- `idx_sessions_therapist_date` en `(therapist_id, created_at)`

---

#### 8.2.10 exercises
**Descripción**: Biblioteca de ejercicios.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| clinic_id | UUID | FK → clinics(id), NOT NULL | Clínica (biblioteca por clínica) |
| name | VARCHAR(200) | NOT NULL | Nombre del ejercicio |
| description | TEXT | NULL | Descripción breve |
| category | ENUM | NOT NULL | Categoría: stretching, strengthening, mobility, balance, cardio, functional |
| body_part | ENUM | NOT NULL | Parte: neck, shoulder, upper_back, lumbar, hip, knee, ankle, core, general |
| difficulty_level | ENUM | NULL | Dificultad: beginner, intermediate, advanced |
| equipment_needed | VARCHAR(200) | NULL | Equipo necesario |
| video_url | TEXT | NULL | URL del video |
| image_url | TEXT | NULL | URL de la imagen |
| instructions | TEXT | NULL | Instrucciones paso a paso |
| contraindications | TEXT | NULL | Contraindicaciones |
| created_by | UUID | FK → users(id), NOT NULL | Usuario que creó el ejercicio |
| deleted | BOOLEAN | DEFAULT FALSE | Soft delete |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |

**Índices:**
- `idx_exercises_clinic_category` en `(clinic_id, category)`
- `idx_exercises_body_part` en `body_part`
- Full-text search (futuro) en `name || ' ' || description`

---

#### 8.2.11 exercise_prescriptions
**Descripción**: Ejercicios prescritos a pacientes.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| patient_id | UUID | FK → patients(id), NOT NULL | Paciente |
| exercise_id | UUID | FK → exercises(id), NOT NULL | Ejercicio |
| sets | INTEGER | NULL | Número de series |
| reps | INTEGER | NULL | Repeticiones por serie |
| duration_minutes | INTEGER | NULL | Duración en minutos |
| frequency | VARCHAR(100) | NULL | Frecuencia (ej: "2 veces al día") |
| special_instructions | TEXT | NULL | Instrucciones especiales |
| start_date | DATE | DEFAULT CURRENT_DATE | Fecha de inicio |
| end_date | DATE | NULL | Fecha de fin |
| status | ENUM | DEFAULT 'active' | Estado: active, completed, discontinued |
| prescribed_by | UUID | FK → users(id), NOT NULL | Fisioterapeuta que prescribió |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de prescripción |

**Índices:**
- `idx_prescriptions_patient_status` en `(patient_id, status)`

---

#### 8.2.12 exercise_adherence
**Descripción**: Tracking de adherencia a ejercicios por parte del paciente.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| prescription_id | UUID | FK → exercise_prescriptions(id), NOT NULL | Prescripción |
| completed_date | DATE | NOT NULL | Fecha que completó el ejercicio |
| sets_completed | INTEGER | NULL | Sets realizados |
| reps_completed | INTEGER | NULL | Reps realizados |
| pain_level | INTEGER | CHECK (>= 0 AND <= 10) | Dolor durante ejercicio 0-10 |
| notes | TEXT | NULL | Notas del paciente |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de registro |

**Constraint único:**
- `UNIQUE(prescription_id, completed_date)` - Solo una entrada por prescripción por día

---

#### 8.2.13 treatment_templates
**Descripción**: Plantillas de tratamiento reutilizables.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| clinic_id | UUID | FK → clinics(id), NOT NULL | Clínica |
| name | VARCHAR(200) | NOT NULL | Nombre de la plantilla |
| category | VARCHAR(100) | NULL | Categoría (lumbar, shoulder, etc.) |
| objectives | TEXT | NULL | Objetivos del tratamiento |
| contraindications | TEXT | NULL | Contraindicaciones |
| estimated_duration_weeks | INTEGER | NULL | Duración estimada en semanas |
| created_by | UUID | FK → users(id), NOT NULL | Creador |
| deleted | BOOLEAN | DEFAULT FALSE | Soft delete |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de creación |

---

#### 8.2.14 template_techniques
**Descripción**: Técnicas dentro de una plantilla de tratamiento.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| template_id | UUID | FK → treatment_templates(id), CASCADE | Plantilla |
| name | VARCHAR(200) | NOT NULL | Nombre de la técnica |
| duration_minutes | INTEGER | NULL | Duración en minutos |
| order_index | INTEGER | NOT NULL | Orden de aplicación |

**Constraint:**
- `UNIQUE(template_id, order_index)`

---

#### 8.2.15 patient_treatment_plans
**Descripción**: Planes de tratamiento asignados a pacientes.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| patient_id | UUID | FK → patients(id), NOT NULL | Paciente |
| template_id | UUID | FK → treatment_templates(id), NOT NULL | Plantilla base |
| status | ENUM | DEFAULT 'active' | Estado: active, completed, paused, cancelled |
| start_date | DATE | DEFAULT CURRENT_DATE | Fecha de inicio |
| end_date | DATE | NULL | Fecha de fin estimada |
| sessions_completed | INTEGER | DEFAULT 0 | Sesiones completadas |
| notes | TEXT | NULL | Notas específicas del paciente |
| assigned_by | UUID | FK → users(id), NOT NULL | Fisioterapeuta que asignó |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de asignación |

---

#### 8.2.16 payments
**Descripción**: Registro de pagos.

| Campo | Tipo | Constraints | Descripción |
|-------|------|-------------|-------------|
| id | UUID | PK, DEFAULT uuid_generate_v4() | ID único |
| clinic_id | UUID | FK → clinics(id), NOT NULL | Clínica |
| patient_id | UUID | FK → patients(id), NOT NULL | Paciente |
| session_id | UUID | FK → sessions(id), NULL | Sesión asociada (opcional) |
| amount | NUMERIC(10,2) | NOT NULL, CHECK (> 0) | Monto |
| method | ENUM | NOT NULL | Método: cash, card, transfer, insurance |
| status | ENUM | DEFAULT 'completed' | Estado: pending, completed, cancelled, refunded |
| invoice_number | VARCHAR(50) | UNIQUE, NOT NULL | Número de factura (auto-generado) |
| payment_date | DATE | DEFAULT CURRENT_DATE | Fecha de pago |
| concept | VARCHAR(200) | NULL | Concepto/descripción |
| notes | TEXT | NULL | Notas internas |
| created_by | UUID | FK → users(id), NOT NULL | Usuario que registró |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Fecha de registro |

**Índices:**
- `idx_payments_patient` en `patient_id`
- `idx_payments_date` en `payment_date`
- `idx_payments_status` en `status`

---

### 8.3 Vistas de Base de Datos (Views)

#### patient_summary
**Descripción**: Vista consolidada de información del paciente para dashboard.

```sql
CREATE VIEW patient_summary AS
SELECT
  p.id,
  p.first_name || ' ' || p.last_name AS full_name,
  p.phone,
  p.email,
  p.active,
  COUNT(DISTINCT a.id) AS total_appointments,
  COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) AS completed_sessions,
  MAX(s.created_at) AS last_session_date,
  SUM(pay.amount) AS total_paid
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN sessions s ON p.id = s.patient_id
LEFT JOIN payments pay ON p.id = pay.patient_id AND pay.status = 'completed'
GROUP BY p.id;
```

---

### 8.4 Triggers y Funciones

#### auto_update_timestamp
**Descripción**: Actualiza automáticamente `updated_at` al modificar un registro.

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas con updated_at
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 9. UX / UI

### 9.1 Principios de Diseño

#### 9.1.1 Claridad sobre Estética
**Principio**: La funcionalidad y usabilidad son más importantes que el diseño "bonito".

- ✅ Textos grandes y legibles (16px mínimo)
- ✅ Contraste alto para facilitar lectura
- ✅ Espaciado generoso entre elementos
- ✅ Botones con labels claros ("Guardar Paciente" no "Submit")

---

#### 9.1.2 Consistencia
**Principio**: Los elementos similares deben verse y comportarse igual en todo el sistema.

- ✅ Paleta de colores consistente:
  - Primario: Azul (#3B82F6) - acciones principales
  - Éxito: Verde (#10B981) - confirmaciones
  - Error: Rojo (#EF4444) - errores y alertas
  - Advertencia: Amarillo (#F59E0B) - advertencias
  - Neutral: Gris (#6B7280) - texto secundario

- ✅ Botones:
  - Primario: bg-blue-600 hover:bg-blue-700
  - Secundario: bg-gray-200 hover:bg-gray-300
  - Destructivo: bg-red-600 hover:bg-red-700

- ✅ Inputs:
  - Altura uniforme (h-10)
  - Border gris claro, focus ring azul
  - Label siempre visible (no placeholders como labels)

---

#### 9.1.3 Feedback Inmediato
**Principio**: El usuario siempre debe saber qué está pasando.

- ✅ Loading states:
  - Spinner en botones durante submit
  - Skeleton loaders en listas
  - Progress bars para operaciones largas

- ✅ Mensajes de éxito/error:
  - Toast notifications (esquina superior derecha)
  - Duración: 3s para éxito, 5s para error
  - Dismissable con X

- ✅ Validación en tiempo real:
  - Errores de forma bajo el campo
  - Checkmarks verdes en campos válidos

---

### 9.2 Wireframes Textuales

#### 9.2.1 Dashboard (Página Principal)

```
┌────────────────────────────────────────────────────────────┐
│ [Logo] Clinova                        Dr. Juan  [Logout]  │
├────────────┬───────────────────────────────────────────────┤
│            │                                               │
│ Sidebar    │           KPI Cards                           │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│ ├ Dashboard│  │Pacientes │ │ Citas    │ │ Ingresos │      │
│ ├ Pacientes│  │ Activos  │ │ del Día  │ │ del Mes  │      │
│ ├ Agenda   │  │          │ │          │ │          │      │
│ ├ Sesiones │  │   150    │ │    12    │ │ $45,000  │      │
│ ├ Ejercicios│ └──────────┘ └──────────┘ └──────────┘      │
│ ├ Plantillas│                                              │
│ ├ Pagos    │           Accesos Rápidos                     │
│ ├ Reportes │  [+ Nuevo Paciente] [Ver Agenda] [Pagos]     │
│            │                                               │
│            │           Próximas Citas                      │
│            │  ┌──────────────────────────────────────┐     │
│            │  │ 9:00 AM - Juan Pérez - Hombro       │     │
│            │  │ 10:00 AM - María García - Lumbar    │     │
│            │  │ 11:00 AM - Pedro López - Rodilla    │     │
│            │  └──────────────────────────────────────┘     │
└────────────┴───────────────────────────────────────────────┘
```

---

#### 9.2.2 Lista de Pacientes

```
┌────────────────────────────────────────────────────────────┐
│ Pacientes                                                  │
├────────────────────────────────────────────────────────────┤
│ [🔍 Buscar pacientes...]          [+ Nuevo Paciente]      │
│                                                            │
│ Filtros: [●Activos ○Inactivos ○Todos]                     │
│                                                            │
│ ┌────────────────────────────────────────────────────────┐│
│ │ Nombre           Teléfono    Email         Última Cita││
│ ├────────────────────────────────────────────────────────┤│
│ │ García, Juan     5551234567  juan@...      15 Ene 2026││
│ │ Pérez, María     5557654321  maria@...     12 Ene 2026││
│ │ López, Carlos    5559876543  carlos@...    10 Ene 2026││
│ └────────────────────────────────────────────────────────┘│
│                                                            │
│ Mostrando 1-50 de 150          [< Anterior] [Siguiente >] │
└────────────────────────────────────────────────────────────┘
```

---

#### 9.2.3 Perfil del Paciente (Tabs)

```
┌────────────────────────────────────────────────────────────┐
│ ← Volver a Pacientes                                       │
├────────────────────────────────────────────────────────────┤
│  👤 García Pérez, Juan                 Edad: 45   Activo  │
│     📞 5551234567  ✉ juan@email.com                       │
├────────────────────────────────────────────────────────────┤
│ [Info General] [Hist.Médico] [Sesiones] [Ejercicios] [Pagos]│
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Información Demográfica                                   │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Dirección: Calle Reforma 123, CDMX                   │ │
│  │ Ocupación: Ingeniero                                 │ │
│  │ Contacto Emergencia: María García (Esposa) 555...   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Alergias                                                  │
│  [🔴 Penicilina] [🔴 Polen]                               │
│                                                            │
│  Acciones Rápidas                                          │
│  [Agendar Cita] [Registrar Sesión] [Prescribir Ejercicios]│
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 9.3 Sistema de Diseño

#### 9.3.1 Tipografía

**Font Family**: Inter (Google Fonts)
- **Títulos (H1)**: 2.25rem (36px), font-bold
- **Subtítulos (H2)**: 1.875rem (30px), font-semibold
- **Sección (H3)**: 1.5rem (24px), font-semibold
- **Body**: 1rem (16px), font-normal
- **Small**: 0.875rem (14px), font-normal

---

#### 9.3.2 Espaciado
**Sistema de escala 8px** (Tailwind por defecto):
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

---

#### 9.3.3 Componentes Reutilizables

##### Button Component
```tsx
// Variantes
<Button variant="primary">Guardar</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="destructive">Eliminar</Button>
<Button variant="ghost">Editar</Button>

// Estados
<Button loading>Guardando...</Button>
<Button disabled>No Disponible</Button>
```

##### Input Component
```tsx
<Input
  label="Nombre del Paciente"
  placeholder="Ej: Juan Pérez"
  error="Campo requerido"
  required
/>
```

##### Toast Notification
```tsx
toast.success("Paciente guardado exitosamente");
toast.error("Error al guardar paciente");
toast.warning("Este paciente tiene pagos pendientes");
```

---

### 9.4 Responsividad

#### Breakpoints
- **Mobile**: < 640px (vista vertical, 1 columna)
- **Tablet**: 640-1024px (vista horizontal, 2 columnas)
- **Desktop**: > 1024px (3+ columnas, sidebar)

#### Comportamiento por Dispositivo

**Mobile (Portal de Pacientes)**:
- Navegación bottom bar en lugar de sidebar
- Cards apiladas verticalmente
- Videos en 16:9 full width
- Botones grandes (min-height: 44px para touch)

**Desktop (Dashboard Clínica)**:
- Sidebar fijo a la izquierda
- Tablas con scroll horizontal si es necesario
- Modals centrados con overlay

---

## 10. Roadmap

