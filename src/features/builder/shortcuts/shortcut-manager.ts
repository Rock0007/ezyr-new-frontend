export type ShortcutCommand =
  | "undo"
  | "redo"
  | "copy"
  | "paste"
  | "duplicate"
  | "delete"
  | "clear-selection"
  | "select-all";

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select"
  );
}

export function resolveShortcut(event: KeyboardEvent): ShortcutCommand | null {
  if (isEditableShortcutTarget(event.target)) {
    return null;
  }

  const key = event.key.toLowerCase();
  const primary = event.ctrlKey || event.metaKey;

  if (primary && key === "z" && event.shiftKey) {
    return "redo";
  }

  if (primary && key === "z") {
    return "undo";
  }

  if (primary && key === "y") {
    return "redo";
  }

  if (primary && key === "c") {
    return "copy";
  }

  if (primary && key === "v") {
    return "paste";
  }

  if (primary && key === "d") {
    return "duplicate";
  }

  if (primary && key === "a") {
    return "select-all";
  }

  if (key === "delete" || key === "backspace") {
    return "delete";
  }

  if (key === "escape") {
    return "clear-selection";
  }

  return null;
}
