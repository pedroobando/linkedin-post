# LinkedIn Post - Gestión de Contenido para LinkedIn

Aplicación web para crear, gestionar y publicar automáticamente artículos relacionados con Inteligencia Artificial en LinkedIn.

## Características Principales

- **Editor de Artículos** con asistencia de IA
- **Gestión de Artículos** (operaciones CRUD completas)
- **Integración con API de LinkedIn** para publicación automática
- **Programación de Publicaciones** con capacidades de scheduling
- **Sistema de Plantillas** para diferentes tipos de contenido
- **Gestión de Etiquetas** normalizadas en base de datos
- **Autenticación Segura** con Better Auth y JWT
- **Almacenamiento de Archivos** con MinIO

## Tecnología

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16.1.6 + React 19.2.3 |
| Base de Datos | SQLite (libsql/client) + Drizzle ORM |
| Autenticación | Better Auth con JWT |
| UI | shadcn/ui + Tailwind CSS v4 |
| Gestión de Estado | Zustand |
| Query Client | TanStack Query |
| Editor de Texto | TipTap |
| Gestor de Paquetes | pnpm |

## Estructura del Proyecto

```
linkedin-post/
├── articles/                  # Borradores de artículos de LinkedIn
├── src/
│   ├── actions/              # Server Actions organizados por dominio
│   │   ├── articles/         # Acciones de artículos (get, ins, upd, del)
│   │   ├── auth/             # Acciones de autenticación
│   │   ├── minio/            # Acciones de almacenamiento de archivos
│   │   ├── tags/             # Acciones de etiquetas
│   │   └── users/            # Acciones de usuarios
│   ├── app/                  # Next.js App Router
│   │   ├── (dash)/           # Rutas del dashboard (protegidas)
│   │   ├── auth/             # Rutas de autenticación
│   │   └── api/              # API routes
│   ├── components/           # Componentes React
│   │   ├── ui/               # Componentes shadcn/ui
│   │   ├── dash/             # Componentes del dashboard
│   │   └── provider/         # Proveedores de contexto
│   ├── db/                   # Base de datos
│   │   └── schema/           # Esquemas de Drizzle ORM
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilidades y configuraciones
│   ├── store/                # Stores de Zustand
│   └── utils/                # Funciones utilitarias
├── drizzle/                  # Migraciones de base de datos
├── docs/                     # Documentación del proyecto
├── sdd/                      # Artefactos SDD (Spec-Driven Development)
└── sqlite.db                 # Base de datos SQLite local
```

## Esquema de Base de Datos

El proyecto utiliza **7 tablas principales**:

| Tabla | Descripción |
|-------|-------------|
| `users` | Gestión de usuarios (Better Auth) |
| `sessions` | Sesiones de usuario |
| `accounts` | Cuentas vinculadas (OAuth) |
| `articles` | Artículos/Posts de LinkedIn |
| `templates` | Plantillas reutilizables de contenido |
| `linked_in_tokens` | Tokens OAuth de LinkedIn |
| `publish_history` | Historial de publicaciones |
| `tags` | Etiquetas normalizadas |
| `article_tags` | Tabla de unión (many-to-many) |

## Convención de Server Actions

Las server actions siguen el patrón de nomenclatura `{operacion}-{entidad}.ts`:

```
src/actions/
├── articles/
│   ├── get-article.ts    # Operaciones READ
│   ├── ins-article.ts    # Operaciones CREATE/UPSERT
│   ├── upd-article.ts    # Operaciones UPDATE
│   ├── del-article.ts    # Operaciones DELETE
│   └── index.ts          # Barrel exports
└── tags/
    ├── get-tag.ts
    ├── ins-tag.ts
    ├── upd-tag.ts
    ├── del-tag.ts
    ├── ass-tag.ts        # Operaciones de asociación
    └── index.ts
```

## Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Iniciar servidor de desarrollo
pnpm dev:turbo        # Iniciar con Turbopack

# Construcción
pnpm build            # Construir para producción
pnpm start            # Iniciar servidor de producción

# Base de Datos
pnpm db:generate      # Generar migraciones
pnpm db:migrate       # Ejecutar migraciones
pnpm db:studio        # Abrir Drizzle Studio

# Calidad de Código
pnpm lint             # Ejecutar ESLint
```

## Configuración del Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Base de Datos
DB_FILE_NAME=./sqlite.db

# Better Auth
BETTER_AUTH_SECRET=tu_secreto_aqui
BETTER_AUTH_URL=http://localhost:3000

# LinkedIn API (para publicación automática)
LINKEDIN_CLIENT_ID=tu_client_id
LINKEDIN_CLIENT_SECRET=tu_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/callback/linkedin

# MinIO (almacenamiento de archivos)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=tu_access_key
MINIO_SECRET_KEY=tu_secret_key
MINIO_BUCKET_NAME=linkedin-post
```

## Instalación

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd linkedin-post
```

2. **Instalar dependencias:**
```bash
pnpm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Inicializar la base de datos:**
```bash
pnpm db:generate
pnpm db:migrate
```

5. **Iniciar el servidor de desarrollo:**
```bash
pnpm dev
```

6. **Abrir en el navegador:**
```
http://localhost:3000
```

## Características de Next.js 16

Este proyecto utiliza **Next.js 16** con las siguientes características:

- **React Compiler** habilitado (optimización automática sin useMemo/useCallback)
- **App Router** con Server Components por defecto
- **Server Actions** para mutaciones de datos
- **Turbopack** disponible para desarrollo rápido
- **Cache Components** para optimización de rendimiento

## Flujo de Trabajo SDD (Spec-Driven Development)

El proyecto sigue la metodología SDD para desarrollo de características sustanciales:

1. **Explorar** - Investigar y clarificar requisitos
2. **Proponer** - Crear propuesta de cambio
3. **Especificar** - Escribir especificaciones detalladas
4. **Diseñar** - Documento de arquitectura técnica
5. **Tareas** - Desglosar en tareas implementables
6. **Aplicar** - Implementar los cambios
7. **Verificar** - Validar contra especificaciones
8. **Archivar** - Completar y documentar

Los artefactos SDD se encuentran en el directorio `/sdd/`.

## Integración con LinkedIn API

Para habilitar la publicación automática en LinkedIn:

1. Crear una aplicación en [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Configurar los permisos necesarios (w_member_social, r_liteprofile)
3. Agregar las credenciales en `.env`
4. Completar el flujo OAuth para obtener tokens de acceso

## Contribución

1. Crear una rama para tu feature: `git checkout -b feature/nombre-feature`
2. Hacer commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
3. Crear un Pull Request con descripción detallada

## Licencia

Este proyecto es privado y confidencial.

---

**Última actualización:** Marzo 2026  
**Versión:** 0.1.0  
**Autor:** Pedro
