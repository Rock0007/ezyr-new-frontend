import { z } from "zod";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { readonly [key: string]: JsonValue };

export type AppNodeId = string;
export type AppComponentType = string;
export type AppEventName = string;
export type AppBindingName = string;

export const CURRENT_APP_SPEC_VERSION = 1;

export type AppNode = {
  readonly id: AppNodeId;
  readonly type: AppComponentType;
  readonly props: JsonObject;
  readonly style: JsonObject;
  readonly bindings: Record<AppBindingName, JsonValue>;
  readonly events: Record<AppEventName, JsonValue>;
  readonly children: readonly AppNode[];
};

export type AppPage = {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly root: AppNode;
};

export type AppTheme = {
  readonly colors: Record<string, string>;
  readonly typography: Record<string, JsonValue>;
  readonly radius: Record<string, string>;
  readonly spacing: Record<string, string>;
  readonly shadow: Record<string, string>;
  readonly motion: Record<string, string>;
  readonly breakpoints: Record<string, string>;
};

export type AppProject = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
};

export type AppAsset = {
  readonly id: string;
  readonly source: string;
  readonly mimeType: string;
  readonly alt?: string;
  readonly width?: number;
  readonly height?: number;
};

export type AppWorkflowReference = {
  readonly id: string;
  readonly name: string;
  readonly trigger?: JsonObject;
  readonly enabled: boolean;
};

export type AppGlobals = {
  readonly metadata: JsonObject;
  readonly variables: Record<string, JsonValue>;
};

export type AppSpec = {
  readonly schemaVersion: number;
  readonly id: string;
  readonly name: string;
  readonly project: AppProject;
  readonly pages: readonly AppPage[];
  readonly assets: readonly AppAsset[];
  readonly themes: Record<string, AppTheme>;
  readonly activeThemeId: string;
  readonly theme: AppTheme;
  readonly workflows: readonly AppWorkflowReference[];
  readonly globals: AppGlobals;
};

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const appNodeSchema: z.ZodType<AppNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    props: z.record(z.string(), jsonValueSchema).default({}),
    style: z.record(z.string(), jsonValueSchema).default({}),
    bindings: z.record(z.string(), jsonValueSchema).default({}),
    events: z.record(z.string(), jsonValueSchema).default({}),
    children: z.array(appNodeSchema).default([]),
  }),
);

export const appThemeSchema: z.ZodType<AppTheme> = z.object({
  colors: z.record(z.string(), z.string()).default({}),
  typography: z.record(z.string(), jsonValueSchema).default({}),
  radius: z.record(z.string(), z.string()).default({}),
  spacing: z.record(z.string(), z.string()).default({}),
  shadow: z.record(z.string(), z.string()).default({}),
  motion: z.record(z.string(), z.string()).default({}),
  breakpoints: z.record(z.string(), z.string()).default({}),
});

export const appProjectSchema: z.ZodType<AppProject> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const appAssetSchema: z.ZodType<AppAsset> = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  mimeType: z.string().min(1),
  alt: z.string().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

export const appWorkflowReferenceSchema: z.ZodType<AppWorkflowReference> =
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    trigger: z.record(z.string(), jsonValueSchema).optional(),
    enabled: z.boolean().default(true),
  });

export const appGlobalsSchema: z.ZodType<AppGlobals> = z.object({
  metadata: z.record(z.string(), jsonValueSchema).default({}),
  variables: z.record(z.string(), jsonValueSchema).default({}),
});

export const appPageSchema: z.ZodType<AppPage> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  root: appNodeSchema,
});

export const appSpecSchema: z.ZodType<AppSpec> = z.object({
  schemaVersion: z.number().int().positive().default(CURRENT_APP_SPEC_VERSION),
  id: z.string().min(1),
  name: z.string().min(1),
  project: appProjectSchema.optional(),
  pages: z.array(appPageSchema),
  assets: z.array(appAssetSchema).default([]),
  themes: z.record(z.string(), appThemeSchema).default({}),
  activeThemeId: z.string().default("default"),
  theme: appThemeSchema,
  workflows: z.array(appWorkflowReferenceSchema).default([]),
  globals: appGlobalsSchema.default({ metadata: {}, variables: {} }),
}).transform((spec) => {
  const project = spec.project ?? { id: spec.id, name: spec.name };
  const themes =
    Object.keys(spec.themes).length > 0
      ? spec.themes
      : { [spec.activeThemeId]: spec.theme };
  const theme = themes[spec.activeThemeId] ?? spec.theme;

  return {
    ...spec,
    project,
    themes,
    theme,
  };
});

export function parseAppSpec(input: unknown): AppSpec {
  return appSpecSchema.parse(input);
}

export function safeParseAppSpec(input: unknown) {
  return appSpecSchema.safeParse(input);
}

export function serializeAppSpec(spec: AppSpec): string {
  return JSON.stringify(parseAppSpec(spec), null, 2);
}
