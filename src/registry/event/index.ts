import { TypedRegistry } from "@/registry/create-registry";
import type { EventDefinition } from "@/registry/types";
import type { JsonObject } from "@/schemas/app-spec";

function validateObjectPayload(payload: JsonObject): string | null {
  return payload && typeof payload === "object" && !Array.isArray(payload)
    ? null
    : "Event payload must be a JSON object.";
}

const events: readonly EventDefinition[] = [
  {
    id: "Button.click",
    componentType: "Button",
    name: "click",
    description: "Runs when the button is clicked.",
    payloadSchema: {
      pointerType: "mouse|keyboard|touch",
      altKey: "boolean",
      ctrlKey: "boolean",
      metaKey: "boolean",
      shiftKey: "boolean",
    },
    validatePayload: validateObjectPayload,
  },
  {
    id: "Button.focus",
    componentType: "Button",
    name: "focus",
    description: "Runs when the button receives focus.",
    payloadSchema: { source: "keyboard|pointer|programmatic" },
    validatePayload: validateObjectPayload,
  },
  {
    id: "Input.change",
    componentType: "Input",
    name: "change",
    description: "Runs when an input value changes.",
    payloadSchema: { value: "string|number|boolean|null" },
    validatePayload: validateObjectPayload,
  },
  {
    id: "Input.blur",
    componentType: "Input",
    name: "blur",
    description: "Runs when an input loses focus.",
    payloadSchema: { value: "string|number|boolean|null" },
    validatePayload: validateObjectPayload,
  },
  {
    id: "Form.submit",
    componentType: "Form",
    name: "submit",
    description: "Runs when the form is submitted.",
    payloadSchema: { values: "object" },
    validatePayload: validateObjectPayload,
  },
  {
    id: "Page.load",
    componentType: "Page",
    name: "load",
    description: "Runs when the page loads.",
    payloadSchema: { path: "string" },
    validatePayload: validateObjectPayload,
  },
  {
    id: "Page.unload",
    componentType: "Page",
    name: "unload",
    description: "Runs when the page unloads.",
    payloadSchema: { path: "string" },
    validatePayload: validateObjectPayload,
  },
];

export class EventRegistry extends TypedRegistry<EventDefinition> {
  listForComponent(componentType: string): readonly EventDefinition[] {
    return this.list().filter((event) => event.componentType === componentType);
  }

  supports(componentType: string, eventName: string): boolean {
    return this.listForComponent(componentType).some(
      (event) => event.name === eventName,
    );
  }

  validatePayload(
    componentType: string,
    eventName: string,
    payload: JsonObject,
  ): string | null {
    const event = this.listForComponent(componentType).find(
      (candidate) => candidate.name === eventName,
    );

    if (!event) {
      return `"${componentType}" does not support "${eventName}".`;
    }

    return event.validatePayload?.(payload) ?? null;
  }
}

export const eventRegistry = new EventRegistry(events);
