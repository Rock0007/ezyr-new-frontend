# Ezyr Builder Blueprint --- Part 4

# Drag & Drop Engine Architecture

Version: 1.0

## Scope

This document specifies the Drag & Drop Engine for the Ezyr Builder.

The engine is responsible only for moving, inserting, reordering and
nesting components on the canvas. It does not render components, edit
properties, execute workflows or know about Ant Design.

------------------------------------------------------------------------

# Objectives

The engine must:

-   Support drag from component palette to canvas
-   Support dragging existing components
-   Support nested layouts
-   Support reordering
-   Prevent invalid drops
-   Produce deterministic AppSpec updates
-   Scale to large pages

------------------------------------------------------------------------

# Ownership

## Owns

-   Drag session lifecycle
-   Drop calculations
-   Collision detection
-   Placeholder positioning
-   Parent/child validation
-   Reorder calculations
-   Auto-scroll while dragging

## Does NOT Own

-   Rendering
-   Property editing
-   Component metadata
-   Selection persistence
-   History persistence
-   Workflows

------------------------------------------------------------------------

# Architecture

Palette / Canvas │ ▼ Drag Controller │ ▼ Drag Session │ ▼ Drop Validator
│ ▼ Insertion Planner │ ▼ AppSpec Mutation │ ▼ Canvas Refresh

All mutations must occur through a single command pipeline.

------------------------------------------------------------------------

# Drag Lifecycle

1.  Drag Start

-   Validate draggable
-   Create drag session
-   Capture source node
-   Capture pointer offset

2.  Drag Move

-   Track pointer
-   Resolve hover target
-   Update placeholder
-   Auto-scroll if required

3.  Drop

-   Validate target
-   Calculate insertion index
-   Generate mutation command
-   Apply AppSpec update

4.  Drag End

-   Clear overlays
-   Destroy drag session

------------------------------------------------------------------------

# Drag Types

Supported:

-   New Component
-   Existing Component
-   Multiple Components (future-ready)

Every drag has:

-   source type
-   source id
-   drag payload
-   preview
-   allowed operations

------------------------------------------------------------------------

# Drop Targets

Every target exposes:

-   accepts component types
-   max children
-   insertion mode
-   layout strategy

A target never decides business rules. Rules come from the Component
Registry.

------------------------------------------------------------------------

# Validation Pipeline

Before every drop:

1.  Component exists
2.  Parent valid
3.  Child valid
4.  Max children
5.  Prevent self-drop
6.  Prevent circular nesting
7.  Prevent orphan state
8.  Validate auto-created children
9.  Validate layout constraints

If any validation fails: - Reject mutation - Show visual feedback -
Preserve AppSpec

------------------------------------------------------------------------

# Insertion Planner

The planner determines:

-   parent
-   index
-   placement
-   sibling order

Supported modes:

-   before
-   after
-   inside-start
-   inside-end

Planner must be deterministic.

------------------------------------------------------------------------

# Placeholder Engine

Shows:

-   insertion line
-   container highlight
-   invalid drop indicator
-   active target

Placeholder is visual only.

Never mutates state.

------------------------------------------------------------------------

# Collision Detection

Priority:

1.  Container interiors
2.  Component edges
3.  Empty containers

Ignore hidden nodes.

Prefer nearest valid target.

------------------------------------------------------------------------

# Auto-scroll

When pointer approaches viewport edge:

-   begin smooth scroll
-   preserve drag session
-   continue collision detection

Never interrupt drag.

------------------------------------------------------------------------

# Nested Components

Support:

Container ├── Card │ ├── Form │ └── Button └── Grid

Rules always come from metadata.

------------------------------------------------------------------------

# AppSpec Mutation Rules

All mutations use commands.

Commands:

-   InsertNode
-   MoveNode
-   RemoveNode
-   ReorderNode

No direct array manipulation from UI code.

------------------------------------------------------------------------

# Error Handling

Handle:

-   target deleted mid-drag
-   source deleted
-   invalid registry entry
-   renderer unavailable
-   duplicate ids
-   invalid placeholder
-   interrupted drag

Always rollback gracefully.

------------------------------------------------------------------------

# Performance

-   requestAnimationFrame updates
-   memoized collision calculations
-   stable drag payload
-   avoid full tree rerenders
-   incremental AppSpec updates

------------------------------------------------------------------------

# Testing

## Unit

-   insertion planner
-   collision detection
-   validation rules
-   command generation

## Integration

-   drag from palette
-   reorder siblings
-   nested insertion
-   invalid drops
-   auto-scroll
-   placeholder updates

## Regression

-   deep nesting
-   large pages
-   repeated drag operations
-   interrupted drag

## Acceptance Criteria

-   Drag operations never corrupt AppSpec.
-   Invalid drops are impossible.
-   Placeholder always matches final insertion.
-   Nested layouts remain valid.
-   Performance remains smooth on large projects.

------------------------------------------------------------------------

# Definition of Done

The Drag & Drop Engine is complete when:

-   Any registered component can be dragged from the palette.
-   Existing components can be reordered safely.
-   Parent/child rules are enforced.
-   AppSpec updates only through command objects.
-   Rollback occurs on validation failure.
-   The engine is reusable by both the Manual Builder and future
    AI-assisted editing features.
