import type { ComponentType, ReactNode } from "react";
import type {
  AppComponentType,
  AppNode,
  AppSpec,
  JsonObject,
  JsonValue,
} from "@/schemas/app-spec";

export type RegistryKey = string;

export type RegistryEntry = {
  readonly id: RegistryKey;
};

export type RegistrySearchOptions = {
  readonly query?: string;
  readonly category?: string;
};

export type PropertyEditorType =
  | "text"
  | "textarea"
  | "number"
  | "boolean"
  | "select"
  | "color"
  | "spacing"
  | "event"
  | "binding";

export type PropertyDefinition = {
  readonly id: string;
  readonly label: string;
  readonly editor: PropertyEditorType;
  readonly category: string;
  readonly valueSource: "props" | "style" | "bindings" | "events";
  readonly valueKey: string;
  readonly defaultValue?: JsonValue;
  readonly options?: readonly {
    readonly label: string;
    readonly value: string;
  }[];
  readonly validate?: (value: JsonValue, node: AppNode) => string | null;
  readonly isVisible?: (node: AppNode) => boolean;
};

export type ComponentCategory =
  | "layout"
  | "content"
  | "input"
  | "feedback"
  | "data"
  | "navigation";

export type ComponentTaxonomy =
  | "layout"
  | "content"
  | "interactive"
  | "overlay"
  | "navigation"
  | "data-display"
  | "data-entry"
  | "feedback"
  | "business";

export type ComponentRuntimeMode =
  | "rendered"
  | "conditional"
  | "workflow-triggered"
  | "runtime-only";

export type ComponentEditingBehavior =
  | { readonly panel: "standard" }
  | { readonly panel: "mini-builder"; readonly miniBuilderId: string };

export type ComponentCanvasBehavior = {
  readonly draggable: boolean;
  readonly droppable: boolean;
  readonly nestable: boolean;
  readonly acceptsChildren: boolean;
  readonly autoCreateChildren?: boolean;
  readonly defaultInsertParent?: AppComponentType;
};

export type ChildrenRules = {
  readonly allowedParents?: readonly AppComponentType[];
  readonly allowedChildren?: readonly AppComponentType[];
  readonly minChildren?: number;
  readonly maxChildren?: number;
};

export type ComponentCompositionRules = ChildrenRules & {
  readonly validSlots?: readonly string[];
};

export type ComponentDefinition = {
  readonly id: AppComponentType;
  readonly displayName: string;
  readonly description: string;
  readonly icon: string;
  /**
   * Legacy grouping retained while older registry search and generated
   * property code still reference category.
   */
  readonly category: ComponentCategory;
  readonly taxonomy: ComponentTaxonomy;
  readonly version: string;
  readonly defaultProps: Record<string, JsonValue>;
  readonly defaultStyle?: JsonObject;
  readonly editableProps: readonly string[];
  readonly events: readonly string[];
  readonly slots: readonly string[];
  readonly childrenRules: ChildrenRules;
  readonly canvas: ComponentCanvasBehavior;
  readonly runtime: {
    readonly mode: ComponentRuntimeMode;
  };
  readonly editing: ComponentEditingBehavior;
  readonly composition: ComponentCompositionRules;
};

export type ComponentAdapterProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export type ComponentAdapter = ComponentType<ComponentAdapterProps>;

export type AdapterDefinition = {
  readonly id: string;
  readonly componentType: AppComponentType;
  readonly provider: string;
  readonly component: ComponentAdapter;
};

export type RendererDefinition = {
  readonly id: AppComponentType;
  readonly render: (node: AppNode, children: ReactNode) => ReactNode;
  readonly load?: () => Promise<RendererDefinition>;
};

export type ValidationIssueSeverity = "error" | "warning";

export type ValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly severity: ValidationIssueSeverity;
  readonly nodeId?: string;
  readonly path?: string;
  readonly suggestedFix?: string;
};

export type ValidatorDefinition = {
  readonly id: string;
  readonly validate: (root: AppNode) => readonly ValidationIssue[];
  readonly validateSpec?: (spec: AppSpec) => readonly ValidationIssue[];
};

export type EventDefinition = {
  readonly id: string;
  readonly componentType: AppComponentType;
  readonly name: string;
  readonly description: string;
  readonly payloadSchema?: JsonObject;
  readonly validatePayload?: (payload: JsonObject) => string | null;
};

export type IconDefinition = {
  readonly id: string;
  readonly label: string;
};

export type TemplateDefinition = {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly root: AppNode;
};

export type ThemeTokenGroup =
  | "colors"
  | "typography"
  | "spacing"
  | "radius"
  | "shadow"
  | "motion"
  | "breakpoints";

export type ThemeTokenDefinition = {
  readonly id: string;
  readonly group: ThemeTokenGroup;
  readonly name: string;
  readonly value: JsonValue;
  readonly description?: string;
};

export type AssetDefinition = {
  readonly id: string;
  readonly source: string;
  readonly mimeType: string;
  readonly alt?: string;
  readonly width?: number;
  readonly height?: number;
};

export type HistoryCommandDefinition = {
  readonly id: string;
  readonly label: string;
  readonly mergeWindowMs?: number;
};

export type SelectionModeDefinition = {
  readonly id: string;
  readonly label: string;
  readonly allowsMultiple: boolean;
};
