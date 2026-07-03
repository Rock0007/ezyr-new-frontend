"use client";

import { Input, InputNumber, Select, Switch } from "antd";
import type { ComponentType } from "react";
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
    <Input
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function TextAreaEditor({ value, onChange }: PropertyEditorProps) {
  return (
    <Input.TextArea
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
    <Input
      type="color"
      value={typeof value === "string" ? value : "#ffffff"}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function SpacingEditor({ value, onChange }: PropertyEditorProps) {
  return (
    <Input
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
