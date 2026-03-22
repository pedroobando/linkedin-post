# Ejemplo Práctico: Sistema de Scheduling para LinkedIn

> **Feature:** Programación de publicaciones en LinkedIn  
> **Propósito:** Ejemplo completo de aplicación del flujo SDD  
> **Fecha:** 2026-03-22

---

## Resumen Ejecutivo

Este documento muestra un ejemplo completo de cómo aplicar el flujo SDD para implementar un sistema de scheduling de publicaciones en LinkedIn.

---

## Fase 0: PRD (Product Requirements Document)

### Feature: Scheduling System for LinkedIn Posts

#### Problem Statement
Los usuarios quieren programar publicaciones para horarios óptimos de engagement sin tener que estar online en ese momento exacto.

#### Proposed Solution
Sistema de scheduling que:
1. Permita seleccionar fecha/hora de publicación desde el UI
2. Guarde posts en estado "scheduled" en la base de datos
3. Ejecute publicación automática vía cron job cada minuto
4. Envíe notificaciones de éxito/error al usuario
5. Permita ver y cancelar publicaciones programadas

#### User Stories
- Como usuario quiero programar una publicación para mañana a las 9am para maximizar engagement
- Como usuario quiero ver todas mis publicaciones programadas para gestionar mi contenido
- Como usuario quiero cancelar una publicación programada para corregir errores
- Como sistema quiero reintentar publicaciones fallidas para robustez

#### Acceptance Criteria
- [ ] UI con datepicker para seleccionar fecha/hora
- [ ] Validación: no permitir fechas pasadas ni más de 30 días en el futuro
- [ ] Almacenar en DB con estado "scheduled", "published", "failed"
- [ ] Cron job cada minuto verificando posts pendientes
- [ ] Integración con LinkedIn API para publicar automáticamente
- [ ] Panel de historial de publicaciones programadas
- [ ] Notificaciones toast de éxito/error

#### Technical Considerations
- SQLite para almacenamiento (ya existe en el proyecto)
- node-cron para el scheduler (simple, sin infra adicional)
- BullMQ si escalamos a múltiples workers en el futuro
- Server Action para crear/editar scheduled posts

---

## Fase 1: ADR (Architecture Decision Record)

### ADR 001: Scheduler Implementation

**Status:** Accepted

**Context:** Necesitamos ejecutar publicaciones programadas automáticamente en el servidor.

#### Options Considered

**Option A: node-cron (in-process)**
- Pros: Simple de implementar, no requiere infraestructura adicional, perfecto para MVP
- Cons: No persiste si el servidor reinicia, no tiene cola de reintentos automáticos

**Option B: BullMQ + Redis**
- Pros: Persistente, escalable, reintentos automáticos
- Cons: Requiere Redis, más complejo de configurar, overkill para proyecto personal

**Decision:** Usar node-cron para el MVP.

**Rationale:** Es un proyecto personal inicialmente. La migración a BullMQ es directa si escalamos.

**Consequences:** Si el servidor reinicia, hay que verificar posts perdidos al iniciar.

---

## Fase 2: SDD Workflow (9 Pasos)

Ver documento completo de SDD Workflow para detalles de cada paso.

### Paso 1: Exploración (/sdd-explore)
Investigación inicial de librerías, APIs y patrones.

### Paso 2: Propuesta (/sdd-new)
Creación de propuesta formal con intent, scope y approach.

### Paso 3: Especificación (/sdd-spec)
Definición de requerimientos funcionales y no funcionales.

### Paso 4: Diseño (/sdd-design)
Arquitectura técnica y decisiones de implementación.

### Paso 5: Tareas (/sdd-tasks)
Checklist de implementación paso a paso.

### Paso 6: Aplicación (/sdd-apply)
Implementación del código.

### Paso 7: Verificación (/sdd-verify)
Validación contra especificaciones.

### Paso 8: Archivado (/sdd-archive)
Cierre y documentación final.

---

*Para el detalle completo de cada paso del SDD Workflow, consultar el subagente @oraculo.*
