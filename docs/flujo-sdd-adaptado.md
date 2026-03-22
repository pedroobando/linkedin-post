# Flujo SDD Adaptado para Desarrollo Individual

> **Versión:** 1.0  
> **Fecha:** 2026-03-22  
> **Proyecto:** LinkedIn Post Manager  
> **Autor:** Documentación de proceso de trabajo

---

## 🎯 Filosofía: "Documentar para mi yo del futuro"

Aunque estés trabajando solo, el valor de SDD (Spec-Driven Development) es:

- **No perder contexto** entre sesiones de trabajo
- **Trazabilidad** de decisiones ("¿por qué hice esto así?")
- **Onboarding** si en el futuro alguien más se une al proyecto
- **Reutilización** de patrones en otros proyectos
- **Enfoque** - evitar "scope creep" y distracciones

---

## 📋 Diferencia entre PRD, ADR y RFC

| Documento | Cuándo usar | Para qué sirve | En tu caso |
|-----------|-------------|----------------|------------|
| **PRD** | Antes de empezar una feature | Definir QUÉ se va a construir (requerimientos) | ✅ **Siempre** - Define la funcionalidad |
| **ADR** | Cuando tomas una decisión técnica | Documentar POR QUÉ elegiste X sobre Y | ✅ **Cuando hay alternativas** |
| **RFC** | Para proponer cambios grandes | Obtener feedback del equipo antes de implementar | ❌ **No necesario** (no hay equipo) |

---

## 🔄 Flujo SDD Completo

### **Fase 0: PRD (Product Requirements Document)**
→ **SIEMPRE** antes de empezar una feature significativa

El PRD responde:
- ¿Qué problema estamos resolviendo?
- ¿Qué solución proponemos?
- ¿Cuáles son los criterios de aceptación?
- ¿Qué consideraciones técnicas existen?

### **Fase 1: ADR (Architecture Decision Record)**
→ **Cuando hay decisiones técnicas importantes**

Ejemplos de cuándo crear ADR:
- ¿Usar `node-cron` vs `bull` para jobs programados?
- ¿SQLite local vs PostgreSQL remoto?
- ¿Server Actions vs API Routes en Next.js?
- ¿Zustand vs Redux vs Context API?

### **Fase 2: Implementación con SDD**
→ **Siempre siguiendo el flujo de 9 pasos**

---

## 📝 Reglas Prácticas

### **Siempre crear PRD cuando:**
- ✅ Nueva feature > 2 horas de trabajo
- ✅ Cambio que afecta múltiples archivos
- ✅ Integración con API externa (LinkedIn, etc.)
- ✅ Feature que podrías olvidar cómo funciona en 3 meses

### **Crear ADR cuando:**
- ✅ Hay 2+ opciones técnicas válidas
- ✅ La decisión afecta la arquitectura a largo plazo
- ✅ Podrías preguntarte "¿por qué hice esto así?" en el futuro

### **No crear RFC porque:**
- ❌ No hay equipo que necesite revisar propuestas
- ❌ Las decisiones las tomás vos solo

---

## 🗂️ Estructura de Documentación

```
/home/pedro/node/linkedin/
├── docs/
│   ├── prd/                    # Product Requirements Documents
│   │   ├── README.md           # Índice de PRDs
│   │   └── {feature-name}.md   # PRDs individuales
│   ├── adr/                    # Architecture Decision Records
│   │   ├── README.md           # Índice de ADRs
│   │   └── 001-{decision}.md   # ADRs numerados
│   └── rfc/                    # Request for Comments (opcional)
│       └── README.md
├── articles/                   # Artículos LinkedIn (contenido)
└── src/                        # Código fuente
```

---

## 🚀 Comandos SDD Disponibles

| Comando | Descripción | Cuándo usar |
|---------|-------------|-------------|
| `/sdd-init` | Inicializar SDD en el proyecto | Una sola vez al inicio |
| `/sdd-explore <topic>` | Explorar e investigar una idea | Antes de comprometerse con una solución |
| `/sdd-new <change>` | Crear nueva propuesta de cambio | Inicio de cualquier feature |
| `/sdd-continue` | Continuar con el siguiente paso | Cuando un paso está completo |
| `/sdd-ff <change>` | Fast-forward (todos los pasos) | Para features pequeñas/simples |
| `/sdd-spec <change>` | Crear especificación técnica | Después de la propuesta |
| `/sdd-design <change>` | Crear diseño técnico | Después de la especificación |
| `/sdd-tasks <change>` | Crear lista de tareas | Antes de implementar |
| `/sdd-apply <change>` | Implementar cambios | Durante el desarrollo |
| `/sdd-verify <change>` | Verificar implementación | Después de implementar |
| `/sdd-archive <change>` | Archivar cambio completado | Cuando todo está verificado |

---

## 📚 Recursos Adicionales

- Ver `ejemplo-practico-sdd.md` para un caso de uso completo
- Ver `../adr/` para ejemplos de Architecture Decision Records
- Ver `../prd/` para ejemplos de Product Requirements Documents

---

*Documento generado automáticamente para el proyecto LinkedIn Post Manager*
