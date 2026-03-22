# SDD Workflow - Guía Completa (9 Pasos)

> **Fuente**: Documentación del subagente @oraculo  
> **Adaptado para**: Desarrollo individual  
> **Fecha**: 2026-03-22

---

## 📊 Visión General

SDD (Spec-Driven Development) te obliga a **pensar antes de codificar**. Cada paso genera artefactos que persisten en memoria, creando un historial completo de decisiones.

```
┌─────────┐   ┌──────────┐   ┌────────┐   ┌────────┐   ┌───────┐   ┌───────┐   ┌─────────┐   ┌─────────┐
│ Explore │──▶│ Propose  │──▶│  Spec  │──▶│ Design │──▶│ Tasks │──▶│ Apply │──▶│ Verify  │──▶│ Archive │
└─────────┘   └──────────┘   └────────┘   └────────┘   └───────┘   └───────┘   └─────────┘   └─────────┘
```

---

## 1️⃣ Exploración (`/sdd-explore`)

### ¿Qué se hace?
Investigas el codebase y piensas el problema **sin escribir código**. Analizas opciones, identificas áreas afectadas, evalúas riesgos.

### Comando
```
/sdd-explore <topic>
```

### Tiempo
**5-15 minutos**

### Checklist de salida
- [ ] Identificado claramente el problema
- [ ] Tener al menos 1-2 enfoques posibles
- [ ] Saber qué archivos/áreas se verían afectados

### Ejemplo
```markdown
## Exploration: Sistema de Scheduling

### Current State
El sistema actual solo permite crear y editar artículos...

### Affected Areas
- src/db/schema/articles.ts — Agregar campos scheduledAt, status
- src/lib/scheduler.ts — Nuevo servicio de scheduling

### Approaches
1. Cron Jobs con node-cron — Simple, sin dependencias
2. BullMQ + Redis — Robusto pero requiere infra

### Recommendation
node-cron para MVP
```

---

## 2️⃣ Propuesta (`/sdd-new`)

### ¿Qué se hace?
Creas un documento formal que define **qué** vas a construir, **por qué**, y **cuál es el alcance**. Es el contrato del cambio.

### Comando
```
/sdd-new <change-name>
```

### Tiempo
**10-20 minutos**

### Checklist de salida
- [ ] Intent claro (por qué se hace)
- [ ] Scope definido (qué entra y qué NO)
- [ ] Plan de rollback
- [ ] Criterios de éxito medibles

### Estructura
```markdown
# Proposal: [Nombre]

## Intent
[¿Por qué se hace esto?]

## Scope
### In Scope
- [ ] Feature A
- [ ] Feature B

### Out of Scope
- Feature X (futura versión)

## Approach
[Enfoque técnico de alto nivel]

## Risks
| Risk | Mitigation |
|------|------------|
| X puede fallar | Y alternativa |

## Success Criteria
- [ ] Criterio 1 medible
- [ ] Criterio 2 medible
```

---

## 3️⃣ Especificación (`/sdd-spec`)

### ¿Qué se hace?
Defines **requisitos funcionales** con escenarios Given/When/Then. Es el contrato de comportamiento.

### Comando
```
/sdd-spec
```

### Tiempo
**15-30 minutos**

### Checklist de salida
- [ ] Cada requisito tiene al menos 1 escenario
- [ ] Escenarios son testeables
- [ ] Cubres happy path Y edge cases

### Estructura (Gherkin)
```markdown
## Requirement: Schedule Article Creation

### Scenario: User schedules article for future date
- GIVEN a user has created a draft article
- WHEN the user sets a scheduledAt date in the future
- AND the user saves the article
- THEN the article status SHALL be 'scheduled'
- AND the article SHALL NOT be published immediately

### Scenario: User cannot schedule in the past
- GIVEN a user is editing an article
- WHEN the user attempts to set scheduledAt to a past date
- THEN the system SHALL reject the request
```

---

## 4️⃣ Diseño (`/sdd-design`)

### ¿Qué se hace?
Defines **cómo** se implementa técnicamente: arquitectura, decisiones, flujo de datos, archivos a crear/modificar.

### Comando
```
/sdd-design
```

### Tiempo
**20-40 minutos**

### Checklist de salida
- [ ] Decisiones de arquitectura documentadas
- [ ] Lista de archivos a crear/modificar
- [ ] Interfaces/contratos definidos
- [ ] Estrategia de testing

### Estructura
```markdown
# Design: [Nombre]

## Architecture Decisions
### Decision: [Nombre]
**Choice**: Opción elegida
**Alternatives**: Opciones consideradas
**Rationale**: Por qué se eligió

## Data Flow
[Diagrama o descripción del flujo]

## File Changes
| File | Action | Description |
|------|--------|-------------|
| path/to/file.ts | Modify | Agregar X |
| path/to/new.ts | Create | Nuevo servicio |

## Interfaces
```typescript
export function startScheduler(): void;
```

## Testing Strategy
| Layer | Approach |
|-------|----------|
| Unit | Mock DB |
| Integration | Test endpoints |
```

---

## 5️⃣ Tareas (`/sdd-tasks`)

### ¿Qué se hace?
Descompones el diseño en **tareas concretas y accionables**, organizadas por fases.

### Comando
```
/sdd-tasks
```

### Tiempo
**10-20 minutos**

### Checklist de salida
- [ ] Tareas ordenadas por dependencia
- [ ] Cada tarea es específica y verificable
- [ ] Cada tarea cabe en una sesión de trabajo

### Estructura
```markdown
# Tasks: [Nombre]

## Phase 1: Database Schema
- [ ] 1.1 Add fields to schema
- [ ] 1.2 Generate migration
- [ ] 1.3 Run migration

## Phase 2: Core Logic
- [ ] 2.1 Create service file
- [ ] 2.2 Add error handling
- [ ] 2.3 Write unit tests

## Phase 3: UI
- [ ] 3.1 Create component
- [ ] 3.2 Add to page
```

---

## 6️⃣ Aplicación (`/sdd-apply`)

### ¿Qué se hace?
**Implementas el código real** siguiendo las tareas.

### Comando
```
/sdd-apply <change-name> --tasks="1.1-1.4"
```

### Tiempo
**Variable** (depende del número de tareas)

### Checklist de salida
- [ ] Todas las tareas asignadas completadas
- [ ] Código siguiendo patrones del proyecto
- [ ] Tests pasando

### Flujo de trabajo
```
PARA CADA TAREA:
├── 1. Leer la descripción de la tarea
├── 2. Leer los escenarios del spec
├── 3. Leer las decisiones del design
├── 4. Leer código existente (patrones)
├── 5. Escribir el código
├── 6. Marcar tarea como completa [x]
└── 7. Notar cualquier desviación
```

---

## 7️⃣ Verificación (`/sdd-verify`)

### ¿Qué se hace?
Ejecutas **tests reales** y verificas que la implementación cumple con los specs. Quality gate.

### Comando
```
/sdd-verify <change-name>
```

### Tiempo
**15-30 minutos**

### Checklist de salida
- [ ] Todos los tests pasando
- [ ] Build exitoso
- [ ] Spec Compliance con ✅ en todos los escenarios

### Qué verifica
| Check | Descripción |
|-------|-------------|
| Completeness | ¿Todas las tareas completas? |
| Correctness | ¿Implementa los requisitos? |
| Coherence | ¿Se siguieron decisiones de diseño? |
| Testing | ¿Tests pasan? |
| Build | ¿Compila? |
| Spec Compliance | ¿Cada escenario tiene test? |

### Spec Compliance Matrix
```markdown
| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Schedule | User schedules article | scheduler.test.ts | ✅ COMPLIANT |
```

---

## 8️⃣ Archivado (`/sdd-archive`)

### ¿Qué se hace?
Sincronizas specs y mueves el cambio al archivo. **Cierras el ciclo SDD**.

### Comando
```
/sdd-archive <change-name>
```

### Tiempo
**5-10 minutos**

### Checklist de salida
- [ ] Verification report sin issues CRITICAL
- [ ] Todas las tareas completadas
- [ ] Tests pasando

### Qué hace
```
openspec/changes/scheduling/
    → openspec/changes/archive/2026-03-21-scheduling/
    → openspec/specs/scheduling/spec.md (actualizado)
```

---

## 📊 Tabla Resumen

| Paso | Comando | Tiempo | Input | Output |
|------|---------|--------|-------|--------|
| 1. Explore | `/sdd-explore <topic>` | 5-15 min | Idea | Análisis de opciones |
| 2. Propose | `/sdd-new <name>` | 10-20 min | Exploration | Contrato del cambio |
| 3. Spec | `/sdd-spec` | 15-30 min | Proposal | Requisitos formales |
| 4. Design | `/sdd-design` | 20-40 min | Spec + Proposal | Arquitectura técnica |
| 5. Tasks | `/sdd-tasks` | 10-20 min | Design | Checklist accionable |
| 6. Apply | `/sdd-apply` | Variable | Tasks | Implementación |
| 7. Verify | `/sdd-verify` | 15-30 min | Código + Specs | Validación |
| 8. Archive | `/sdd-archive` | 5-10 min | Verify OK | Ciclo cerrado |

---

## 🎯 Flujos Recomendados

### Para features pequeñas (1-2 días)
```
Explore → Propose → Tasks → Apply → Verify → Archive
(Salta Spec y Design si es simple)
```

### Para features medianas (3-7 días)
```
Explore → Propose → Spec → Design → Tasks → Apply → Verify → Archive
(Flujo completo)
```

### Para features grandes (1+ semana)
```
Divide en cambios más pequeños y aplica SDD a cada uno
Ejemplo: "scheduling-core" → "scheduling-ui" → "scheduling-notifications"
```

---

## 💡 Tips para Proyecto Personal

1. **No saltees Verify**: Aunque trabajes solo, correr tests y verificar contra specs te salva de bugs sutiles.

2. **Usa Engram**: Tu proyecto ya está configurado con Engram. Todos los artefactos persisten entre sesiones.

3. **Explora siempre**: Aunque creas saber la solución, `/sdd-explore` te ayuda a descubrir edge cases.

4. **Tasks pequeñas**: Si una tarea toma más de 2 horas, divídela.

5. **Archive al final**: No archives hasta que Verify pase sin CRITICAL issues.

---

*Documento generado a partir de la guía del subagente @oraculo*
