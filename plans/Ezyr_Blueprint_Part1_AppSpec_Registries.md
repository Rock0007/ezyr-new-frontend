# Ezyr Builder Blueprint --- Part 1

Version: 1.0

# Scope

This document covers ONLY the first five implementation milestones.

1.  AppSpec
2.  Component Registry
3.  Renderer Registry
4.  Adapter Registry
5.  Property Registry

These five modules are the foundation of the entire platform. Every
future feature (AI Planner, Manual Builder, Runtime, Workflow Engine,
Exporters) depends on them.

------------------------------------------------------------------------

# Guiding Principles

-   AppSpec is the only source of truth.
-   Registries own metadata, not state.
-   The Builder edits AppSpec only.
-   AI generates AppSpec only.
-   Ant Design never appears outside adapters.
-   Everything is plugin-driven.
-   Everything is versioned.
-   No switch statements.

------------------------------------------------------------------------

# 1. AppSpec

## Objective

Create a framework-agnostic Intermediate Representation (IR) that
describes an application independently of React, Next.js, or Ant Design.

## Owns

-   Pages
-   Component tree
-   Theme reference
-   Bindings
-   Events
-   Metadata
-   Version

## Does NOT Own

-   React components
-   JSX
-   Runtime instances
-   Library-specific props

## Top-level Structure

-   version
-   project
-   pages
-   assets
-   themes
-   workflows (future reference)
-   globals

## Node Contract

Every node must contain:

-   id (UUID)
-   type
-   props
-   style
-   bindings
-   events
-   children

IDs must be globally unique.

## Validation Rules

-   No duplicate IDs
-   No circular trees
-   No orphan nodes
-   Schema version required
-   Unknown component types rejected

## Acceptance Criteria

-   Serializable to JSON
-   Deserializable without data loss
-   Stable across versions

------------------------------------------------------------------------

# 2. Component Registry

## Objective

Maintain the catalog of every supported Ezyr component.

## Responsibilities

-   Register components
-   Discover components
-   Categorize components
-   Expose metadata
-   Support plugins

## Public API

-   register()
-   unregister()
-   get()
-   getAll()
-   search()
-   has()

## Component Metadata

Each component defines:

-   type
-   displayName
-   category
-   icon
-   version
-   defaultProps
-   editableProperties
-   supportedEvents
-   allowedParents
-   allowedChildren
-   autoCreateChildren
-   rendererId
-   adapterId
-   propertySchemaId

## Never Store

-   React instances
-   Runtime state
-   Canvas state

## Acceptance Criteria

-   O(1) lookup by type
-   Dynamic registration
-   Duplicate detection

------------------------------------------------------------------------

# 3. Renderer Registry

## Objective

Resolve AppSpec nodes into Ezyr renderers.

Pipeline:

AppSpec Node → Renderer Registry → Wrapper Renderer

## Responsibilities

-   Map type → renderer
-   Lazy-load renderers
-   Handle missing renderer fallback

## Failure Behaviour

Unknown renderer should display a builder placeholder instead of
crashing.

## Acceptance Criteria

-   Dynamic renderer lookup
-   Memoized renderer cache

------------------------------------------------------------------------

# 4. Adapter Registry

## Objective

Hide Ant Design behind Ezyr wrappers.

Pipeline:

EzyrButton → Ant Button

The builder never imports Ant Design directly.

## Responsibilities

-   Wrapper → UI implementation mapping
-   Future support for additional UI libraries

## Rules

-   All Ant imports isolated here
-   No business logic
-   No builder logic

## Acceptance Criteria

-   Swappable implementation
-   Zero Ant imports outside adapter layer

------------------------------------------------------------------------

# 5. Property Registry

## Objective

Generate the property panel dynamically from metadata.

Never hardcode forms.

## Responsibilities

Provide:

-   groups
-   editors
-   defaults
-   validation
-   visibility conditions

## Property Groups

-   General
-   Layout
-   Appearance
-   Typography
-   Spacing
-   Visibility
-   Accessibility
-   Events
-   Bindings

## Example

Button exposes:

-   Text
-   Variant
-   Size
-   Disabled
-   Loading
-   Width
-   Margin
-   Padding
-   onClick

The property panel reads metadata and builds itself.

## Acceptance Criteria

-   Zero component-specific forms
-   Dynamic rendering
-   Conditional fields supported

------------------------------------------------------------------------

# Cross-cutting Testing

## Unit

-   Registry APIs
-   Metadata validation
-   Property generation
-   AppSpec serialization

## Integration

-   AppSpec → Renderer
-   Registry → Renderer
-   Property edits update AppSpec

## Regression

-   Older AppSpec versions still load
-   Plugin registration does not affect existing components

------------------------------------------------------------------------

# Definition of Done

All five modules are complete when:

-   A component can be registered.
-   It can be represented in AppSpec.
-   A renderer is resolved through the Renderer Registry.
-   Rendering occurs through a wrapper and adapter.
-   The Property Registry generates the editing UI from metadata.
-   No code anywhere depends directly on Ant Design except the adapter
    layer.
