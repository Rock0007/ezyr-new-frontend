import { TypedRegistry } from "@/registry/create-registry";
import type { EventDefinition } from "@/registry/types";

const events: readonly EventDefinition[] = [
  {
    id: "Button.click",
    componentType: "Button",
    name: "click",
    description: "Runs when the button is clicked.",
  },
  {
    id: "Button.focus",
    componentType: "Button",
    name: "focus",
    description: "Runs when the button receives focus.",
  },
  {
    id: "Form.submit",
    componentType: "Form",
    name: "submit",
    description: "Runs when the form is submitted.",
  },
  {
    id: "Page.load",
    componentType: "Page",
    name: "load",
    description: "Runs when the page loads.",
  },
];

export class EventRegistry extends TypedRegistry<EventDefinition> {
  listForComponent(componentType: string): readonly EventDefinition[] {
    return this.list().filter((event) => event.componentType === componentType);
  }
}

export const eventRegistry = new EventRegistry(events);
