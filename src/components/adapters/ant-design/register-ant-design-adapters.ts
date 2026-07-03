import { adapterRegistry } from "@/registry/adapter";
import { componentRegistry } from "@/registry/component";
import { AntButtonAdapter } from "./ant-button-adapter";
import { AntFrameAdapter } from "./ant-frame-adapter";
import { AntGenericAdapter } from "./ant-generic-adapter";
import { AntImageAdapter } from "./ant-image-adapter";
import { AntSectionAdapter } from "./ant-section-adapter";
import { AntTextAdapter } from "./ant-text-adapter";

let isRegistered = false;

export function registerAntDesignAdapters(): void {
  if (isRegistered) {
    return;
  }

  adapterRegistry.register({
    id: "ant.Frame",
    componentType: "Frame",
    provider: "ant-design",
    component: AntFrameAdapter,
  });
  adapterRegistry.register({
    id: "ant.Section",
    componentType: "Section",
    provider: "ant-design",
    component: AntSectionAdapter,
  });
  adapterRegistry.register({
    id: "ant.Text",
    componentType: "Text",
    provider: "ant-design",
    component: AntTextAdapter,
  });
  adapterRegistry.register({
    id: "ant.Button",
    componentType: "Button",
    provider: "ant-design",
    component: AntButtonAdapter,
  });
  adapterRegistry.register({
    id: "ant.Image",
    componentType: "Image",
    provider: "ant-design",
    component: AntImageAdapter,
  });
  componentRegistry.list().forEach((definition) => {
    if (adapterRegistry.getForComponent(definition.id)) {
      return;
    }

    adapterRegistry.register({
      id: `ant.${definition.id}`,
      componentType: definition.id,
      provider: "ant-design",
      component: AntGenericAdapter,
    });
  });

  isRegistered = true;
}
