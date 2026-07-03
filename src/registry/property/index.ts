import { TypedRegistry } from "@/registry/create-registry";
import { coreComponentDefinitions } from "@/registry/component/definitions";
import type { AppNode, JsonValue } from "@/schemas/app-spec";
import type { PropertyDefinition } from "@/registry/types";

export type ComponentPropertyDefinition = PropertyDefinition & {
  readonly componentType: string;
};

const overflowOptions = [
  { label: "Visible", value: "visible" },
  { label: "Auto", value: "auto" },
  { label: "Scroll", value: "scroll" },
  { label: "Hidden", value: "hidden" },
  { label: "Clip", value: "clip" },
] as const;

const specializedProperties: readonly ComponentPropertyDefinition[] = [
  {
    id: "Button.text",
    componentType: "Button",
    label: "Text",
    editor: "text",
    category: "Content",
    valueSource: "props",
    valueKey: "text",
    defaultValue: "Button",
  },
  {
    id: "Button.variant",
    componentType: "Button",
    label: "Variant",
    editor: "select",
    category: "Appearance",
    valueSource: "props",
    valueKey: "variant",
    defaultValue: "primary",
    options: [
      { label: "Primary", value: "primary" },
      { label: "Default", value: "default" },
      { label: "Dashed", value: "dashed" },
      { label: "Text", value: "text" },
      { label: "Link", value: "link" },
    ],
  },
  {
    id: "Button.disabled",
    componentType: "Button",
    label: "Disabled",
    editor: "boolean",
    category: "State",
    valueSource: "props",
    valueKey: "disabled",
    defaultValue: false,
  },
  {
    id: "Button.loading",
    componentType: "Button",
    label: "Loading",
    editor: "boolean",
    category: "State",
    valueSource: "props",
    valueKey: "loading",
    defaultValue: false,
  },
  {
    id: "Text.text",
    componentType: "Text",
    label: "Text",
    editor: "textarea",
    category: "Content",
    valueSource: "props",
    valueKey: "text",
    defaultValue: "Text",
  },
  {
    id: "Text.level",
    componentType: "Text",
    label: "Level",
    editor: "select",
    category: "Typography",
    valueSource: "props",
    valueKey: "level",
    defaultValue: "body",
    options: [
      { label: "Heading", value: "heading" },
      { label: "Body", value: "body" },
    ],
  },
  {
    id: "Image.src",
    componentType: "Image",
    label: "Source",
    editor: "text",
    category: "Content",
    valueSource: "props",
    valueKey: "src",
    defaultValue: "",
  },
  {
    id: "Image.alt",
    componentType: "Image",
    label: "Alt text",
    editor: "text",
    category: "Accessibility",
    valueSource: "props",
    valueKey: "alt",
    defaultValue: "",
  },
  {
    id: "Section.padding",
    componentType: "Section",
    label: "Padding",
    editor: "spacing",
    category: "Layout",
    valueSource: "style",
    valueKey: "padding",
    defaultValue: "32px",
  },
  {
    id: "Section.background",
    componentType: "Section",
    label: "Background",
    editor: "color",
    category: "Appearance",
    valueSource: "style",
    valueKey: "background",
    defaultValue: "#ffffff",
  },
  {
    id: "Section.radius",
    componentType: "Section",
    label: "Radius",
    editor: "spacing",
    category: "Appearance",
    valueSource: "style",
    valueKey: "radius",
    defaultValue: "6px",
  },
  {
    id: "Frame.padding",
    componentType: "Frame",
    label: "Padding",
    editor: "spacing",
    category: "Layout",
    valueSource: "style",
    valueKey: "padding",
    defaultValue: "0",
  },
  {
    id: "Frame.scroll.minHeight",
    componentType: "Frame",
    label: "Minimum height",
    editor: "spacing",
    category: "Scroll",
    valueSource: "style",
    valueKey: "minHeight",
    defaultValue: "100vh",
  },
  {
    id: "Frame.scroll.height",
    componentType: "Frame",
    label: "Height",
    editor: "spacing",
    category: "Scroll",
    valueSource: "style",
    valueKey: "height",
    defaultValue: "",
  },
  {
    id: "Frame.scroll.maxHeight",
    componentType: "Frame",
    label: "Maximum height",
    editor: "spacing",
    category: "Scroll",
    valueSource: "style",
    valueKey: "maxHeight",
    defaultValue: "",
  },
  {
    id: "Frame.scroll.overflowY",
    componentType: "Frame",
    label: "Vertical overflow",
    editor: "select",
    category: "Scroll",
    valueSource: "style",
    valueKey: "overflowY",
    defaultValue: "visible",
    options: overflowOptions,
  },
  {
    id: "Frame.scroll.overflowX",
    componentType: "Frame",
    label: "Horizontal overflow",
    editor: "select",
    category: "Scroll",
    valueSource: "style",
    valueKey: "overflowX",
    defaultValue: "hidden",
    options: overflowOptions,
  },
  {
    id: "Section.scroll.minHeight",
    componentType: "Section",
    label: "Minimum height",
    editor: "spacing",
    category: "Scroll",
    valueSource: "style",
    valueKey: "minHeight",
    defaultValue: "",
  },
  {
    id: "Section.scroll.height",
    componentType: "Section",
    label: "Height",
    editor: "spacing",
    category: "Scroll",
    valueSource: "style",
    valueKey: "height",
    defaultValue: "",
  },
  {
    id: "Section.scroll.maxHeight",
    componentType: "Section",
    label: "Maximum height",
    editor: "spacing",
    category: "Scroll",
    valueSource: "style",
    valueKey: "maxHeight",
    defaultValue: "",
  },
  {
    id: "Section.scroll.overflowY",
    componentType: "Section",
    label: "Vertical overflow",
    editor: "select",
    category: "Scroll",
    valueSource: "style",
    valueKey: "overflowY",
    defaultValue: "visible",
    options: overflowOptions,
  },
  {
    id: "Section.scroll.overflowX",
    componentType: "Section",
    label: "Horizontal overflow",
    editor: "select",
    category: "Scroll",
    valueSource: "style",
    valueKey: "overflowX",
    defaultValue: "hidden",
    options: overflowOptions,
  },
];

const commonPropertyTemplates: readonly Omit<
  ComponentPropertyDefinition,
  "id" | "componentType"
>[] = [
  {
    label: "Children text",
    editor: "text",
    category: "Content",
    valueSource: "props",
    valueKey: "children",
    defaultValue: "",
  },
  {
    label: "Title",
    editor: "text",
    category: "Content",
    valueSource: "props",
    valueKey: "title",
    defaultValue: "",
  },
  {
    label: "Placeholder",
    editor: "text",
    category: "Content",
    valueSource: "props",
    valueKey: "placeholder",
    defaultValue: "",
  },
  {
    label: "Type",
    editor: "select",
    category: "Behavior",
    valueSource: "props",
    valueKey: "type",
    defaultValue: "default",
    options: [
      { label: "Default", value: "default" },
      { label: "Primary", value: "primary" },
      { label: "Dashed", value: "dashed" },
      { label: "Text", value: "text" },
      { label: "Link", value: "link" },
      { label: "Success", value: "success" },
      { label: "Warning", value: "warning" },
      { label: "Error", value: "error" },
      { label: "Info", value: "info" },
    ],
  },
  {
    label: "Size",
    editor: "select",
    category: "Layout",
    valueSource: "props",
    valueKey: "size",
    defaultValue: "middle",
    options: [
      { label: "Small", value: "small" },
      { label: "Middle", value: "middle" },
      { label: "Large", value: "large" },
    ],
  },
  {
    label: "Disabled",
    editor: "boolean",
    category: "State",
    valueSource: "props",
    valueKey: "disabled",
    defaultValue: false,
  },
  {
    label: "Loading",
    editor: "boolean",
    category: "State",
    valueSource: "props",
    valueKey: "loading",
    defaultValue: false,
  },
  {
    label: "Width",
    editor: "spacing",
    category: "Style",
    valueSource: "style",
    valueKey: "width",
    defaultValue: "",
  },
  {
    label: "Height",
    editor: "spacing",
    category: "Style",
    valueSource: "style",
    valueKey: "height",
    defaultValue: "",
  },
  {
    label: "Margin",
    editor: "spacing",
    category: "Spacing",
    valueSource: "style",
    valueKey: "margin",
    defaultValue: "",
  },
  {
    label: "Padding",
    editor: "spacing",
    category: "Spacing",
    valueSource: "style",
    valueKey: "padding",
    defaultValue: "",
  },
  {
    label: "Background",
    editor: "color",
    category: "Appearance",
    valueSource: "style",
    valueKey: "background",
    defaultValue: "#ffffff",
  },
  {
    label: "Text color",
    editor: "color",
    category: "Appearance",
    valueSource: "style",
    valueKey: "color",
    defaultValue: "#172033",
  },
  {
    label: "Radius",
    editor: "spacing",
    category: "Appearance",
    valueSource: "style",
    valueKey: "borderRadius",
    defaultValue: "",
  },
];

const generatedProperties: readonly ComponentPropertyDefinition[] =
  coreComponentDefinitions.flatMap((definition) =>
    commonPropertyTemplates
      .filter(
        (property) =>
          !specializedProperties.some(
            (specializedProperty) =>
              specializedProperty.componentType === definition.id &&
              specializedProperty.valueSource === property.valueSource &&
              specializedProperty.valueKey === property.valueKey,
          ),
      )
      .map((property) => ({
        ...property,
        id: `${definition.id}.${property.valueSource}.${property.valueKey}`,
        componentType: definition.id,
      })),
  );

const properties: readonly ComponentPropertyDefinition[] = [
  ...generatedProperties,
  ...specializedProperties,
];

export class PropertyRegistry extends TypedRegistry<ComponentPropertyDefinition> {
  listForComponent(
    componentType: string,
  ): readonly ComponentPropertyDefinition[] {
    return this.list().filter(
      (property) => property.componentType === componentType,
    );
  }

  validateValue(
    propertyId: string,
    value: JsonValue,
    node: AppNode,
  ): string | null {
    const property = this.get(propertyId);

    if (!property) {
      return `Unknown property "${propertyId}".`;
    }

    if (property.componentType !== node.type) {
      return `"${property.label}" does not belong to "${node.type}".`;
    }

    return property.validate?.(value, node) ?? null;
  }
}

export const propertyRegistry = new PropertyRegistry(properties);
