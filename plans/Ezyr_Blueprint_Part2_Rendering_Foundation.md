# Ezyr Builder Blueprint --- Part 2

Version: 1.0

# Scope

This blueprint covers the next five foundational systems:

6.  Validator Registry
7.  Event Registry
8.  Theme Registry
9.  Wrapper Components
10. Recursive Renderer

These systems complete the rendering foundation before the Manual
Builder is implemented.

------------------------------------------------------------------------

# 6. Validator Registry

## Objective

Provide centralized validation for AppSpec and component rules.

## Responsibilities

-   Validate AppSpec integrity
-   Validate component nesting
-   Validate property values
-   Validate bindings
-   Validate event references
-   Validate schema version
-   Produce structured diagnostics

## Validation Pipeline

Schema → Component Rules → Parent/Child Rules → Bindings → Events →
Theme → Final Diagnostics

## Rules

-   Duplicate IDs
-   Circular references
-   Orphan nodes
-   Invalid parent
-   Invalid child
-   Missing required props
-   Invalid enum values
-   Missing event target
-   Invalid bindings
-   Unknown component types

## Output

Each error contains:

-   severity
-   nodeId
-   code
-   message
-   suggested fix

Validation never mutates AppSpec.

## Tests

-   Valid AppSpec
-   Invalid nesting
-   Invalid schema version
-   Missing props
-   Duplicate IDs
-   Broken bindings

------------------------------------------------------------------------

# 7. Event Registry

## Objective

Standardize all UI events independent of implementation.

## Responsibilities

-   Register events
-   Discover supported events
-   Validate event payloads
-   Connect events to future workflows

## Event Model

Each event defines:

-   id
-   name
-   payload schema
-   supported component types

Examples

Button: - click - doubleClick - focus

Input: - change - blur

Page: - load - unload

No workflow execution logic belongs here.

## Tests

-   Event registration
-   Duplicate detection
-   Payload validation

------------------------------------------------------------------------

# 8. Theme Registry

## Objective

Centralize design tokens.

## Owns

-   colors
-   typography
-   spacing
-   radius
-   shadows
-   breakpoints
-   motion

Components reference tokens only.

No hardcoded colors.

## Responsibilities

-   Theme lookup
-   Token resolution
-   Dark mode readiness
-   Theme inheritance

## Tests

-   Missing token fallback
-   Theme switching
-   Invalid token detection

------------------------------------------------------------------------

# 9. Wrapper Components

## Objective

Expose stable Ezyr components while hiding Ant Design.

Examples

-   EzyrButton
-   EzyrInput
-   EzyrCard
-   EzyrModal
-   EzyrTable
-   EzyrTabs

## Responsibilities

-   Consume AppSpec props
-   Resolve design tokens
-   Delegate rendering to adapters

Wrappers never contain builder logic.

## Acceptance

-   No Ant imports outside adapters
-   Stable public API
-   Theme aware

## Tests

-   Rendering
-   Token application
-   Prop mapping

------------------------------------------------------------------------

# 10. Recursive Renderer

## Objective

Render any AppSpec tree.

## Pipeline

AppSpec → Validator → Component Registry → Renderer Registry → Wrapper →
Adapter → Browser

## Responsibilities

-   Recursive rendering
-   Child rendering
-   Error boundaries
-   Placeholder rendering
-   Lazy loading
-   Memoization

## Rendering Rules

-   Validate before render
-   Skip invalid nodes with diagnostics
-   Preserve tree order
-   Stable keys
-   Render children recursively

## Performance

-   React.memo
-   Lazy imports
-   Stable references
-   Viewport rendering (future)
-   Registry cache

## Tests

-   Deep nesting
-   Unknown component
-   Invalid node
-   Large trees
-   Renderer recovery

------------------------------------------------------------------------

# Cross-module Integration

Flow

AppSpec → Validator Registry → Component Registry → Renderer Registry →
Wrapper → Adapter → Ant Design

Event Registry and Theme Registry enrich rendering but never own
rendering.

------------------------------------------------------------------------

# Definition of Done

These five modules are complete when:

-   Validation blocks invalid AppSpecs.
-   Events are discoverable through metadata.
-   Themes resolve through tokens.
-   Wrappers fully abstract Ant Design.
-   Recursive renderer can render any valid AppSpec tree safely and
    consistently.
