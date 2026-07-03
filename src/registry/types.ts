import type { ComponentType, ReactNode } from "react";
import type { AppComponentType, AppNode, JsonValue } from "@/schemas/app-spec";

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
  readonly isVisible?: (node: AppNode) => boolean;
};

export type ComponentCategory =
  "layout" | "content" | "input" | "feedback" | "data" | "navigation";

export type ChildrenRules = {
  readonly allowedParents?: readonly AppComponentType[];
  readonly allowedChildren?: readonly AppComponentType[];
  readonly minChildren?: number;
  readonly maxChildren?: number;
};

export type ComponentDefinition = {
  readonly id: AppComponentType;
  readonly displayName: string;
  readonly description: string;
  readonly icon: string;
  readonly category: ComponentCategory;
  readonly version: string;
  readonly defaultProps: Record<string, JsonValue>;
  readonly editableProps: readonly string[];
  readonly events: readonly string[];
  readonly slots: readonly string[];
  readonly childrenRules: ChildrenRules;
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
};

export type ValidationIssueSeverity = "error" | "warning";

export type ValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly severity: ValidationIssueSeverity;
  readonly nodeId?: string;
};

export type ValidatorDefinition = {
  readonly id: string;
  readonly validate: (root: AppNode) => readonly ValidationIssue[];
};

export type EventDefinition = {
  readonly id: string;
  readonly componentType: AppComponentType;
  readonly name: string;
  readonly description: string;
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
