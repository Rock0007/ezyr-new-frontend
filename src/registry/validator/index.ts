import type { AppNode, AppSpec, JsonValue } from "@/schemas/app-spec";
import { componentRegistry } from "@/registry/component";
import { eventRegistry } from "@/registry/event";
import { propertyRegistry } from "@/registry/property";
import { rendererRegistry } from "@/registry/renderer";
import { themeRegistry } from "@/registry/theme";
import { TypedRegistry } from "@/registry/create-registry";
import type { ValidationIssue, ValidatorDefinition } from "@/registry/types";

function walkNode(
  node: AppNode,
  visit: (node: AppNode, ancestors: readonly AppNode[]) => void,
  ancestors: readonly AppNode[] = [],
  visited: ReadonlySet<AppNode> = new Set(),
): void {
  if (visited.has(node)) {
    visit(node, ancestors);
    return;
  }

  visit(node, ancestors);
  const nextVisited = new Set(visited);
  nextVisited.add(node);
  node.children.forEach((child) =>
    walkNode(child, visit, [...ancestors, node], nextVisited),
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

const circularTreeValidator: ValidatorDefinition = {
  id: "circular-tree",
  validate(root) {
    const issues: ValidationIssue[] = [];
    const activePath = new Set<AppNode>();

    function visit(node: AppNode): void {
      if (activePath.has(node)) {
        issues.push({
          code: "circular-tree",
          message: `Circular component tree detected at "${node.id}".`,
          severity: "error",
          nodeId: node.id,
        });
        return;
      }

      activePath.add(node);
      node.children.forEach(visit);
      activePath.delete(node);
    }

    visit(root);
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
          suggestedFix: "Register the component or migrate this node to a supported component type.",
        });
        return;
      }

      if (!rendererRegistry.has(node.type)) {
        issues.push({
          code: "missing-renderer",
          message: `Missing renderer for "${node.type}".`,
          severity: "error",
          nodeId: node.id,
          suggestedFix: "Register a renderer for this component type.",
        });
      }

      const parent = ancestors.at(-1);
      if (
        parent &&
        definition.composition.allowedParents &&
        !definition.composition.allowedParents.includes(parent.type)
      ) {
        issues.push({
          code: "invalid-parent",
          message: `"${node.type}" cannot be placed inside "${parent.type}".`,
          severity: "error",
          nodeId: node.id,
          suggestedFix: "Move this node into an allowed parent or update its composition rules.",
        });
      }

      if (
        definition.composition.maxChildren !== undefined &&
        node.children.length > definition.composition.maxChildren
      ) {
        issues.push({
          code: "too-many-children",
          message: `"${node.type}" allows at most ${definition.composition.maxChildren} children.`,
          severity: "error",
          nodeId: node.id,
          suggestedFix: "Remove extra child nodes or increase the component composition limit.",
        });
      }

      if (
        parent &&
        (definition.runtime.mode === "runtime-only" ||
          definition.runtime.mode === "workflow-triggered")
      ) {
        issues.push({
          code: "runtime-component-in-canvas",
          message: `"${node.type}" must be configured through runtime workflows.`,
          severity: "error",
          nodeId: node.id,
          suggestedFix: "Move this behavior into the Runtime/Workflow configuration surface.",
        });
      }
    });

    return issues;
  },
};

function isEmpty(value: JsonValue | undefined): boolean {
  return value === undefined || value === null || value === "";
}

function visitJsonValues(
  value: JsonValue,
  visit: (value: JsonValue) => void,
): void {
  visit(value);

  if (Array.isArray(value)) {
    value.forEach((item) => visitJsonValues(item, visit));
    return;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => visitJsonValues(item, visit));
  }
}

function isTokenReference(value: JsonValue): value is string {
  return typeof value === "string" && /^\{[\w.-]+\}$/.test(value);
}

function isJsonObject(value: JsonValue): value is Record<string, JsonValue> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

const appSpecIntegrityValidator: ValidatorDefinition = {
  id: "app-spec-integrity",
  validate: () => [],
  validateSpec(spec) {
    const issues: ValidationIssue[] = [];

    if (!Number.isInteger(spec.schemaVersion) || spec.schemaVersion < 1) {
      issues.push({
        code: "invalid-schema-version",
        message: "AppSpec schemaVersion must be a positive integer.",
        severity: "error",
        path: "schemaVersion",
        suggestedFix: "Set schemaVersion to the current AppSpec version.",
      });
    }

    if (spec.pages.length === 0) {
      issues.push({
        code: "missing-page",
        message: "AppSpec must contain at least one page.",
        severity: "error",
        path: "pages",
        suggestedFix: "Create a page with a root Frame node.",
      });
    }

    const pageIds = new Set<string>();
    spec.pages.forEach((page, index) => {
      if (pageIds.has(page.id)) {
        issues.push({
          code: "duplicate-page-id",
          message: `Duplicate page id "${page.id}".`,
          severity: "error",
          path: `pages.${index}.id`,
          suggestedFix: "Give each page a globally unique id.",
        });
      }

      pageIds.add(page.id);
    });

    if (!spec.themes[spec.activeThemeId]) {
      issues.push({
        code: "missing-active-theme",
        message: `Active theme "${spec.activeThemeId}" does not exist in themes.`,
        severity: "warning",
        path: "activeThemeId",
        suggestedFix: "Add the active theme id to themes or select an existing theme.",
      });
    }

    return issues;
  },
};

const propertyValueValidator: ValidatorDefinition = {
  id: "property-values",
  validate(root) {
    const issues: ValidationIssue[] = [];

    walkNode(root, (node) => {
      const definition = componentRegistry.get(node.type);

      if (!definition) {
        return;
      }

      definition.editableProps.forEach((propertyName) => {
        const hasProp = propertyName in node.props || propertyName in node.style;

        if (!hasProp && propertyName !== "events") {
          return;
        }

        const property = propertyRegistry
          .listForComponent(node.type)
          .find((candidate) => candidate.valueKey === propertyName);

        if (!property) {
          return;
        }

        const source = node[property.valueSource];
        const value = source[property.valueKey] ?? property.defaultValue ?? null;
        const validationMessage = propertyRegistry.validateValue(
          property.id,
          value,
          node,
        );

        if (validationMessage) {
          issues.push({
            code: "invalid-property-value",
            message: validationMessage,
            severity: "error",
            nodeId: node.id,
            path: `${node.id}.${property.valueSource}.${property.valueKey}`,
            suggestedFix: `Update "${property.label}" to a valid value.`,
          });
        }
      });

      definition.editableProps.forEach((propertyName) => {
        if (
          propertyName in definition.defaultProps &&
          isEmpty(node.props[propertyName])
        ) {
          issues.push({
            code: "missing-required-prop",
            message: `"${node.type}" is missing required prop "${propertyName}".`,
            severity: "warning",
            nodeId: node.id,
            path: `${node.id}.props.${propertyName}`,
            suggestedFix: "Set the property or remove it from editable required props.",
          });
        }
      });
    });

    return issues;
  },
};

const bindingValidator: ValidatorDefinition = {
  id: "bindings",
  validate(root) {
    const issues: ValidationIssue[] = [];

    walkNode(root, (node) => {
      Object.entries(node.bindings).forEach(([bindingName, value]) => {
        if (!bindingName.trim()) {
          issues.push({
            code: "invalid-binding-name",
            message: "Binding names must be non-empty.",
            severity: "error",
            nodeId: node.id,
            suggestedFix: "Rename or remove the binding.",
          });
        }

        if (typeof value === "string" && value.trim() === "") {
          issues.push({
            code: "invalid-binding-value",
            message: `Binding "${bindingName}" has an empty value.`,
            severity: "warning",
            nodeId: node.id,
            path: `${node.id}.bindings.${bindingName}`,
            suggestedFix: "Connect this binding to a data source or remove it.",
          });
        }
      });
    });

    return issues;
  },
};

const eventReferenceValidator: ValidatorDefinition = {
  id: "events",
  validate(root) {
    const issues: ValidationIssue[] = [];

    walkNode(root, (node) => {
      Object.entries(node.events).forEach(([eventName, value]) => {
        const eventConfig = isJsonObject(value) ? value : null;

        if (!eventRegistry.supports(node.type, eventName)) {
          issues.push({
            code: "unsupported-event",
            message: `"${node.type}" does not support event "${eventName}".`,
            severity: "error",
            nodeId: node.id,
            path: `${node.id}.events.${eventName}`,
            suggestedFix: "Use a supported event from the Event Registry.",
          });
        }

        if (!value || typeof value !== "object" || Array.isArray(value)) {
          issues.push({
            code: "invalid-event-reference",
            message: `Event "${eventName}" must be a JSON object payload.`,
            severity: "error",
            nodeId: node.id,
            path: `${node.id}.events.${eventName}`,
            suggestedFix: "Store event configuration as a JSON object.",
          });
          return;
        }

        const configuredPayload = eventConfig?.payload;
        const payload =
          configuredPayload !== undefined && isJsonObject(configuredPayload)
            ? configuredPayload
            : {};
        const payloadMessage = eventRegistry.validatePayload(
          node.type,
          eventName,
          payload,
        );

        if (payloadMessage) {
          issues.push({
            code: "invalid-event-payload",
            message: payloadMessage,
            severity: "error",
            nodeId: node.id,
            path: `${node.id}.events.${eventName}.payload`,
            suggestedFix: "Match the event payload to the Event Registry schema.",
          });
        }

        if (
          eventConfig?.handlerType === "workflow" &&
          typeof eventConfig.targetId !== "string"
        ) {
          issues.push({
            code: "missing-event-target",
            message: `Workflow event "${eventName}" must include targetId.`,
            severity: "error",
            nodeId: node.id,
            path: `${node.id}.events.${eventName}.targetId`,
            suggestedFix: "Set targetId to the workflow this event should trigger.",
          });
        }
      });
    });

    return issues;
  },
};

const themeTokenValidator: ValidatorDefinition = {
  id: "theme-tokens",
  validate(root) {
    const issues: ValidationIssue[] = [];

    walkNode(root, (node) => {
      Object.entries(node.style).forEach(([styleKey, value]) => {
        visitJsonValues(value, (candidate) => {
          if (!isTokenReference(candidate)) {
            return;
          }

          if (!themeRegistry.resolveToken(candidate)) {
            issues.push({
              code: "missing-theme-token",
              message: `Style "${styleKey}" references missing token ${candidate}.`,
              severity: "warning",
              nodeId: node.id,
              path: `${node.id}.style.${styleKey}`,
              suggestedFix: "Register the theme token or replace it with a raw style value.",
            });
          }
        });
      });
    });

    return issues;
  },
};

export class ValidatorRegistry extends TypedRegistry<ValidatorDefinition> {
  validate(root: AppNode): readonly ValidationIssue[] {
    return this.list().flatMap((validator) => validator.validate(root));
  }

  validateSpec(spec: AppSpec): readonly ValidationIssue[] {
    return [
      ...this.list().flatMap(
        (validator) => validator.validateSpec?.(spec) ?? [],
      ),
      ...spec.pages.flatMap((page) =>
        this.validate(page.root).map((issue) => ({
          ...issue,
          path: issue.path ?? `pages.${page.id}`,
        })),
      ),
    ];
  }
}

export const validatorRegistry = new ValidatorRegistry([
  appSpecIntegrityValidator,
  circularTreeValidator,
  duplicateIdValidator,
  componentContractValidator,
  propertyValueValidator,
  bindingValidator,
  eventReferenceValidator,
  themeTokenValidator,
]);
