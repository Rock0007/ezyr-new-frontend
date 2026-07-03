# Ezyr No-Code Platform -- Phase 2 Architecture Plan

Version: 1.0

## Vision

Build an AI-first no-code platform where **AI Builder** and **Manual
Builder** share the exact same application model (AppSpec). Ant Design
is only a rendering implementation and must never leak into the core
architecture.

------------------------------------------------------------------------

# Core Principles

-   AppSpec is the single source of truth.
-   No raw Ant Design components outside adapter layer.
-   Registry-driven architecture.
-   Plugin-based design.
-   SOLID principles.
-   Feature-first organization.
-   AI generates AppSpec, never JSX.
-   Manual builder edits AppSpec.
-   Runtime renders AppSpec.
-   Exporters generate source code from AppSpec.

------------------------------------------------------------------------

# High-Level Architecture

``` text
                    Prompt
                       │
                 AI Planner
                       │
                  AppSpec (IR)
                       │
      ┌────────────────┼────────────────┐
      ▼                ▼                ▼
 Manual Builder   Runtime Renderer   Code Generator
      │                │                │
      └────────────────┴────────────────┘
```

------------------------------------------------------------------------

# Folder Structure

``` text
src/
  app/
  builder/
  components/
    ezyr/
    adapters/
  registry/
    component/
    renderer/
    adapter/
    property/
    validator/
    event/
    icon/
    template/
  renderer/
  schemas/
  runtime/
  features/
  store/
  hooks/
  services/
  lib/
  utils/
  constants/
  types/
```

------------------------------------------------------------------------

# Registry Architecture

## 1. Component Registry

Responsibilities: - register - unregister - search - categorize -
version lookup

Metadata: - id - displayName - description - icon - category - version -
defaultProps - editableProps - events - slots - childrenRules

------------------------------------------------------------------------

## 2. Renderer Registry

Maps component type → renderer.

    Button → EzyrButtonRenderer
    Input → EzyrInputRenderer

Never references Ant Design directly.

------------------------------------------------------------------------

## 3. Adapter Registry

Maps wrapper → implementation.

    EzyrButton
        ↓
    AntButtonAdapter

Future:

    EzyrButton
        ↓
    MaterialAdapter

------------------------------------------------------------------------

## 4. Property Registry

Defines property panel dynamically.

Each property defines:

-   label
-   editor type
-   validation
-   default
-   category
-   conditional visibility

Example:

Button

-   Text
-   Variant
-   Size
-   Disabled
-   Loading
-   Width
-   Height
-   Margin
-   Padding
-   Typography
-   Events

------------------------------------------------------------------------

## 5. Validator Registry

Validation rules:

-   duplicate IDs
-   circular nesting
-   invalid props
-   invalid bindings
-   orphan nodes
-   missing renderer
-   missing adapter
-   schema migration

------------------------------------------------------------------------

## 6. Event Registry

Supported events:

Button

-   click
-   dblclick
-   hover
-   focus

Input

-   change
-   blur
-   focus

Page

-   load
-   unload

------------------------------------------------------------------------

## 7. Icon Registry

Maps logical icon IDs to icon provider.

------------------------------------------------------------------------

## 8. Template Registry

Stores reusable templates.

Examples

-   Login
-   Signup
-   Hero
-   Pricing
-   Dashboard

------------------------------------------------------------------------

# Component Layers

``` text
AppSpec
   │
Registry
   │
Wrapper
   │
Adapter
   │
Ant Design
```

Builder only understands wrapper layer.

------------------------------------------------------------------------

# Wrapper Components

Every component:

-   EzyrButton
-   EzyrInput
-   EzyrCard
-   EzyrModal
-   EzyrDrawer
-   EzyrTabs
-   EzyrTable
-   EzyrAvatar
-   EzyrTypography

No Ant imports outside adapters.

------------------------------------------------------------------------

# AppSpec Schema

Each node:

``` json
{
  "id":"uuid",
  "type":"Button",
  "props":{},
  "style":{},
  "bindings":{},
  "events":{},
  "children":[]
}
```

------------------------------------------------------------------------

# Builder Flow

1.  User drags component.
2.  Component registry creates node.
3.  Property registry supplies editors.
4.  Redux updates AppSpec.
5.  Renderer renders wrapper.
6.  Adapter renders Ant component.

------------------------------------------------------------------------

# Property System

Generated entirely from metadata.

Supports:

-   layout
-   appearance
-   spacing
-   typography
-   animation
-   accessibility
-   visibility
-   permissions
-   bindings
-   workflow hooks

------------------------------------------------------------------------

# Event Flow

``` text
Button Click
      │
Event Registry
      │
Workflow Graph
      │
Execution Engine
```

------------------------------------------------------------------------

# Drag & Drop Rules

Each component declares:

-   allowed parent
-   allowed children
-   max children
-   min children

Examples:

Button - no children

Card - unlimited children

Tabs - Tab only

Form - FormItem only

------------------------------------------------------------------------

# Runtime

Renderer:

AppSpec → Registry → Wrapper → Adapter → Browser

------------------------------------------------------------------------

# Theme Engine

Never hardcode values.

Tokens:

-   colors
-   typography
-   radius
-   spacing
-   shadow
-   motion
-   breakpoints

------------------------------------------------------------------------

# Performance

-   React.memo
-   lazy loading
-   dynamic imports
-   registry caching
-   virtualization
-   normalized Redux state
-   stable IDs
-   immutable updates

------------------------------------------------------------------------

# Edge Cases

Handle:

-   unknown component
-   missing adapter
-   missing renderer
-   duplicate IDs
-   deleted parent
-   orphan child
-   circular references
-   invalid drag
-   invalid schema
-   invalid bindings
-   schema upgrades
-   adapter mismatch
-   renderer failure
-   theme fallback

------------------------------------------------------------------------

# AI Strategy

AI never outputs JSX.

AI outputs AppSpec only.

Planner: - pages - layouts - components - workflows - data - theme

------------------------------------------------------------------------

# Future Exporters

Same AppSpec supports:

-   Runtime
-   Next.js
-   React
-   Flutter
-   React Native

------------------------------------------------------------------------

# Development Phases

## Phase 1

-   Foundation
-   Registries
-   Wrappers
-   Renderer

## Phase 2

-   Manual Builder
-   Property Panel
-   Drag & Drop

## Phase 3

-   Workflow Builder

## Phase 4

-   AI Planner

## Phase 5

-   Exporters

## Phase 6

-   Marketplace
-   Plugins
-   Collaboration

------------------------------------------------------------------------

# Codex Rules

-   Never import Ant Design outside adapters.
-   Never use switch statements for components.
-   Everything registry-driven.
-   Everything typed.
-   No `any`.
-   Follow SOLID.
-   Prefer composition over inheritance.
-   Keep AppSpec framework-agnostic.
