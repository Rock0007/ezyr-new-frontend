import { TypedRegistry } from "@/registry/create-registry";
import type { PropertyDefinition } from "@/registry/types";

export type ComponentPropertyDefinition = PropertyDefinition & {
  readonly componentType: string;
};

const properties: readonly ComponentPropertyDefinition[] = [
  {
    id: "Button.text",
    componentType: "Button",
    label: "Text",
    editor: "text",
    category: "Content",
    defaultValue: "Button",
  },
  {
    id: "Button.variant",
    componentType: "Button",
    label: "Variant",
    editor: "select",
    category: "Appearance",
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
    defaultValue: false,
  },
  {
    id: "Text.text",
    componentType: "Text",
    label: "Text",
    editor: "textarea",
    category: "Content",
    defaultValue: "Text",
  },
  {
    id: "Image.src",
    componentType: "Image",
    label: "Source",
    editor: "text",
    category: "Content",
    defaultValue: "",
  },
  {
    id: "Image.alt",
    componentType: "Image",
    label: "Alt text",
    editor: "text",
    category: "Accessibility",
    defaultValue: "",
  },
];

export class PropertyRegistry extends TypedRegistry<ComponentPropertyDefinition> {
  listForComponent(
    componentType: string,
  ): readonly ComponentPropertyDefinition[] {
    return this.list().filter(
      (property) => property.componentType === componentType,
    );
  }
}

export const propertyRegistry = new PropertyRegistry(properties);
