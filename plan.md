You are a senior Staff Software Engineer.

Create a production-grade foundation for a modern AI-powered No-Code Platform called "Ezyr".

## Objective

This project will become an AI website/app builder similar to Framer, Bubble, FlutterFlow, Lovable and n8n.

The initial milestone is ONLY the manual UI Builder.

The architecture must be scalable enough to support:

- AI UI generation
- Drag & Drop Page Builder
- Workflow Canvas
- Database Builder
- API Builder
- Authentication
- Theme Builder
- Publishing
- Reusable Components
- Subsystems
- Marketplace

Do NOT build those features now.
Only create the project foundation.

---

## Tech Stack

Framework

- Next.js (latest App Router)
- React (latest)
- TypeScript

Styling

- Tailwind CSS (latest)

UI Library

- Ant Design (latest)

State Management

- Redux Toolkit
- RTK Query

Drag & Drop

- dnd-kit

Workflow Canvas

- React Flow

Forms

- React Hook Form
- Zod

Icons

- Lucide React

Animations

- Motion

Utilities

- clsx
- class-variance-authority
- tailwind-merge
- uuid

Developer Experience

- ESLint
- Prettier
- Husky
- lint-staged

Package Manager

- npm

---

## Folder Structure

Create a scalable enterprise architecture.

src/

app/

components/
ui/
builder/
layout/

features/
builder/
workflow/
projects/
assets/
auth/

store/
api/
slices/

hooks/

lib/

registry/

renderer/

types/

utils/

services/

constants/

styles/

---

## Configure Redux

Configure

store.ts

Provider

RTK Query base api

Example slice

Builder slice

---

## Configure Ant Design

Use Ant Design v5.

Support App Router.

Support dark mode later.

---

## Configure Tailwind

Set up properly.

Organize globals.

Create utility classes.

---

## Configure Aliases

Use

@/\*

---

## Configure Absolute Imports

Use TypeScript paths.

---

## Configure Environment Variables

.env.local

Example variables

API URL

OpenAI URL

---

## Create Basic Layout

Top Toolbar

Left Sidebar

Center Canvas

Right Property Panel

Bottom Console

Use Ant Design Layout components.

Each section should be an independent React component.

No functionality yet.

---

## Builder State

Create Redux slices for

builder

selection

project

history

theme

workflow

Only include initial state and example reducers.

---

## Quality Requirements

- Strict TypeScript
- No any types
- Reusable architecture
- Feature-first organization
- Clean imports
- Enterprise coding standards
- SOLID principles
- Easy to scale
- No duplicated code

---

## Deliverables

1. Initialize the latest Next.js project.
2. Install every required dependency.
3. Configure everything.
4. Create the folder structure.
5. Configure Redux and RTK Query.
6. Configure Tailwind.
7. Configure Ant Design.
8. Create the base IDE-like layout.
9. Ensure the project runs successfully with `npm run dev`.
10. Explain every architectural decision after implementation.
