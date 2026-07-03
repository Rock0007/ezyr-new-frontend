import { TypedRegistry } from "@/registry/create-registry";
import { coreComponentDefinitions } from "@/registry/component/definitions";
import type { AppNode, JsonValue } from "@/schemas/app-spec";
import type { ComponentDefinition, PropertyDefinition } from "@/registry/types";

export type ComponentPropertyDefinition = PropertyDefinition & {
  readonly componentType: string;
};

type PropertyTemplate = Omit<ComponentPropertyDefinition, "id" | "componentType">;

const overflowOptions = [
  { label: "Visible", value: "visible" },
  { label: "Auto", value: "auto" },
  { label: "Scroll", value: "scroll" },
  { label: "Hidden", value: "hidden" },
  { label: "Clip", value: "clip" },
] as const;

const displayOptions = [
  { label: "Block", value: "block" },
  { label: "Flex", value: "flex" },
  { label: "Inline flex", value: "inline-flex" },
  { label: "Grid", value: "grid" },
  { label: "Inline block", value: "inline-block" },
  { label: "None", value: "none" },
] as const;

const flexDirectionOptions = [
  { label: "Row", value: "row" },
  { label: "Column", value: "column" },
  { label: "Row reverse", value: "row-reverse" },
  { label: "Column reverse", value: "column-reverse" },
] as const;

const flexWrapOptions = [
  { label: "No wrap", value: "nowrap" },
  { label: "Wrap", value: "wrap" },
  { label: "Wrap reverse", value: "wrap-reverse" },
] as const;

const justifyContentOptions = [
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Space between", value: "space-between" },
  { label: "Space around", value: "space-around" },
  { label: "Space evenly", value: "space-evenly" },
] as const;

const alignItemsOptions = [
  { label: "Stretch", value: "stretch" },
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Baseline", value: "baseline" },
] as const;

const alignSelfOptions = [
  { label: "Auto", value: "auto" },
  { label: "Stretch", value: "stretch" },
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Baseline", value: "baseline" },
] as const;

const textAlignOptions = [
  { label: "Left", value: "left" },
  { label: "Center", value: "center" },
  { label: "Right", value: "right" },
  { label: "Justify", value: "justify" },
] as const;

const fontWeightOptions = [
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semibold", value: "600" },
  { label: "Bold", value: "700" },
] as const;

const borderStyleOptions = [
  { label: "None", value: "none" },
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
] as const;

const objectFitOptions = [
  { label: "Contain", value: "contain" },
  { label: "Cover", value: "cover" },
  { label: "Fill", value: "fill" },
  { label: "Scale down", value: "scale-down" },
  { label: "None", value: "none" },
] as const;

const buttonVariantOptions = [
  { label: "Primary", value: "primary" },
  { label: "Default", value: "default" },
  { label: "Dashed", value: "dashed" },
  { label: "Text", value: "text" },
  { label: "Link", value: "link" },
] as const;

const sizeOptions = [
  { label: "Small", value: "small" },
  { label: "Middle", value: "middle" },
  { label: "Large", value: "large" },
] as const;

const statusOptions = [
  { label: "Default", value: "" },
  { label: "Success", value: "success" },
  { label: "Warning", value: "warning" },
  { label: "Error", value: "error" },
  { label: "Info", value: "info" },
] as const;

const textLevelOptions = [
  { label: "Heading", value: "heading" },
  { label: "Body", value: "body" },
] as const;

function prop(
  componentType: string,
  key: string,
  property: PropertyTemplate,
): ComponentPropertyDefinition {
  return {
    ...property,
    componentType,
    id: `${componentType}.${key}`,
  };
}

function styleProp(
  label: string,
  category: string,
  valueKey: string,
  editor: PropertyTemplate["editor"] = "spacing",
  defaultValue: JsonValue = "",
  options?: PropertyTemplate["options"],
): PropertyTemplate {
  return {
    label,
    editor,
    category,
    valueSource: "style",
    valueKey,
    defaultValue,
    options,
  };
}

function propsProp(
  label: string,
  category: string,
  valueKey: string,
  editor: PropertyTemplate["editor"] = "text",
  defaultValue: JsonValue = "",
  options?: PropertyTemplate["options"],
): PropertyTemplate {
  return {
    label,
    editor,
    category,
    valueSource: "props",
    valueKey,
    defaultValue,
    options,
  };
}

const sizingTemplates: readonly [string, PropertyTemplate][] = [
  ["style.width", styleProp("Width", "Layout", "width")],
  ["style.minWidth", styleProp("Minimum width", "Layout", "minWidth")],
  ["style.maxWidth", styleProp("Maximum width", "Layout", "maxWidth")],
  ["style.height", styleProp("Height", "Layout", "height")],
  ["style.minHeight", styleProp("Minimum height", "Layout", "minHeight")],
  ["style.maxHeight", styleProp("Maximum height", "Layout", "maxHeight")],
  [
    "style.alignSelf",
    styleProp("Self alignment", "Layout", "alignSelf", "select", "auto", alignSelfOptions),
  ],
];

const flexTemplates: readonly [string, PropertyTemplate][] = [
  [
    "style.display",
    styleProp("Display", "Flex alignment", "display", "select", "", displayOptions),
  ],
  [
    "style.flexDirection",
    styleProp(
      "Direction",
      "Flex alignment",
      "flexDirection",
      "select",
      "row",
      flexDirectionOptions,
    ),
  ],
  [
    "style.justifyContent",
    styleProp(
      "Horizontal alignment",
      "Flex alignment",
      "justifyContent",
      "select",
      "flex-start",
      justifyContentOptions,
    ),
  ],
  [
    "style.alignItems",
    styleProp(
      "Vertical alignment",
      "Flex alignment",
      "alignItems",
      "select",
      "stretch",
      alignItemsOptions,
    ),
  ],
  [
    "style.flexWrap",
    styleProp("Wrap", "Flex alignment", "flexWrap", "select", "nowrap", flexWrapOptions),
  ],
  ["style.gap", styleProp("Gap", "Flex alignment", "gap")],
];

const spacingTemplates: readonly [string, PropertyTemplate][] = [
  ["style.marginTop", styleProp("Margin top", "Spacing", "marginTop")],
  ["style.marginRight", styleProp("Margin right", "Spacing", "marginRight")],
  ["style.marginBottom", styleProp("Margin bottom", "Spacing", "marginBottom")],
  ["style.marginLeft", styleProp("Margin left", "Spacing", "marginLeft")],
  ["style.paddingTop", styleProp("Padding top", "Spacing", "paddingTop")],
  ["style.paddingRight", styleProp("Padding right", "Spacing", "paddingRight")],
  ["style.paddingBottom", styleProp("Padding bottom", "Spacing", "paddingBottom")],
  ["style.paddingLeft", styleProp("Padding left", "Spacing", "paddingLeft")],
];

const appearanceTemplates: readonly [string, PropertyTemplate][] = [
  ["style.background", styleProp("Background", "Appearance", "background", "color", "#ffffff")],
  ["style.color", styleProp("Text color", "Appearance", "color", "color", "#172033")],
  ["style.borderColor", styleProp("Border color", "Appearance", "borderColor", "color", "#d8dee9")],
  ["style.borderWidth", styleProp("Border width", "Appearance", "borderWidth")],
  [
    "style.borderStyle",
    styleProp("Border style", "Appearance", "borderStyle", "select", "none", borderStyleOptions),
  ],
  ["style.borderRadius", styleProp("Radius", "Appearance", "borderRadius")],
  ["style.opacity", styleProp("Opacity", "Appearance", "opacity", "number", 1)],
];

const typographyTemplates: readonly [string, PropertyTemplate][] = [
  ["style.textAlign", styleProp("Text alignment", "Typography", "textAlign", "select", "left", textAlignOptions)],
  ["style.fontSize", styleProp("Font size", "Typography", "fontSize")],
  [
    "style.fontWeight",
    styleProp("Font weight", "Typography", "fontWeight", "select", "400", fontWeightOptions),
  ],
  ["style.lineHeight", styleProp("Line height", "Typography", "lineHeight")],
];

const scrollTemplates: readonly [string, PropertyTemplate][] = [
  [
    "style.overflowY",
    styleProp("Vertical overflow", "Scroll", "overflowY", "select", "visible", overflowOptions),
  ],
  [
    "style.overflowX",
    styleProp("Horizontal overflow", "Scroll", "overflowX", "select", "hidden", overflowOptions),
  ],
  ["style.scrollBehavior", styleProp("Scroll behavior", "Scroll", "scrollBehavior", "select", "auto", [
    { label: "Auto", value: "auto" },
    { label: "Smooth", value: "smooth" },
  ])],
];

function supportsTextContent(definition: ComponentDefinition): boolean {
  return (
    definition.id === "Text" ||
    definition.id === "Typography" ||
    "children" in definition.defaultProps ||
    "text" in definition.defaultProps
  );
}

function supportsTypography(definition: ComponentDefinition): boolean {
  return (
    supportsTextContent(definition) ||
    ["Button", "Tag", "Alert", "Result", "Statistic"].includes(definition.id)
  );
}

function supportsFlex(definition: ComponentDefinition): boolean {
  return (
    definition.canvas.acceptsChildren ||
    ["Frame", "Section", "Button", "Text", "Typography"].includes(definition.id)
  );
}

function supportsScroll(definition: ComponentDefinition): boolean {
  return definition.id === "Frame" || definition.id === "Section";
}

function addTemplates(
  properties: ComponentPropertyDefinition[],
  componentType: string,
  templates: readonly [string, PropertyTemplate][],
): void {
  templates.forEach(([key, template]) => {
    properties.push(prop(componentType, key, template));
  });
}

function buildPropertiesForDefinition(
  definition: ComponentDefinition,
): ComponentPropertyDefinition[] {
  const properties: ComponentPropertyDefinition[] = [];
  const componentType = definition.id;

  if (definition.id === "Text") {
    properties.push(
      prop(componentType, "props.text", propsProp("Text", "Content", "text", "textarea", "Text")),
      prop(
        componentType,
        "props.level",
        propsProp("Level", "Content", "level", "select", "body", textLevelOptions),
      ),
    );
  } else if (definition.id === "Button") {
    properties.push(
      prop(componentType, "props.text", propsProp("Text", "Content", "text", "text", "Button")),
      prop(
        componentType,
        "props.variant",
        propsProp("Variant", "Behavior", "variant", "select", "primary", buttonVariantOptions),
      ),
      prop(componentType, "props.size", propsProp("Size", "Behavior", "size", "select", "middle", sizeOptions)),
      prop(componentType, "props.disabled", propsProp("Disabled", "State", "disabled", "boolean", false)),
      prop(componentType, "props.loading", propsProp("Loading", "State", "loading", "boolean", false)),
    );
  } else if (definition.id === "Image") {
    properties.push(
      prop(componentType, "props.src", propsProp("Source", "Content", "src")),
      prop(componentType, "props.alt", propsProp("Alt text", "Content", "alt")),
      prop(
        componentType,
        "style.objectFit",
        styleProp("Fit", "Layout", "objectFit", "select", "contain", objectFitOptions),
      ),
    );
  } else if (definition.id === "Form") {
    properties.push(
      prop(componentType, "props.layout", propsProp("Layout", "Behavior", "layout", "select", "vertical", [
        { label: "Vertical", value: "vertical" },
        { label: "Horizontal", value: "horizontal" },
        { label: "Inline", value: "inline" },
      ])),
    );
  } else if (supportsTextContent(definition)) {
    const defaultText =
      typeof definition.defaultProps.children === "string"
        ? definition.defaultProps.children
        : typeof definition.defaultProps.text === "string"
          ? definition.defaultProps.text
          : definition.displayName;

    properties.push(
      prop(
        componentType,
        "props.children",
        propsProp("Text", "Content", "children", "text", defaultText),
      ),
    );
  }

  if ("title" in definition.defaultProps) {
    properties.push(
      prop(componentType, "props.title", propsProp("Title", "Content", "title")),
    );
  }

  if ("placeholder" in definition.defaultProps) {
    properties.push(
      prop(
        componentType,
        "props.placeholder",
        propsProp("Placeholder", "Content", "placeholder"),
      ),
    );
  }

  if ("status" in definition.defaultProps) {
    properties.push(
      prop(
        componentType,
        "props.status",
        propsProp("Status", "Behavior", "status", "select", "", statusOptions),
      ),
    );
  }

  addTemplates(properties, componentType, sizingTemplates);

  if (supportsFlex(definition)) {
    addTemplates(properties, componentType, flexTemplates);
  }

  if (supportsTypography(definition)) {
    addTemplates(properties, componentType, typographyTemplates);
  }

  addTemplates(properties, componentType, spacingTemplates);
  addTemplates(properties, componentType, appearanceTemplates);

  if (supportsScroll(definition)) {
    addTemplates(properties, componentType, scrollTemplates);
  }

  return properties;
}

function dedupeProperties(
  properties: readonly ComponentPropertyDefinition[],
): readonly ComponentPropertyDefinition[] {
  const seen = new Set<string>();
  const result: ComponentPropertyDefinition[] = [];

  properties.forEach((property) => {
    const key = `${property.componentType}:${property.valueSource}:${property.valueKey}`;

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    result.push(property);
  });

  return result;
}

const properties = dedupeProperties(
  coreComponentDefinitions.flatMap((definition) =>
    buildPropertiesForDefinition(definition),
  ),
);

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
