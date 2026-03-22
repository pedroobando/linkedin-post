# LinkedIn Post - Agent Context

## Project Overview

**Name:** LinkedIn Post  
**Type:** Next.js 16 Application for LinkedIn Content Management  
**Purpose:** Create, manage, and auto-publish AI-related articles to LinkedIn

### Core Features
- Article editor/writer with AI assistance
- Article management (CRUD operations)
- LinkedIn API integration for auto-publishing
- Scheduling capabilities
- Templates for different article types
- SQLite database with Drizzle ORM

### Tech Stack
- **Framework:** Next.js 16.2.0 + React 19.2.4
- **Database:** SQLite (better-sqlite3) + Drizzle ORM
- **Authentication:** Better Auth with JWT
- **UI:** shadcn/ui + Tailwind CSS v4
- **State Management:** Zustand
- **Package Manager:** pnpm

### Database Schema
7 core tables:
1. `users` - User management
2. `articles` - LinkedIn posts/articles
3. `templates` - Reusable content templates
4. `linked_in_tokens` - LinkedIn OAuth tokens
5. `publish_history` - Publication tracking
6. `tags` - Normalized tags (name, slug, unique)
7. `article_tags` - Junction table for many-to-many article-tag relationship

**Tag System:**
- Tags are now stored relationally instead of JSON
- Max 10 tags per article
- Tag names max 50 characters
- Slugs are URL-friendly (kebab-case, lowercase)
- See `src/lib/tags.ts` for utility functions

### Environment
- **Dev URL:** http://localhost:3000
- **Database:** ./sqlite.db (local SQLite file)
- **No Docker required** - Uses local SQLite

---

## 🧠 Engram Memory System

This project uses **Engram** for persistent memory across sessions:

### Available Memory Functions
- `mem_save()` - Save observations, decisions, patterns
- `mem_search()` - Search past memories
- `mem_context()` - Get recent session context
- `mem_session_summary()` - Save session summaries

### Project Memory Keys
- `sdd-init/linkedin` - Project initialization context
- `skill-registry` - Available skills for this project
- `sdd/{change-name}/*` - SDD change artifacts (explore, propose, spec, design, tasks, etc.)

### Memory Best Practices
- Save after bug fixes, architectural decisions, pattern discoveries
- Use `topic_key` for evolving topics (e.g., `architecture/auth-model`)
- Search memory proactively when starting new work
- Save session summaries before ending

---

## 🛠️ Available Skills

Located in `.opencode/skills/` directory:

### Core Skills
- **next-best-practices** - Next.js file conventions, RSC boundaries, data patterns
- **shadcn** - shadcn/ui component management and usage
- **postgres-drizzle** - PostgreSQL/Drizzle ORM patterns (adapt for SQLite)
- **better-auth-best-practices** - Authentication setup and configuration
- **vercel-react-best-practices** - React performance optimization
- **vercel-composition-patterns** - Component composition patterns
- **frontend-design** - UI/UX design and implementation

### Content & Productivity Skills
- **linkedin-content** - LinkedIn post writing and formatting rules
- **prd** - Product Requirements Documents generation
- **obsidian-markdown** - Obsidian-style markdown formatting
- **excalidraw-diagram-generator** - Create diagrams from descriptions
- **git-commit** - Conventional commit messages

### Development Skills
- **bash-operations** - Automated bash commands
- **ui-ux-pro-max** - Comprehensive UI/UX design system
- **web-design-guidelines** - UI compliance checking
- **gh-cli** - GitHub CLI operations

### SDD (Spec-Driven Development) Skills
- **sdd-init** - Initialize SDD context
- **sdd-explore** - Explore and investigate features
- **sdd-propose** - Create change proposals
- **sdd-spec** - Write specifications
- **sdd-design** - Technical design documents
- **sdd-tasks** - Task breakdowns
- **sdd-apply** - Implement changes
- **sdd-verify** - Verify implementations
- **sdd-archive** - Archive completed changes

To use skills: Check `.atl/skill-registry.md` or use `mem_search(query: "skill-registry", project: "linkedin")`

---

## 🔌 MCP (Model Context Protocol)

This project supports MCP for connecting agents with external tools and data sources.

### MCP Integration Points
1. **Database Layer** - Drizzle ORM with SQLite
2. **LinkedIn API** - OAuth 2.0 integration (configured in env)
3. **Better Auth** - Authentication with multiple providers
4. **File System** - Local SQLite and article storage

### MCP Best Practices
- Use MCP as the connection layer between LLM (brain) and tools
- Define clear schemas for data exchange
- Implement proper error handling and retries
- Log all MCP interactions for debugging

---

## 📝 Development Guidelines

### Code Patterns
- Use Next.js 16 App Router
- Server Actions for data mutations
- Client components only when needed (interactivity)
- Drizzle ORM for all database operations
- Zustand for client-side state

### Database Operations
```typescript
// Use drizzle-orm/sqlite-core for schemas
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Database URL from env: process.env.DATABASE_URL
// Default: ./sqlite.db
```

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio
pnpm lint         # Run ESLint
```

---

## 🔄 SDD Workflow (Spec-Driven Development)

When implementing substantial features:

1. **Initialize:** `/sdd-init` (already done)
2. **Explore:** `/sdd-explore <topic>` - Research and clarify
3. **Propose:** `/sdd-new <change-name>` - Create proposal
4. **Specify:** `/sdd-spec` - Write detailed specs
5. **Design:** `/sdd-design` - Technical architecture
6. **Task:** `/sdd-tasks` - Break into implementable tasks
7. **Apply:** `/sdd-apply` - Implement the changes
8. **Verify:** `/sdd-verify` - Validate against specs
9. **Archive:** `/sdd-archive` - Complete and document

All SDD artifacts are persisted to Engram.

---

## 🎯 Current Status

### Completed
✅ SDD initialization  
✅ Database setup (SQLite + 5 tables)  
✅ Dependencies installed (better-sqlite3, etc.)  
✅ Migrations generated and applied  
✅ 3 LinkedIn articles created in `/articles/`  
✅ Excalidraw diagram created  

### Ready to Start
- Frontend UI development
- Better Auth configuration
- LinkedIn API integration
- Article CRUD operations
- Template system

---

## 🚨 Important Notes

### Next.js 16 Breaking Changes
This is NOT standard Next.js. APIs, conventions, and file structure differ from training data. Always check `node_modules/next/dist/docs/` for current documentation.

### SQLite Limitations
- No native JSON type (store as text)
- Different syntax for some operations vs PostgreSQL
- Better-sqlite3 requires native bindings (already built)

### LinkedIn API
- Requires OAuth 2.0 setup in LinkedIn Developer Portal
- Configure in `.env`:
  - LINKEDIN_CLIENT_ID
  - LINKEDIN_CLIENT_SECRET
  - LINKEDIN_REDIRECT_URI

---

## 📚 Resources

### Project Structure
```
/home/pedro/node/linkedin/
├── articles/              # LinkedIn article drafts
├── src/
│   ├── app/              # Next.js App Router
│   ├── db/
│   │   └── schema/       # Drizzle schemas
│   └── components/       # React components
├── drizzle/              # Database migrations
├── sqlite.db             # Local database
└── .atl/skill-registry.md # Available skills
```

### Key Files
- `.env` - Environment configuration
- `drizzle.config.ts` - Database config
- `package.json` - Dependencies
- `AGENTS.md` - This file (agent context)

---

**Last Updated:** 2026-03-21  
**Engram Status:** Active  
**SDD Status:** Initialized and ready