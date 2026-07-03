"use client";

import { Input, InputNumber, Select, Switch } from "antd";
import type { ComponentType } from "react";
import { EzyrInput } from "@/components/ui";
import type { JsonValue } from "@/schemas/app-spec";
import { TypedRegistry } from "@/registry/create-registry";
import type { PropertyEditorType, RegistryEntry } from "@/registry/types";

export type PropertyOption = {
  readonly label: string;
  readonly value: string;
};

export type PropertyEditorProps = {
  readonly value: JsonValue | undefined;
  readonly options?: readonly PropertyOption[];
  readonly onChange: (value: JsonValue) => void;
};

export type PropertyEditorDefinition = RegistryEntry & {
  readonly id: PropertyEditorType;
  readonly component: ComponentType<PropertyEditorProps>;
};

function TextEditor({ value, onChange }: PropertyEditorProps) {
  return (
    <EzyrInput
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function TextAreaEditor({ value, onChange }: PropertyEditorProps) {
  return (
    <Input.TextArea
      className="rounded-md border-[#d8dee9] text-sm shadow-none"
      autoSize={{ minRows: 2, maxRows: 5 }}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function NumberEditor({ value, onChange }: PropertyEditorProps) {
  return (
    <InputNumber
      className="w-full!"
      size="small"
      value={typeof value === "number" ? value : 0}
      onChange={(nextValue) => onChange(nextValue ?? 0)}
    />
  );
}

function BooleanEditor({ value, onChange }: PropertyEditorProps) {
  return (
    <Switch
      checked={typeof value === "boolean" ? value : false}
      onChange={(checked) => onChange(checked)}
    />
  );
}

function SelectEditor({ value, options, onChange }: PropertyEditorProps) {
  return (
    <Select
      size="small"
      value={typeof value === "string" ? value : undefined}
      options={options?.map((option) => ({
        label: option.label,
        value: option.value,
      }))}
      onChange={(nextValue) => onChange(nextValue)}
    />
  );
}

function ColorEditor({ value, onChange }: PropertyEditorProps) {
  return (
    <EzyrInput
      type="color"
      className="p-1"
      value={typeof value === "string" ? value : "#ffffff"}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function SpacingEditor({ value, onChange }: PropertyEditorProps) {
  return (
    <EzyrInput
      value={typeof value === "string" ? value : ""}
      placeholder="0px"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export const propertyEditorRegistry =
  new TypedRegistry<PropertyEditorDefinition>([
    { id: "text", component: TextEditor },
    { id: "textarea", component: TextAreaEditor },
    { id: "number", component: NumberEditor },
    { id: "boolean", component: BooleanEditor },
    { id: "select", component: SelectEditor },
    { id: "color", component: ColorEditor },
    { id: "spacing", component: SpacingEditor },
    { id: "event", component: TextEditor },
    { id: "binding", component: TextEditor },
  ]);
