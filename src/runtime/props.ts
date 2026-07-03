import type { JsonObject, JsonValue } from "@/schemas/app-spec";

export function getStringProp(
  props: JsonObject,
  key: string,
  fallback = "",
): string {
  const value = props[key];
  return typeof value === "string" ? value : fallback;
}

export function getBooleanProp(
  props: JsonObject,
  key: string,
  fallback = false,
): boolean {
  const value = props[key];
  return typeof value === "boolean" ? value : fallback;
}

export function getNumberProp(
  props: JsonObject,
  key: string,
  fallback = 0,
): number {
  const value = props[key];
  return typeof value === "number" ? value : fallback;
}

export function getJsonProp<TValue extends JsonValue>(
  props: JsonObject,
  key: string,
  fallback: TValue,
): TValue {
  const value = props[key];
  return value === undefined ? fallback : (value as TValue);
}
