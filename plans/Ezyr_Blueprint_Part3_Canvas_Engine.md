# Ezyr Builder Blueprint --- Part 3

# Canvas Engine Architecture

Version: 1.0

## Scope

This document defines ONLY the Canvas Engine.

The Canvas Engine is the visual workspace where users build
applications. It does not know anything about AI, workflows, React
components or Ant Design. Its only responsibility is to visualize and
manipulate the AppSpec.

------------------------------------------------------------------------

# Objectives

The Canvas Engine must:

-   Render AppSpec visually
-   Support drag & drop
-   Support nested layouts
-   Support infinite canvas
-   Maintain selection state
-   Be performant for large pages
-   Work for both Manual Builder and future AI Builder

------------------------------------------------------------------------

# Responsibilities

Own:

-   viewport
-   zoom
-   pan
-   coordinate system
-   guides
-   overlays
-   selection visuals
-   insertion placeholders

Never own:

-   component metadata
-   business logic
-   renderer implementations
-   workflows
-   API calls

------------------------------------------------------------------------

# Architecture

User Action ↓ Canvas Controller ↓ Canvas State ↓ AppSpec Updates ↓
Renderer ↓ Viewport

Canvas is a thin orchestration layer.

------------------------------------------------------------------------

# Internal Modules

1.  Viewport Manager
2.  Coordinate System
3.  Grid System
4.  Zoom Controller
5.  Pan Controller
6.  Overlay Layer
7.  Selection Layer
8.  Placeholder Layer
9.  Render Scheduler
10. Performance Manager

Each module has a single responsibility.

------------------------------------------------------------------------

# Viewport

Responsibilities

-   visible bounds
-   scrolling
-   viewport calculations
-   culling (future)

Support

-   Fit to screen
-   Center page
-   Reset zoom

------------------------------------------------------------------------

# Coordinate System

Every component has:

-   x
-   y
-   width
-   height

Never calculate positions inside components.

Layout engine owns layout.

Canvas owns coordinates.

------------------------------------------------------------------------

# Zoom

Requirements

-   mouse wheel
-   touchpad
-   toolbar controls
-   keyboard shortcuts

Limits

Minimum 10%

Maximum 400%

Maintain cursor position while zooming.

------------------------------------------------------------------------

# Pan

Support

-   middle mouse
-   space + drag
-   touchpad

Do not interfere with drag operations.

------------------------------------------------------------------------

# Grid

Provide

-   optional grid
-   snap to grid
-   configurable spacing

Grid is visual only.

------------------------------------------------------------------------

# Selection Layer

Display

-   selection borders
-   resize handles
-   hover outlines
-   insertion targets

Selection rendering must never modify AppSpec.

------------------------------------------------------------------------

# Placeholder Layer

During drag operations

Display

-   insertion indicator
-   drop highlight
-   invalid drop indicator

------------------------------------------------------------------------

# Rendering Strategy

Render only visible nodes.

Separate

Editor Renderer

from

Runtime Renderer.

Editor renderer adds overlays.

Runtime renderer does not.

------------------------------------------------------------------------

# Performance Strategy

Implement

-   React.memo
-   stable keys
-   requestAnimationFrame batching
-   virtualization hooks
-   lazy rendering
-   memoized selectors

Avoid

-   full tree rerenders
-   deep prop drilling
-   mutable state

------------------------------------------------------------------------

# State Ownership

Redux owns

-   viewport
-   zoom
-   pan
-   selection ids

AppSpec owns

-   nodes
-   layout tree

Canvas owns no persistent project data.

------------------------------------------------------------------------

# Error Handling

Gracefully recover from

-   invalid coordinates
-   missing nodes
-   deleted nodes
-   invalid selection
-   renderer failure

Never crash the builder.

------------------------------------------------------------------------

# Testing

Unit

-   viewport calculations
-   zoom math
-   pan math
-   coordinate transforms

Integration

-   render large page
-   nested layouts
-   selection overlays
-   placeholder rendering

Performance

-   1000+ nodes
-   deep nesting
-   repeated zoom/pan

Acceptance

-   Smooth 60 FPS interaction on typical projects
-   No AppSpec corruption
-   Stable rendering under rapid user interaction

------------------------------------------------------------------------

# Definition of Done

Canvas Engine is complete when:

-   Infinite canvas is operational.
-   Zoom and pan are smooth.
-   Selection overlays are accurate.
-   Placeholder rendering works.
-   Canvas manipulates AppSpec without directly depending on component
    implementations.
-   Architecture is ready for Drag & Drop Engine without modification.
