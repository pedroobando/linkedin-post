---
name: bash-operations
description: Execute bash commands automatically using small_model, especially for pnpm and npx operations
---

## When to Use Me

Use this skill when you need to execute bash commands, especially:
- Installing packages with `pnpm install` or `pnpm add`
- Running development servers with `pnpm dev`
- Building projects with `pnpm build`
- Executing npx commands like `npx shadcn add [component]`
- Any other pnpm or npx related operations

## Rules

1. **Always use small_model** for bash operations to optimize token usage
2. The `short` subagent is pre-configured with permissions to run `pnpm *` and `npx *` commands automatically
3. Invoke the short agent with: `@short [comando]`

## Examples

- `@short pnpm install`
- `@short pnpm add zod`
- `@short npx shadcn add button`
- `@short pnpm db:generate`

## Important

This skill is automatically applied when executing bash commands to ensure they run with the small_model for efficiency.
