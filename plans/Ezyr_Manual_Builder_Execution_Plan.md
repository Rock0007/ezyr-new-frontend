# Ezyr Manual Builder Execution Plan

## Goal

Build a robust schema-first architecture powering both Manual Builder
and future AI Builder.

## Core Principles

-   AppSpec is the only source of truth.
-   Builder edits AppSpec only.
-   AI generates AppSpec only.
-   Ant Design is hidden behind Ezyr wrapper components.
-   Registry-driven architecture.
-   No component-specific logic inside the builder.
-   Separate editor renderer and runtime renderer.

## Phase 1 -- Foundation

### Deliverables

-   AppSpec
-   Component Registry
-   Renderer Registry
-   Adapter Registry
-   Property Registry
-   Validator Registry
-   Event Registry
-   Theme Registry
-   Wrapper Components
-   Recursive Renderer
-   Redux Foundation

### Acceptance

-   Registry-driven rendering
-   Nested rendering
-   Adapter isolation
-   Graceful failure for unknown components

### Tests

-   Registry registration
-   Lookup
-   Duplicate prevention
-   Renderer snapshots
-   Invalid schema
-   Missing adapter
-   Wrapper rendering

## Phase 2 -- Manual Builder

### Deliverables

-   Sidebar
-   Canvas
-   Drag & Drop
-   Property Panel
-   Component Tree
-   Selection
-   Clipboard
-   Undo/Redo
-   Delete/Duplicate
-   Zoom/Pan
-   History

### Acceptance

-   Builder edits AppSpec only
-   Property panel generated from metadata
-   Canvas reflects AppSpec
-   Reliable undo/redo

### Tests

-   Drag/drop
-   Nested layouts
-   Invalid drops
-   Keyboard shortcuts
-   Serialization
-   Deserialization

## Component Taxonomy

-   Layout
-   Static
-   Interactive
-   Composite
-   Overlay
-   Data
-   Runtime

Composite components own dedicated editors. Runtime components are
workflow outputs and never draggable.

## Builder Rules

Each component declares: - draggable - selectable - movable -
resizable - container - runtimeOnly - dedicatedEditor -
autoCreatedChildren - allowedParents - allowedChildren - maxChildren

## Renderer

AppSpec -\> Registry -\> Wrapper -\> Adapter -\> Ant Design.

## State

Redux Toolkit: - project - pages - nodes - selection - history -
clipboard - builderUI

RTK Query: - server APIs only

## Validation

Validate: - duplicate IDs - invalid nesting - orphan nodes - circular
references - invalid bindings - missing renderer - missing adapter

## AI Contract

AI outputs only AppSpec. Manual Builder edits the same AppSpec.

## Definition of Done

Foundation: - Stable registries - Stable renderer - Adapter isolation

Manual Builder: - Complete page creation - Metadata-driven editing -
Persistent AppSpec - Reliable validation - Ready for AI Planner without
architectural changes.
