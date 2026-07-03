import type { AppNode } from "@/schemas/app-spec";
import { componentRegistry } from "@/registry/component";
import { rendererRegistry } from "@/registry/renderer";
import { TypedRegistry } from "@/registry/create-registry";
import type { ValidationIssue, ValidatorDefinition } from "@/registry/types";

function walkNode(
  node: AppNode,
  visit: (node: AppNode, ancestors: readonly AppNode[]) => void,
  ancestors: readonly AppNode[] = [],
): void {
  visit(node, ancestors);
  node.children.forEach((child) =>
    walkNode(child, visit, [...ancestors, node]),
  );
}

const duplicateIdValidator: ValidatorDefinition = {
  id: "duplicate-ids",
  validate(root) {
    const seen = new Set<string>();
    const issues: ValidationIssue[] = [];

    walkNode(root, (node) => {
      if (seen.has(node.id)) {
        issues.push({
          code: "duplicate-id",
          message: `Duplicate node id "${node.id}".`,
          severity: "error",
          nodeId: node.id,
        });
      }

      seen.add(node.id);
    });

    return issues;
  },
};

const componentContractValidator: ValidatorDefinition = {
  id: "component-contracts",
  validate(root) {
    const issues: ValidationIssue[] = [];

    walkNode(root, (node, ancestors) => {
      const definition = componentRegistry.get(node.type);

      if (!definition) {
        issues.push({
          code: "unknown-component",
          message: `Unknown component type "${node.type}".`,
          severity: "error",
          nodeId: node.id,
        });
        return;
      }

      if (!rendererRegistry.has(node.type)) {
        issues.push({
          code: "missing-renderer",
          message: `Missing renderer for "${node.type}".`,
          severity: "error",
          nodeId: node.id,
        });
      }

      const parent = ancestors.at(-1);
      if (
        parent &&
        definition.childrenRules.allowedParents &&
        !definition.childrenRules.allowedParents.includes(parent.type)
      ) {
        issues.push({
          code: "invalid-parent",
          message: `"${node.type}" cannot be placed inside "${parent.type}".`,
          severity: "error",
          nodeId: node.id,
        });
      }

      if (
        definition.childrenRules.maxChildren !== undefined &&
        node.children.length > definition.childrenRules.maxChildren
      ) {
        issues.push({
          code: "too-many-children",
          message: `"${node.type}" allows at most ${definition.childrenRules.maxChildren} children.`,
          severity: "error",
          nodeId: node.id,
        });
      }
    });

    return issues;
  },
};

export class ValidatorRegistry extends TypedRegistry<ValidatorDefinition> {
  validate(root: AppNode): readonly ValidationIssue[] {
    return this.list().flatMap((validator) => validator.validate(root));
  }
}

export const validatorRegistry = new ValidatorRegistry([
  duplicateIdValidator,
  componentContractValidator,
]);
