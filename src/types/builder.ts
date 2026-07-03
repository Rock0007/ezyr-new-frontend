export type BuilderViewport = "desktop" | "tablet" | "mobile";

export type BuilderMode = "select" | "insert" | "preview";

export type BuilderComponentKind = string;

export type BuilderComponent = {
  id: string;
  kind: BuilderComponentKind;
  name: string;
  description: string;
  category: string;
  icon: string;
};
