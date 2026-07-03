export type CollisionBox = {
  id: string;
  rect: DOMRect;
};

export function findDeepestCollision(
  pointer: { x: number; y: number },
  boxes: readonly CollisionBox[],
): CollisionBox | null {
  const hits = boxes.filter(
    (box) =>
      pointer.x >= box.rect.left &&
      pointer.x <= box.rect.right &&
      pointer.y >= box.rect.top &&
      pointer.y <= box.rect.bottom,
  );

  return hits.at(-1) ?? null;
}
