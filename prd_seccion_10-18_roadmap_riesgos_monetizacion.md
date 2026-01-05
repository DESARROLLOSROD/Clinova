# PRD Clinova - Secciones 10-18 (Roadmap, Riesgos, Monetización)

Este documento complementa el PRD principal con las secciones finales detalladas.

---

## 10. Roadmap Detallado

### Estado Actual (Enero 2026)

**✅ FASE 1 - MVP (COMPLETADA - Sep-Dic 2025)**

Entregables:
- Login y autenticación con Supabase
- CRUD completo de pacientes
- Agenda semanal con FullCalendar
- Registro de notas SOAP
- Historial médico y evaluaciones iniciales
- Mediciones y valoraciones (ROM, fuerza, balance)

**✅ FASE 2 - Features Avanzadas (COMPLETADA - Nov 2025-Ene 2026)**

Entregables:
- Biblioteca de ejercicios con categorías
- Prescripción de ejercicios con dosificación
- Portal de adherencia para pacientes
- Plantillas de tratamiento reutilizables
- Sistema de pagos y facturación PDF
- Dashboard con KPIs en tiempo real
- Reportes avanzados de asistencia e ingresos

---

### 🔄 FASE 3 - Mejoras de Usabilidad y Multi-Usuario (Q1 2026)
**Duración:** 6-8 semanas | **Prioridad:** Alta

**Objetivos:**
- Permitir gestión de equipos de fisioterapeutas
- Mejorar visualización de datos
- Completar funcionalidades CRUD faltantes

**Entregables:**

**Semana 1-2: CRUD Completo**
- [ ] Editar ejercicios de biblioteca
- [ ] Eliminar ejercicios (soft delete)
- [ ] Editar plantillas de tratamiento
- [ ] Eliminar plantillas

**Semana 3-4: Multi-Usuario**
- [ ] Gestión de usuarios (crear fisioterapeutas, recepcionistas)
- [ ] Invitación por email
- [ ] Configuración de permisos granular
- [ ] Auditoría básica (quién hizo qué)

**Semana 5-6: Visualizaciones**
- [ ] Integración Chart.js o Recharts
- [ ] Gráfica de evolución de dolor del paciente
- [ ] Gráfica de ingresos últimos 12 meses
- [ ] Gráfica de adherencia a ejercicios
- [ ] Gráfica de ocupación de agenda

**Semana 7-8: Mejoras de Agenda**
- [ ] Vista mensual de calendario
- [ ] Vista diaria
- [ ] Drag & drop para reprogramar citas
- [ ] Búsqueda avanzada de pacientes (múltiples filtros)
- [ ] Edición de sesiones SOAP previas (con restricciones)
- [ ] Exportación de reportes a Excel/PDF

**Criterios de Éxito:**
- 80% de clínicas usan gestión multi-usuario
- 60% de clínicas generan reportes visuales semanalmente
- NPS mejora de 50 → 60

---

### 📋 FASE 4 - Notificaciones y Comunicación (Q2 2026)
**Duración:** 4-6 semanas | **Prioridad:** Alta

**Objetivo:** Reducir tasa de inasistencia y mejorar engagement de pacientes

**Entregables:**

**Notificaciones de Citas:**
- [ ] Recordatorios vía email:
  - 24 horas antes
  - 1 hora antes
- [ ] Recordatorios vía SMS (integración Twilio):
  - Opt-in por paciente
  - 24 horas antes
- [ ] Configuración por paciente (preferencias)
- [ ] Templates personalizables de mensajes

**Notificaciones de Ejercicios:**
- [ ] Recordatorio diario para pacientes con ejercicios activos
- [ ] Resumen semanal de adherencia vía email
- [ ] Push notifications en navegador (Web Push API)

**Comunicación:**
- [ ] Integración WhatsApp Business API
- [ ] Templates de mensajes predefinidos
- [ ] Envío masivo con personalización
- [ ] Alertas automáticas de pagos pendientes

**Costos Estimados:**
- Twilio SMS: $0.0075/SMS
- Email (SendGrid/Postmark): $0.001/email
- WhatsApp Business: $0.005/mensaje

**Métricas de Éxito:**
- Reducir inasistencia de 15% → 8%
- 60% de pacientes opt-in a notificaciones
- 25% aumento en adherencia a ejercicios

---

### 🚀 FASE 5 - Features Financieras Avanzadas (Q3 2026)
**Duración:** 6-8 semanas | **Prioridad:** Media

**Objetivo:** Profesionalizar gestión financiera

**Entregables:**

**Paquetes de Sesiones:**
- [ ] Crear paquetes (ej: 10 sesiones por $2000 con 10% desc)
- [ ] Venta y tracking de paquetes
- [ ] Sesiones consumidas/restantes
- [ ] Vencimiento de paquetes
- [ ] Aplicar automáticamente al agendar cita

**Facturación Recurrente:**
- [ ] Configurar planes de pago mensuales
- [ ] Cargo automático con tarjeta guardada
- [ ] Notificaciones de cobro

**Pasarelas de Pago:**
- [ ] Integración Stripe (internacional)
- [ ] Integración Mercado Pago (LATAM)
- [ ] Integración Conekta (México)
- [ ] Guardado seguro de tarjetas (tokenización)
- [ ] Procesamiento de pagos online

**Facturación Fiscal (México - CFDI):**
- [ ] Integración con PAC (Finkok o Facturapi)
- [ ] Generación de facturas con validez fiscal
- [ ] Almacenamiento por 5 años
- [ ] Cancelación de facturas
- [ ] Reportes mensuales para SAT

**Reportes Contables:**
- [ ] Estado de resultados (P&L)
- [ ] Flujo de efectivo (Cash Flow)
- [ ] Cuentas por cobrar aging
- [ ] Proyecciones de ingresos
- [ ] Exportar para enviar a contador

**Inversión:**
- Desarrollo: $15K USD
- PAC mensual: $500 MXN (~$30 USD)

---

### 🌐 FASE 6 - Escalabilidad y Multi-Clínica (Q4 2026)
**Duración:** 8-12 semanas | **Prioridad:** Baja (solo si hay demanda)

**Objetivo:** Soportar grupos de clínicas con múltiples sucursales

**Arquitectura:**
- [ ] Database sharding por clínica
- [ ] Optimización de queries para scale
- [ ] Connection pooling optimizado

**Features:**
- [ ] Dashboard consolidado multi-sucursal
- [ ] Vista agregada de todas las clínicas
- [ ] Comparación de desempeño entre sucursales
- [ ] Transferencia de pacientes entre sucursales
- [ ] Configuración independiente por clínica
- [ ] Plantillas de tratamiento compartidas (opcional)

**Integraciones con Aseguradoras:**
- [ ] API de verificación de cobertura
- [ ] Envío de facturas electrónicas a aseguradoras
- [ ] Tracking de autorizaciones
- [ ] Integración con principales aseguradoras México:
  - GNP
  - Metlife
  - AXA

**API Pública:**
- [ ] REST API documentada (OpenAPI/Swagger)
- [ ] Webhooks para eventos importantes
- [ ] Rate limiting y autenticación OAuth
- [ ] Documentación para desarrolladores

---

### 📱 FASE 7 - Aplicación Móvil (2027)
**Duración:** 16-20 semanas | **Inversión:** $40-50K USD

**Tecnología:** React Native (código compartido iOS + Android)

**App para Pacientes:**
- [ ] Login con credenciales existentes
- [ ] Vista de ejercicios prescritos
- [ ] Reproducción de videos con cache offline
- [ ] Tracking de ejercicios con calendario visual
- [ ] Notificaciones push nativas
- [ ] Ver próximas citas
- [ ] Historial de sesiones
- [ ] Chat con fisioterapeuta
- [ ] Gamification: badges, streaks, logros

**App para Fisioterapeutas:**
- [ ] Vista de agenda del día
- [ ] Registro rápido de notas SOAP
- [ ] Voz a texto para notas
- [ ] Consulta de expediente del paciente
- [ ] Toma de fotos de progreso
- [ ] Modo offline con sincronización

**Costos:**
- Desarrollo: $40-50K USD
- Apple Developer: $99/año
- Google Play: $25 one-time
- Mantenimiento: $10K/año

---

### 🤖 FASE 8 - Inteligencia Artificial (2027-2028)
**Duración:** Continuo | **Inversión:** $50K+ USD

**Casos de Uso:**

**1. Sugerencias de Ejercicios Inteligentes**
- ML model entrenado con prescripciones exitosas
- Input: diagnóstico, edad, limitaciones funcionales
- Output: Top 10 ejercicios recomendados con probabilidad
- Feedback loop para mejorar modelo

**2. Predicción de Adherencia**
- Clasificación: alta/baja adherencia
- Features: edad, distancia, historial, diagnóstico
- Acción: intervención temprana para pacientes en riesgo
- Alertas proactivas para fisioterapeutas

**3. NLP en Notas SOAP**
- Extracción de síntomas recurrentes
- Detección de patrones
- Alertas de condiciones no diagnosticadas
- Búsqueda semántica en historial clínico

**4. Transcripción Automática**
- Whisper API de OpenAI
- Voz a texto en tiempo real
- Revisión humana obligatoria
- Ahorro de 30-40% en tiempo de documentación

**5. Análisis Predictivo**
- Score de riesgo de deserción (0-100)
- Identificar pacientes que no volverán
- Recomendaciones de retención
- Optimización de pricing

**Consideraciones Éticas:**
- IA como asistente, NO decisor médico
- Transparencia total en uso de datos
- Opt-out disponible
- Revisión humana obligatoria
- Cumplir con regulaciones de IA médica

---

## 11. Riesgos y Mitigación

### 11.1 Riesgos Técnicos

#### RIESGO 1: Pérdida de Datos
**Probabilidad:** Baja | **Impacto:** CRÍTICO

**Descripción:**
Fallo catastrófico en base de datos que resulte en pérdida de expedientes clínicos.

**Mitigación Actual:**
- ✅ Backups diarios automáticos (Supabase)
- ✅ Retención de 7 días
- ✅ Soft delete (no eliminación física)

**Plan de Mejora:**
- [ ] Backup semanal a AWS S3 (extra-redundancia)
- [ ] Testing trimestral de restauración
- [ ] Documentar procedimiento disaster recovery
- [ ] Monitoreo 24/7 de salud de BD

**Plan de Contingencia:**
- Restaurar desde último backup (máx 24h datos perdidos)
- Notificar clínicas afectadas en < 2 horas
- Ofrecer compensación (crédito en suscripción)
- Análisis post-mortem público

---

#### RIESGO 2: Brecha de Seguridad (Data Breach)
**Probabilidad:** Media | **Impacto:** CRÍTICO

**Descripción:**
Acceso no autorizado a datos médicos sensibles (HIPAA/GDPR violation).

**Mitigación Actual:**
- ✅ Row Level Security en BD
- ✅ Encriptación TLS + AES-256
- ✅ Autenticación JWT robusta
- ✅ Rate limiting

**Plan de Mejora:**
- [ ] Pentesting semestral ($5K)
- [ ] Bug bounty program
- [ ] 2FA obligatorio para admins
- [ ] Monitoring de accesos anómalos
- [ ] Security training para equipo

**Plan de Contingencia:**
- Protocolo de respuesta a incidentes
- Notificación < 72h (GDPR)
- Firma de ciberseguridad para forense
- Seguro de ciberseguridad ($1M coverage)

---

#### RIESGO 3: Degradación de Performance
**Probabilidad:** Alta | **Impacto:** Alto

**Descripción:**
Sistema lento con crecimiento (> 3s response time).

**Indicadores de Alerta:**
- Response time p95 > 500ms
- Database CPU > 70%
- Error rate > 0.5%

**Mitigación:**
- ✅ Índices en queries frecuentes
- ✅ Paginación de resultados
- [ ] Caching con Redis
- [ ] CDN para assets
- [ ] Load testing pre-release
- [ ] Plan de escalamiento claro

**Acción Escalonada:**
1. Optimizar queries lentos
2. Escalar verticalmente BD (más CPU/RAM)
3. Implementar sharding (si > 500 clínicas)

---

### 11.2 Riesgos de Negocio

#### RIESGO 4: Baja Adopción (High Learning Curve)
**Probabilidad:** Media | **Impacto:** Alto

**Descripción:**
Usuarios no técnicos encuentran sistema difícil, prefieren papel.

**Mitigación:**
- ✅ UX simple e intuitivo
- ✅ Onboarding asistido
- [ ] Videos tutoriales
- [ ] Soporte chat en vivo
- [ ] Capacitación personalizada
- [ ] User testing continuo

**Métricas:**
- Time to first action < 5min
- Feature adoption > 60% primer mes
- Support tickets < 2/usuario/mes

---

#### RIESGO 5: Churn Alto
**Probabilidad:** Media | **Impacto:** Alto

**Causas:**
- Falta de ROI percibido
- Competencia más barata
- Funcionalidades faltantes
- Mal soporte

**Mitigación:**
- [ ] Onboarding estructurado (30-60-90 días)
- [ ] Check-ins mensuales
- [ ] Encuestas trimestrales
- [ ] Roadmap transparente
- [ ] Loyalty program
- [ ] Exit interviews

**Target:**
- Churn mensual < 5%
- Churn anual < 30%

---

#### RIESGO 6: Regulaciones Cambiantes
**Probabilidad:** Media | **Impacto:** Medio

**Descripción:**
Nuevas leyes de privacidad de datos médicos.

**Mitigación:**
- [ ] Consultoría legal semestral
- [ ] Monitoreo de cambios regulatorios
- [ ] Arquitectura flexible
- [ ] Budget de contingencia (10% revenue)

---

#### RIESGO 7: Competidor con Funding Agresivo
**Probabilidad:** Alta | **Impacto:** Medio

**Descripción:**
Startup con $5M entra al mercado con marketing agresivo.

**Ventaja Competitiva:**
- Especialización en fisioterapia (no EMR genérico)
- Velocidad de iteración
- Customer success cercano
- Features únicos (adherencia, plantillas)
- Pricing 30% más barato

**Estrategia:**
- Network effects (más datos = mejor IA)
- Switching costs altos
- Relaciones cercanas con clínicas

---

## 12. Métricas de Éxito

### 12.1 Product-Market Fit

| Métrica | Definición | Q2 2026 | Q4 2026 | Herramienta |
|---------|------------|---------|---------|-------------|
| Active Clinics | Clínicas con ≥1 login/semana | 50 | 150 | Mixpanel |
| MAU | Usuarios activos mensuales | 200 | 600 | Mixpanel |
| DAU/MAU | Engagement diario | 30% | 40% | Analytics |
| Feature Adoption | % usando feature clave | 60% | 75% | Amplitude |
| Time to Value | Hasta 1ª sesión registrada | 3 días | 1 día | Funnel |
| NPS | Net Promoter Score | 50 | 70 | Encuesta |
| CSAT | Satisfacción | 4.2/5 | 4.5/5 | Zendesk |

### 12.2 Unit Economics

| Métrica | Fórmula | Q2 2026 | Q4 2026 |
|---------|---------|---------|---------|
| MRR | Suma suscripciones | $10K | $35K |
| ARR | MRR × 12 | $120K | $420K |
| ARPU | MRR ÷ Clientes | $200 | $233 |
| CAC | Marketing/New customers | $200 | $150 |
| LTV | ARPU × Avg lifetime | $1,200 | $2,000 |
| LTV/CAC | LTV ÷ CAC | 6:1 | 13:1 |
| Churn | Cancelaciones/Total | 5%/mes | 3%/mes |
| Gross Margin | (Rev-COGS)/Rev | 75% | 80% |

### 12.3 Impacto Clínico

| Métrica | Target | Medición |
|---------|--------|----------|
| Tiempo registro paciente | < 3 min | Time tracking |
| Sesiones con SOAP completo | > 90% | Conteo |
| Adherencia ejercicios | > 70% | Completados/Esperados |
| Tasa asistencia citas | > 85% | Completed/Scheduled |
| Ingresos/paciente/mes | $500 MXN | Suma pagos |
| Ocupación agenda | > 75% | Slots ocupados |

---

## 13. Monetización

### 13.1 Planes de Suscripción

#### Plan BÁSICO - $99 USD/mes
**Target:** Clínicas pequeñas (1-2 fisios, < 100 pacientes)

**Incluye:**
- ✅ 2 usuarios
- ✅ 100 pacientes activos
- ✅ Agenda ilimitada
- ✅ Notas SOAP ilimitadas
- ✅ 50 ejercicios en biblioteca
- ✅ Portal del paciente
- ✅ Reportes estándar
- ✅ Soporte email (48h)
- ✅ 5GB almacenamiento

**Límites:**
- ❌ Sin plantillas
- ❌ Sin facturación fiscal
- ❌ Sin integraciones

**Anual:** $990 (2 meses gratis)

---

#### Plan PROFESIONAL - $199 USD/mes ⭐
**Target:** Clínicas medianas (3-10 fisios, 100-500 pacientes)

**Todo en Básico +**
- ✅ 10 usuarios
- ✅ 500 pacientes
- ✅ Plantillas ilimitadas
- ✅ Ejercicios ilimitados
- ✅ Reportes con gráficas
- ✅ Exportación Excel/PDF
- ✅ 1000 SMS/mes
- ✅ Soporte chat (8h)
- ✅ Onboarding asistido
- ✅ 50GB almacenamiento
- ✅ Hasta 3 sucursales

**Anual:** $1,990 (2 meses gratis)

---

#### Plan ENTERPRISE - Desde $499 USD/mes
**Target:** Grupos de clínicas (> 10 fisios)

**Todo en Pro +**
- ✅ Usuarios ilimitados
- ✅ Pacientes ilimitados
- ✅ Sucursales ilimitadas
- ✅ Facturación fiscal (CFDI)
- ✅ Integraciones aseguradoras
- ✅ API access
- ✅ White-labeling
- ✅ SSO (SAML)
- ✅ SLA 99.9%
- ✅ Soporte 24/7
- ✅ Account manager
- ✅ Almacenamiento ilimitado

**Contrato anual mínimo**

---

### 13.2 Add-Ons

**SMS Credits:**
- $0.05/SMS
- Paquetes con descuento:
  - 500 SMS: $20 (20% off)
  - 2K SMS: $70 (30% off)
  - 10K SMS: $300 (40% off)

**Almacenamiento:**
- +10GB: $10/mes
- +50GB: $40/mes
- +100GB: $70/mes

**Usuarios Extra:**
- $15/mes por usuario adicional

---

### 13.3 Estrategia GTM (Go-to-Market)

**Fase 1: Beta (Primeras 20 clínicas)**
- 50% OFF por 6 meses
- Básico: $49/mes
- Pro: $99/mes
- Objetivo: PMF validation

**Fase 2: Early Adopter (21-100)**
- 30% OFF por 3 meses
- Básico: $69/mes
- Pro: $139/mes

**Fase 3: General Availability (101+)**
- Precio completo
- Sin descuento (excepto anual)

---

### 13.4 Free Trial

**Duración:** 14 días
**Sin tarjeta requerida**

**Incluye:**
- Plan PROFESIONAL completo
- 5 usuarios
- 50 pacientes
- Onboarding opcional (30 min)

**Conversión Target:** 25%

**Nurture Campaign:**
- Día 1: Email de bienvenida + video tutorial
- Día 3: Checklist de primeros pasos
- Día 7: Caso de estudio de cliente similar
- Día 12: Llamada personal de CS team
- Día 14: Última oportunidad + oferta especial

---

### 13.5 Proyecciones Financieras

**Año 1 (2026):**

| Mes | Clínicas | MRR | Gastos | Profit |
|-----|----------|-----|--------|--------|
| Mar | 10 | $1,000 | $5,000 | -$4,000 |
| Jun | 30 | $5,000 | $8,000 | -$3,000 |
| Sep | 75 | $13,000 | $12,000 | +$1,000 |
| Dic | 150 | $28,000 | $18,000 | +$10,000 |

**ARR Fin Año 1:** $336K

**Assumptions:**
- 40% Básico ($99)
- 50% Pro ($199)
- 10% Enterprise ($500 avg)
- Churn: 5%/mes
- CAC: $150
- Payback period: 6 meses

**Runway:** 18 meses con $200K initial funding

---

## 14. Conclusión

Clinova está posicionado para **transformar la gestión de clínicas de fisioterapia** mediante:

### Diferenciadores Clave:

1. **Especialización 100%**: No es EMR genérico, diseñado específicamente para fisioterapia
2. **Tecnología Moderna**: Next.js 15 + Supabase = velocidad + escalabilidad
3. **UX Superior**: Co-diseñado con fisioterapeutas reales
4. **Portal del Paciente**: Mejora adherencia y resultados clínicos
5. **Pricing Accesible**: 50-70% más barato que competencia tradicional

### Tracción Actual:

- ✅ MVP completo y funcional
- ✅ Features avanzadas implementadas
- ✅ Arquitectura escalable
- ✅ Base de código limpia y mantenible
- ✅ PRD completo y detallado

### Next Steps Inmediatos:

**Q1 2026:**
1. Completar Fase 3 (Multi-usuario + Gráficas)
2. Lanzar programa beta con 10 clínicas
3. Implementar analytics y tracking
4. Crear materiales de marketing
5. Iniciar SEO y content marketing

**Q2 2026:**
1. Lanzar Fase 4 (Notificaciones)
2. Escalar a 50 clínicas
3. Contratar Customer Success Manager
4. Implementar programa de referidos
5. Pricing optimization

### Visión 2026-2031:

- **2026:** #1 en México (500 clínicas, $500K ARR)
- **2027:** Expansión LATAM + App móvil ($2M ARR)
- **2028:** Expansión US + HIPAA ($5M ARR, Serie A)
- **2029:** Marketplace de fisioterapeutas
- **2030-2031:** Ecosystem completo con IA

---

Con un roadmap claro, métricas bien definidas, mitigación de riesgos y un modelo de monetización validado, **el camino hacia 500 clínicas activas y $500K ARR en 2026 es alcanzable**.

**El momento de ejecutar es AHORA.**

---

**Documento:** PRD Clinova - Secciones Finales
**Versión:** 2.0
**Fecha:** Enero 5, 2026
**Autor:** Equipo Desarrollos ROD
**Próxima Revisión:** Marzo 2026
