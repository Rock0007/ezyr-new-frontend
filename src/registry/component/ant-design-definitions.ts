import type {
  ComponentCategory,
  ComponentDefinition,
  ComponentRuntimeMode,
  ComponentTaxonomy,
} from "@/registry/types";

type AntComponentSeed = {
  readonly id: string;
  readonly category: ComponentCategory;
  readonly taxonomy?: ComponentTaxonomy;
  readonly runtimeMode?: ComponentRuntimeMode;
  readonly description: string;
  readonly defaultProps?: ComponentDefinition["defaultProps"];
  readonly childrenRules?: ComponentDefinition["childrenRules"];
  readonly editing?: ComponentDefinition["editing"];
  readonly canvas?: Partial<ComponentDefinition["canvas"]>;
};

const containerRules: ComponentDefinition["childrenRules"] = { minChildren: 0 };
const leafRules: ComponentDefinition["childrenRules"] = { maxChildren: 0 };
const workflowTriggeredComponents = new Set([
  "BackTop",
  "Drawer",
  "Dropdown",
  "FloatButton",
  "Modal",
  "Popconfirm",
  "Popover",
  "Tooltip",
  "Tour",
]);
const miniBuilderComponents: Record<string, string> = {
  Carousel: "carousel-editor",
  Form: "form-builder",
  Table: "table-column-editor",
  Tabs: "tabs-editor",
};

function taxonomyFromCategory(
  category: ComponentCategory,
  id: string,
): ComponentTaxonomy {
  if (workflowTriggeredComponents.has(id)) {
    return "overlay";
  }

  if (id === "Button" || id === "Segmented" || id === "Switch") {
    return "interactive";
  }

  const taxonomyByCategory: Record<ComponentCategory, ComponentTaxonomy> = {
    content: "content",
    data: "data-display",
    feedback: "feedback",
    input: "data-entry",
    layout: "layout",
    navigation: "navigation",
  };

  return taxonomyByCategory[category];
}

function runtimeModeForSeed(seed: AntComponentSeed): ComponentRuntimeMode {
  return (
    seed.runtimeMode ??
    (workflowTriggeredComponents.has(seed.id) ? "workflow-triggered" : "rendered")
  );
}

const antComponentSeeds: readonly AntComponentSeed[] = [
  {
    id: "Affix",
    category: "layout",
    description: "Fix content within the viewport.",
    childrenRules: containerRules,
  },
  {
    id: "Alert",
    category: "feedback",
    description: "Status message with optional description.",
    defaultProps: { message: "Alert message", type: "info", showIcon: true },
    childrenRules: leafRules,
  },
  {
    id: "Anchor",
    category: "navigation",
    description: "Navigation anchor list.",
    childrenRules: containerRules,
  },
  {
    id: "AutoComplete",
    category: "input",
    description: "Input with autocomplete options.",
    defaultProps: { placeholder: "Autocomplete" },
    childrenRules: leafRules,
  },
  {
    id: "Avatar",
    category: "content",
    description: "User or entity avatar.",
    defaultProps: { children: "U" },
    childrenRules: leafRules,
  },
  {
    id: "BackTop",
    category: "navigation",
    description: "Back-to-top affordance.",
    childrenRules: leafRules,
  },
  {
    id: "Badge",
    category: "feedback",
    description: "Badge count or status indicator.",
    defaultProps: { count: 5 },
    childrenRules: containerRules,
  },
  {
    id: "Breadcrumb",
    category: "navigation",
    description: "Breadcrumb navigation.",
    defaultProps: { items: [{ title: "Home" }, { title: "Page" }] },
    childrenRules: leafRules,
  },
  {
    id: "Button",
    category: "input",
    description: "Action trigger with workflow events.",
    defaultProps: { text: "Button", variant: "primary", size: "middle" },
    childrenRules: leafRules,
  },
  {
    id: "Calendar",
    category: "data",
    description: "Calendar date panel.",
    childrenRules: leafRules,
  },
  {
    id: "Card",
    category: "layout",
    description: "Content card container.",
    defaultProps: { title: "Card title" },
    childrenRules: containerRules,
  },
  {
    id: "Carousel",
    category: "content",
    description: "Carousel for rotating content.",
    childrenRules: containerRules,
  },
  {
    id: "Cascader",
    category: "input",
    description: "Hierarchical selection input.",
    defaultProps: { placeholder: "Select option" },
    childrenRules: leafRules,
  },
  {
    id: "Checkbox",
    category: "input",
    description: "Boolean checkbox input.",
    defaultProps: { children: "Checkbox" },
    childrenRules: leafRules,
  },
  {
    id: "Col",
    category: "layout",
    description: "Grid column.",
    defaultProps: { span: 12 },
    childrenRules: containerRules,
  },
  {
    id: "Collapse",
    category: "layout",
    description: "Expandable content panels.",
    defaultProps: {
      items: [{ key: "1", label: "Panel", children: "Content" }],
    },
    childrenRules: leafRules,
  },
  {
    id: "ColorPicker",
    category: "input",
    description: "Color selection input.",
    childrenRules: leafRules,
  },
  {
    id: "DatePicker",
    category: "input",
    description: "Date selection input.",
    childrenRules: leafRules,
  },
  {
    id: "Descriptions",
    category: "data",
    description: "Structured detail display.",
    defaultProps: { items: [{ key: "1", label: "Label", children: "Value" }] },
    childrenRules: leafRules,
  },
  {
    id: "Divider",
    category: "layout",
    description: "Content separator.",
    defaultProps: { children: "Divider" },
    childrenRules: leafRules,
  },
  {
    id: "Drawer",
    category: "feedback",
    description: "Slide-out drawer surface.",
    defaultProps: { title: "Drawer", open: false },
    childrenRules: containerRules,
  },
  {
    id: "Dropdown",
    category: "navigation",
    description: "Dropdown menu trigger.",
    defaultProps: { menu: { items: [{ key: "1", label: "Action" }] } },
    childrenRules: containerRules,
  },
  {
    id: "Empty",
    category: "feedback",
    description: "Empty-state placeholder.",
    childrenRules: leafRules,
  },
  {
    id: "Flex",
    category: "layout",
    description: "Flex layout container.",
    childrenRules: containerRules,
  },
  {
    id: "FloatButton",
    category: "navigation",
    description: "Floating action button.",
    childrenRules: leafRules,
  },
  {
    id: "Form",
    category: "input",
    description: "Input group with submit workflow hook.",
    childrenRules: containerRules,
  },
  {
    id: "Image",
    category: "content",
    description: "Accessible image with source and alt text.",
    defaultProps: { src: "", alt: "" },
    childrenRules: leafRules,
  },
  {
    id: "Input",
    category: "input",
    description: "Single-line text input.",
    defaultProps: { placeholder: "Input" },
    childrenRules: leafRules,
  },
  {
    id: "InputNumber",
    category: "input",
    description: "Numeric input.",
    defaultProps: { value: 10 },
    childrenRules: leafRules,
  },
  {
    id: "Layout",
    category: "layout",
    description: "Application layout container.",
    childrenRules: containerRules,
  },
  {
    id: "List",
    category: "data",
    description: "List of repeated items.",
    defaultProps: { dataSource: ["Item 1", "Item 2"], renderItemText: true },
    childrenRules: leafRules,
  },
  {
    id: "Mentions",
    category: "input",
    description: "Mention-enabled text input.",
    defaultProps: { placeholder: "Mention someone" },
    childrenRules: leafRules,
  },
  {
    id: "Menu",
    category: "navigation",
    description: "Navigation menu.",
    defaultProps: { items: [{ key: "1", label: "Menu item" }] },
    childrenRules: leafRules,
  },
  {
    id: "Modal",
    category: "feedback",
    description: "Modal dialog.",
    defaultProps: { title: "Modal", open: false },
    childrenRules: containerRules,
  },
  {
    id: "Pagination",
    category: "navigation",
    description: "Pagination control.",
    defaultProps: { total: 50 },
    childrenRules: leafRules,
  },
  {
    id: "Popconfirm",
    category: "feedback",
    description: "Confirmation popover.",
    defaultProps: { title: "Confirm action?", children: "Open confirm" },
    childrenRules: leafRules,
  },
  {
    id: "Popover",
    category: "feedback",
    description: "Floating contextual content.",
    defaultProps: { content: "Popover content", children: "Open popover" },
    childrenRules: leafRules,
  },
  {
    id: "Progress",
    category: "feedback",
    description: "Progress indicator.",
    defaultProps: { percent: 45 },
    childrenRules: leafRules,
  },
  {
    id: "QRCode",
    category: "data",
    description: "QR code renderer.",
    defaultProps: { value: "https://ezyr.ai" },
    childrenRules: leafRules,
  },
  {
    id: "Radio",
    category: "input",
    description: "Single choice input.",
    defaultProps: { children: "Radio" },
    childrenRules: leafRules,
  },
  {
    id: "Rate",
    category: "input",
    description: "Rating input.",
    defaultProps: { value: 3 },
    childrenRules: leafRules,
  },
  {
    id: "Result",
    category: "feedback",
    description: "Result status screen.",
    defaultProps: {
      status: "success",
      title: "Success",
      subTitle: "Operation completed.",
    },
    childrenRules: leafRules,
  },
  {
    id: "Row",
    category: "layout",
    description: "Grid row.",
    defaultProps: { gutter: 16 },
    childrenRules: containerRules,
  },
  {
    id: "Segmented",
    category: "input",
    description: "Segmented control.",
    defaultProps: { options: ["One", "Two"], value: "One" },
    childrenRules: leafRules,
  },
  {
    id: "Select",
    category: "input",
    description: "Select input.",
    defaultProps: {
      placeholder: "Select",
      options: [{ label: "Option", value: "option" }],
    },
    childrenRules: leafRules,
  },
  {
    id: "Skeleton",
    category: "feedback",
    description: "Loading skeleton.",
    defaultProps: { active: true },
    childrenRules: leafRules,
  },
  {
    id: "Slider",
    category: "input",
    description: "Range slider.",
    defaultProps: { defaultValue: 30 },
    childrenRules: leafRules,
  },
  {
    id: "Space",
    category: "layout",
    description: "Inline spacing container.",
    childrenRules: containerRules,
  },
  {
    id: "Spin",
    category: "feedback",
    description: "Loading spinner.",
    childrenRules: containerRules,
  },
  {
    id: "Splitter",
    category: "layout",
    description: "Resizable split panels.",
    childrenRules: containerRules,
  },
  {
    id: "Statistic",
    category: "data",
    description: "Statistic value display.",
    defaultProps: { title: "Active users", value: 1128 },
    childrenRules: leafRules,
  },
  {
    id: "Steps",
    category: "navigation",
    description: "Step progress navigation.",
    defaultProps: {
      current: 1,
      items: [{ title: "First" }, { title: "Second" }],
    },
    childrenRules: leafRules,
  },
  {
    id: "Switch",
    category: "input",
    description: "Boolean switch.",
    defaultProps: { defaultChecked: true },
    childrenRules: leafRules,
  },
  {
    id: "Table",
    category: "data",
    description: "Data table.",
    defaultProps: {
      columns: [{ title: "Name", dataIndex: "name" }],
      dataSource: [{ key: "1", name: "Record" }],
      pagination: false,
    },
    childrenRules: leafRules,
  },
  {
    id: "Tabs",
    category: "navigation",
    description: "Tabbed content control.",
    defaultProps: {
      items: [{ key: "1", label: "Tab", children: "Tab content" }],
    },
    childrenRules: leafRules,
  },
  {
    id: "Tag",
    category: "feedback",
    description: "Compact tag label.",
    defaultProps: { children: "Tag", color: "cyan" },
    childrenRules: leafRules,
  },
  {
    id: "TimePicker",
    category: "input",
    description: "Time selection input.",
    childrenRules: leafRules,
  },
  {
    id: "Timeline",
    category: "data",
    description: "Chronological event list.",
    defaultProps: { items: [{ children: "Timeline item" }] },
    childrenRules: leafRules,
  },
  {
    id: "Tooltip",
    category: "feedback",
    description: "Hover tooltip.",
    defaultProps: { title: "Tooltip", children: "Hover me" },
    childrenRules: leafRules,
  },
  {
    id: "Tour",
    category: "feedback",
    description: "Guided tour overlay.",
    defaultProps: { open: false, steps: [] },
    childrenRules: leafRules,
  },
  {
    id: "Transfer",
    category: "data",
    description: "Transfer list selection.",
    defaultProps: { dataSource: [], targetKeys: [] },
    childrenRules: leafRules,
  },
  {
    id: "Tree",
    category: "data",
    description: "Tree data display.",
    defaultProps: { treeData: [{ title: "Node", key: "node" }] },
    childrenRules: leafRules,
  },
  {
    id: "TreeSelect",
    category: "input",
    description: "Tree selection input.",
    defaultProps: {
      placeholder: "Select tree node",
      treeData: [{ title: "Node", value: "node" }],
    },
    childrenRules: leafRules,
  },
  {
    id: "Typography",
    category: "content",
    description: "Typography text block.",
    defaultProps: { children: "Typography" },
    childrenRules: leafRules,
  },
  {
    id: "Upload",
    category: "input",
    description: "File upload trigger.",
    defaultProps: { children: "Upload" },
    childrenRules: leafRules,
  },
  {
    id: "Watermark",
    category: "content",
    description: "Watermark container.",
    defaultProps: { content: "Ezyr" },
    childrenRules: containerRules,
  },
];

export const antDesignComponentDefinitions: readonly ComponentDefinition[] =
  antComponentSeeds.map((seed) => {
    const childrenRules = seed.childrenRules ?? containerRules;
    const acceptsChildren = childrenRules.maxChildren !== 0;
    const runtimeMode = runtimeModeForSeed(seed);
    const isCanvasInsertable =
      runtimeMode !== "runtime-only" && runtimeMode !== "workflow-triggered";
    const miniBuilderId = miniBuilderComponents[seed.id];

    return {
      id: seed.id,
      displayName: seed.id,
      description: seed.description,
      icon: "component",
      category: seed.category,
      taxonomy: seed.taxonomy ?? taxonomyFromCategory(seed.category, seed.id),
      version: "5.29.3",
      defaultProps: seed.defaultProps ?? {},
      editableProps: [
        "children",
        "text",
        "title",
        "placeholder",
        "type",
        "size",
        "disabled",
        "loading",
        "status",
        "variant",
        "color",
        "width",
        "height",
        "margin",
        "padding",
        "background",
        "radius",
      ],
      events: ["click", "focus", "blur", "change"],
      slots: acceptsChildren ? ["children"] : [],
      childrenRules,
      canvas: {
        draggable: isCanvasInsertable,
        droppable: acceptsChildren,
        nestable: acceptsChildren,
        acceptsChildren,
        ...seed.canvas,
      },
      runtime: { mode: runtimeMode },
      editing:
        seed.editing ??
        (miniBuilderId
          ? { panel: "mini-builder", miniBuilderId }
          : { panel: "standard" }),
      composition: childrenRules,
    };
  });
