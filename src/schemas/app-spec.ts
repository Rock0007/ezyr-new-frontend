import { z } from "zod";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { readonly [key: string]: JsonValue };

export type AppNodeId = string;
export type AppComponentType = string;
export type AppEventName = string;
export type AppBindingName = string;

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

export type AppSpec = {
  readonly schemaVersion: number;
  readonly id: string;
  readonly name: string;
  readonly pages: readonly AppPage[];
  readonly theme: AppTheme;
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

export const appPageSchema: z.ZodType<AppPage> = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  path: z.string().min(1),
  root: appNodeSchema,
});

export const appSpecSchema: z.ZodType<AppSpec> = z.object({
  schemaVersion: z.number().int().positive(),
  id: z.string().min(1),
  name: z.string().min(1),
  pages: z.array(appPageSchema),
  theme: appThemeSchema,
});

export function parseAppSpec(input: unknown): AppSpec {
  return appSpecSchema.parse(input);
}
