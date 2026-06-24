# NestNext Student CRUD

A beginner-friendly full-stack boilerplate using:

- **Next.js** for the frontend
- **NestJS** for the backend API
- **Turborepo** for running and building multiple apps from one repo
- **npm workspaces** for managing shared dependencies and packages
- **TypeScript** across the project

This repo is a good starting point for a student CRUD application or any small full-stack app that needs a separate frontend, backend, and shared TypeScript package.

## Requirements

Use the following versions:

```bash
node -v
# v22.21.0

npm -v
# 10.9.4
```

The root `package.json` is configured with:

```json
"packageManager": "npm@10.9.4"
```

This helps Turborepo understand which package manager is being used.

## Project Structure

```txt
nestnext-student-crud/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Shared TypeScript types/utilities
├── package.json      # Root workspace scripts
├── package-lock.json # npm lockfile
└── turbo.json        # Turborepo task configuration
```

## Apps

### `apps/web`

The frontend app built with Next.js.

Default local URL:

```txt
http://localhost:3000
```

### `apps/api`

The backend API built with NestJS.

Default local URL:

```txt
http://localhost:3001
```

The API uses `process.env.PORT` if you provide one. Otherwise, it falls back to `3001`.

### `packages/shared`

Shared TypeScript code that can be used by both the frontend and backend.

Example:

```ts
export type Student = {
  id: number;
  name: string;
  email: string;
  department?: string;
};
```

Use this package for shared types, constants, helpers, and validation shapes that should stay consistent between apps.

## Getting Started

Install dependencies from the root folder:

```bash
npm install
```

Then start the full development environment:

```bash
npm run dev
```

This starts both:

- Next.js frontend on `http://localhost:3000`
- NestJS backend on `http://localhost:3001`

## Daily Commands

Run both backend and frontend:

```bash
npm run dev
```

Run only NestJS backend:

```bash
npm run dev:api
```

Run only Next.js frontend:

```bash
npm run dev:web
```

Build everything:

```bash
npm run build
```

Build only backend:

```bash
npm run build:api
```

Build only frontend:

```bash
npm run build:web
```

Run lint tasks:

```bash
npm run lint
```

Format code:

```bash
npm run format
```

## How Turborepo Works Here

Turborepo lets this project run scripts across multiple apps and packages from the root folder.

Instead of going into each folder manually:

```bash
cd apps/web
npm run dev
```

you can run commands from the root:

```bash
npm run dev:web
```

The root scripts call Turbo:

```json
{
  "dev": "turbo dev",
  "dev:api": "turbo dev --filter=api",
  "dev:web": "turbo dev --filter=web",
  "build": "turbo build",
  "build:api": "turbo build --filter=api",
  "build:web": "turbo build --filter=web"
}
```

### What `--filter` Means

Turbo's `--filter` option tells Turbo which workspace package should run the command.

For example:

```bash
npm run dev:api
```

runs:

```bash
turbo dev --filter=api
```

That means: run the `dev` script only inside the workspace named `api`.

The package name comes from `apps/api/package.json`:

```json
{
  "name": "api"
}
```

Likewise:

```bash
npm run dev:web
```

runs the `dev` script only inside the workspace named `web`.

## Turbo Task Configuration

The `turbo.json` file controls how Turbo runs tasks:

```json
{
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

### `dev`

```json
"dev": {
  "cache": false,
  "persistent": true
}
```

Development servers keep running, so the task is marked as `persistent`.

Caching is disabled for development because dev servers are live processes, not one-time output files.

### `build`

```json
"build": {
  "dependsOn": ["^build"],
  "outputs": ["dist/**", ".next/**"]
}
```

Build tasks can be cached because they produce output folders.

Common build outputs:

- NestJS: `dist/`
- Next.js: `.next/`

### `lint`

```json
"lint": {
  "dependsOn": ["^lint"]
}
```

This allows lint tasks to run in dependency order when packages depend on each other.

## npm Workspaces

The root `package.json` declares these workspaces:

```json
"workspaces": [
  "apps/*",
  "packages/*"
]
```

This means npm treats each folder inside `apps/` and `packages/` as part of the same project.

Benefits:

- Install dependencies once from the root
- Run workspace scripts through Turbo
- Share local packages between apps
- Keep frontend, backend, and shared code in one repo

## Adding Shared Code

Put shared types and utilities in:

```txt
packages/shared/src/
```

For example:

```ts
export type CreateStudentDto = {
  name: string;
  email: string;
  department?: string;
};
```

Then import shared code from apps when needed:

```ts
import type { Student } from '@nestnext-student-crud/shared';
```

## Common Issues

### Turbo says: `Missing packageManager field in package.json`

Make sure the root `package.json` includes:

```json
"packageManager": "npm@10.9.4"
```

Turbo uses this field to understand how the monorepo is managed.

### Port `3000` is already in use

The frontend uses port `3000` by default.

The backend uses port `3001` by default.

If you need a different backend port, run:

```bash
PORT=4000 npm run dev:api
```

Then the API will run on:

```txt
http://localhost:4000
```

### Changes in shared code are not reflected

Restart the dev command:

```bash
npm run dev
```

Shared packages are local workspace packages, so a clean restart is sometimes the quickest fix during early development.

## Recommended Workflow

1. Start the project:

   ```bash
   npm run dev
   ```

2. Open the frontend:

   ```txt
   http://localhost:3000
   ```

3. Use the backend API:

   ```txt
   http://localhost:3001
   ```

4. Add shared types in:

   ```txt
   packages/shared/src/
   ```

5. Build everything before committing:

   ```bash
   npm run build
   ```

## Tech Stack

- Node.js `v22.21.0`
- npm `10.9.4`
- Turborepo `2.9.18`
- Next.js `16.2.9`
- React `19.2.4`
- NestJS `11`
- TypeScript

