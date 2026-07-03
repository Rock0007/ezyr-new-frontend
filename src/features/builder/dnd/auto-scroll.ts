export type AutoScrollVector = {
  x: number;
  y: number;
};

export function calculateAutoScrollVector(
  pointer: { x: number; y: number },
  bounds: DOMRect,
  threshold = 48,
  maxSpeed = 18,
): AutoScrollVector {
  const left = pointer.x - bounds.left;
  const right = bounds.right - pointer.x;
  const top = pointer.y - bounds.top;
  const bottom = bounds.bottom - pointer.y;

  return {
    x: left < threshold ? -maxSpeed : right < threshold ? maxSpeed : 0,
    y: top < threshold ? -maxSpeed : bottom < threshold ? maxSpeed : 0,
  };
}
