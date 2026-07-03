import type { AppNode } from "@/schemas/app-spec";
import type { BuilderDocumentState } from "./types";
import { normalizeAppNode } from "./normalization";

export const initialRootNode: AppNode = {
  id: "home-root",
  type: "Frame",
  props: {},
  style: { background: "#ffffff", padding: "0" },
  bindings: {},
  events: {},
  children: [
    {
      id: "home-section",
      type: "Section",
      props: {},
      style: { padding: "32px", background: "#ffffff", radius: "6px" },
      bindings: {},
      events: {},
      children: [
        {
          id: "home-title",
          type: "Text",
          props: { text: "Build something new", level: "heading" },
          style: {},
          bindings: {},
          events: {},
          children: [],
        },
        {
          id: "home-action",
          type: "Button",
          props: { text: "Start building", variant: "primary", size: "middle" },
          style: {},
          bindings: {},
          events: {},
          children: [],
        },
      ],
    },
  ],
};

export const initialBuilderDocumentState: BuilderDocumentState = {
  appId: "ezyr-demo-project",
  activePageId: "home",
  rootNodeIdsByPage: { home: initialRootNode.id },
  nodes: normalizeAppNode(initialRootNode),
  clipboard: null,
  dragSession: null,
  dropIndicator: null,
};
