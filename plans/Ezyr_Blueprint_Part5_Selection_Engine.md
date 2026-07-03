# Ezyr Builder Blueprint --- Part 5

# Selection Engine Architecture

Version: 1.0

## Scope

This blueprint defines the Selection Engine.

The Selection Engine is the single source of truth for everything
related to selecting, focusing and inspecting nodes in the Manual
Builder.

It does NOT own rendering, drag & drop, property editing or AppSpec
mutations.

------------------------------------------------------------------------

# Why this engine exists

Every major builder feature depends on selection.

-   Property Panel
-   Keyboard Shortcuts
-   Context Menu
-   Resize Handles
-   Alignment
-   Clipboard
-   Delete
-   Duplicate
-   Group Operations
-   Future Workflow Connections

Without a dedicated Selection Engine these features become tightly
coupled.

------------------------------------------------------------------------

# Responsibilities

Own:

-   Selected node IDs
-   Active node
-   Hovered node
-   Focused node
-   Multi-selection
-   Selection box
-   Selection overlays
-   Selection mode

Never Own:

-   AppSpec
-   Component metadata
-   Property values
-   Drag logic
-   Clipboard contents
-   History

------------------------------------------------------------------------

# Architecture

Pointer / Keyboard │ ▼ Selection Controller │ ▼ Selection State │ ├──
Canvas Overlay ├── Property Engine ├── Context Menu ├── History Engine
└── Clipboard Engine

Selection is a shared service consumed by other systems.

------------------------------------------------------------------------

# Selection State

Maintain:

-   activeNodeId
-   selectedNodeIds
-   hoveredNodeId
-   focusedNodeId
-   selectionBounds
-   selectionMode
-   lastSelectedNodeId

Selection state never stores component data.

------------------------------------------------------------------------

# Selection Modes

Supported:

1.  None
2.  Single
3.  Multi
4.  Marquee (box selection)
5.  Parent Selection
6.  Locked (future)

Only one mode may be active at a time.

------------------------------------------------------------------------

# Selection Rules

Single click: - Select node - Clear previous selection

Ctrl/Cmd + Click: - Toggle node selection

Shift + Click: - Range selection (same hierarchy)

Canvas Click: - Clear selection

Double Click: - Enter component-specific editor when supported.

------------------------------------------------------------------------

# Parent / Child Selection

Rules:

-   Child is selected by default.
-   Holding Alt selects parent.
-   Breadcrumb navigation always available.
-   Selection never becomes ambiguous.

------------------------------------------------------------------------

# Multi-selection

Requirements:

-   Same hierarchy only.
-   Preserve selection order.
-   Compute shared bounding box.
-   Reject invalid mixed operations.

Supported actions:

-   Move
-   Delete
-   Duplicate
-   Align (future)

------------------------------------------------------------------------

# Marquee Selection

Selection rectangle:

-   Starts on empty canvas.
-   Selects visible nodes only.
-   Ignores locked nodes.
-   Respects viewport transforms.

------------------------------------------------------------------------

# Hover State

Hover is independent of selection.

Hover provides:

-   outline
-   drop hints
-   tooltips
-   quick actions (future)

Hover never changes AppSpec.

------------------------------------------------------------------------

# Focus Management

Keyboard focus differs from selection.

Focus determines:

-   keyboard events
-   accessibility
-   shortcuts

Focus follows selection but may diverge for text editing.

------------------------------------------------------------------------

# Selection Overlay

Overlay renders:

-   selection border
-   resize handles
-   rotation handle (future)
-   active indicator
-   multi-selection bounds

Overlay is purely visual.

------------------------------------------------------------------------

# Keyboard Shortcuts

Supported:

-   Esc → Clear selection
-   Delete → Remove selected
-   Ctrl/Cmd + A → Select all
-   Arrow keys → Nudge selection (future)
-   Ctrl/Cmd + Click → Multi-select

Selection engine emits commands only.

------------------------------------------------------------------------

# Integration

Consumes:

-   Canvas Engine
-   Drag & Drop Engine

Publishes to:

-   Property Engine
-   Clipboard Engine
-   History Engine
-   Context Menu
-   Inspector

No direct coupling.

------------------------------------------------------------------------

# Performance

-   Stable selection IDs
-   Memoized selectors
-   Overlay rendered independently
-   Avoid AppSpec subscriptions
-   O(1) active lookup

------------------------------------------------------------------------

# Error Handling

Handle:

-   Selected node deleted
-   Parent removed
-   Renderer unavailable
-   Invalid selection IDs
-   Empty selection
-   Hidden nodes
-   Virtualized nodes

Selection always self-recovers.

------------------------------------------------------------------------

# Testing

Unit

-   Single selection
-   Multi-selection
-   Toggle logic
-   Selection clearing
-   Focus transitions

Integration

-   Selection after drag
-   Selection after delete
-   Selection after duplicate
-   Selection after undo/redo
-   Marquee selection
-   Parent selection

Regression

-   Deep component trees
-   Large projects
-   Rapid repeated selection
-   Mixed component categories

Performance

-   Thousands of nodes
-   Continuous selection updates

------------------------------------------------------------------------

# Acceptance Criteria

-   Exactly one active node.
-   Multi-selection is deterministic.
-   Property panel always reflects active selection.
-   Selection survives canvas rerenders.
-   Selection never corrupts AppSpec.

------------------------------------------------------------------------

# Definition of Done

The Selection Engine is complete when:

-   Every component can be selected reliably.
-   Single, multi and marquee selection work consistently.
-   Keyboard interactions are deterministic.
-   Property Engine can consume selection without querying the canvas.
-   Other engines depend only on Selection APIs, not internal state.
-   The engine is ready for Property Engine and History Engine
    implementation.
