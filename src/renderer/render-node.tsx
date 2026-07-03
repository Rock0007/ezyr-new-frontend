import type { AppNode } from "@/schemas/app-spec";
import { renderAppNode } from "@/runtime/render-app-spec";

type RenderNodeProps = {
  node: AppNode;
};

export function RenderNode({ node }: RenderNodeProps) {
  return renderAppNode(node);
}
