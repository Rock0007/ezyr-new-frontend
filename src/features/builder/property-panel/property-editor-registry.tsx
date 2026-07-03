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
  readonly id?: string;
  readonly label?: string;
  readonly options?: readonly PropertyOption[];
  readonly onChange: (value: JsonValue) => void;
};

export type PropertyEditorDefinition = RegistryEntry & {
  readonly id: PropertyEditorType;
  readonly component: ComponentType<PropertyEditorProps>;
};

function TextEditor({ id, label, value, onChange }: PropertyEditorProps) {
  return (
    <EzyrInput
      aria-label={label}
      id={id}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function TextAreaEditor({ id, label, value, onChange }: PropertyEditorProps) {
  return (
    <Input.TextArea
      aria-label={label}
      className="rounded-md border-[#d8dee9] text-sm shadow-none"
      autoSize={{ minRows: 2, maxRows: 5 }}
      id={id}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function NumberEditor({ id, label, value, onChange }: PropertyEditorProps) {
  return (
    <InputNumber
      aria-label={label}
      className="w-full!"
      id={id}
      size="small"
      value={typeof value === "number" ? value : 0}
      onChange={(nextValue) => onChange(nextValue ?? 0)}
    />
  );
}

function BooleanEditor({ id, label, value, onChange }: PropertyEditorProps) {
  return (
    <Switch
      aria-label={label}
      checked={typeof value === "boolean" ? value : false}
      id={id}
      onChange={(checked) => onChange(checked)}
    />
  );
}

function SelectEditor({ id, label, value, options, onChange }: PropertyEditorProps) {
  return (
    <Select
      aria-label={label}
      className="w-full!"
      id={id}
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

function ColorEditor({ id, label, value, onChange }: PropertyEditorProps) {
  return (
    <EzyrInput
      aria-label={label}
      type="color"
      className="p-1"
      id={id}
      value={typeof value === "string" ? value : "#ffffff"}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function SpacingEditor({ id, label, value, onChange }: PropertyEditorProps) {
  return (
    <EzyrInput
      aria-label={label}
      id={id}
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
