# Architecture Decision Records (ADRs)

Este directorio contiene los Architecture Decision Records del proyecto.

## ¿Qué es un ADR?

Un ADR (Architecture Decision Record) documenta decisiones técnicas importantes que afectan la arquitectura del proyecto. Sirve para:

- Recordar por qué se tomó una decisión
- Comunicar el razonamiento a otros desarrolladores
- Evitar discusiones repetidas sobre el mismo tema

## Cuándo crear un ADR

Crear un ADR cuando:
- Hay 2+ opciones técnicas válidas
- La decisión afecta la arquitectura a largo plazo
- Podrías preguntarte "¿por qué hice esto así?" en el futuro

## Formato

Usar el formato: `XXX-descripcion-corta.md`

Ejemplos:
- `001-scheduler-implementation.md`
- `002-database-choice.md`
- `003-authentication-provider.md`

## Template

```markdown
# ADR XXX: [Título de la decisión]

## Status
- Proposed / Accepted / Deprecated / Superseded by ADR XXX

## Context
[Descripción del problema o decisión a tomar]

## Options Considered

### Option A: [Nombre]
- Pros: ...
- Cons: ...

### Option B: [Nombre]
- Pros: ...
- Cons: ...

## Decision
[Opción elegida y por qué]

## Consequences
- Positivas: ...
- Negativas: ...

## Mitigations
[Cómo mitigar las consecuencias negativas]
```

## ADRs Actuales

| Número | Título | Status | Fecha |
|--------|--------|--------|-------|
| - | - | - | - |

---

*Última actualización: 2026-03-22*
