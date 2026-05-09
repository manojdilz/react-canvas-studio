import type {
  DrawableToolType,
  ShapeStyle,
  CanvasShape,
  Point,
  PenShape,
  LineShape,
  ArrowShape,
  RectShape,
  CircleShape,
} from '../types/canvas';

const generateId = (): string => crypto.randomUUID();

// ─── Create a new shape at the given start point ─────────────────────────────
export function createShape(
  tool: DrawableToolType,
  start: Point,
  style: ShapeStyle,
): CanvasShape {
  const base = { id: generateId(), rotation: 0, ...style };
  switch (tool) {
    case 'pen':
      return { ...base, type: 'pen', points: [start.x, start.y] } satisfies PenShape;
    case 'line':
      return { ...base, type: 'line', points: [start.x, start.y, start.x, start.y] } satisfies LineShape;
    case 'arrow':
      return { ...base, type: 'arrow', points: [start.x, start.y, start.x, start.y] } satisfies ArrowShape;
    case 'rect':
      return { ...base, type: 'rect', x: start.x, y: start.y, width: 0, height: 0 } satisfies RectShape;
    case 'circle':
      return { ...base, type: 'circle', x: start.x, y: start.y, radiusX: 0, radiusY: 0 } satisfies CircleShape;
  }
}

// ─── Update an in-progress shape as the pointer moves ────────────────────────
export function updateShapeInProgress(
  shape: CanvasShape,
  start: Point,
  current: Point,
): CanvasShape {
  switch (shape.type) {
    case 'pen':
      return { ...shape, points: [...shape.points, current.x, current.y] };
    case 'line':
    case 'arrow':
      return { ...shape, points: [start.x, start.y, current.x, current.y] };
    case 'rect': {
      const x = Math.min(start.x, current.x);
      const y = Math.min(start.y, current.y);
      const width = Math.abs(current.x - start.x);
      const height = Math.abs(current.y - start.y);
      return { ...shape, x, y, width, height };
    }
    case 'circle': {
      const radiusX = Math.abs(current.x - start.x) / 2;
      const radiusY = Math.abs(current.y - start.y) / 2;
      const x = (start.x + current.x) / 2;
      const y = (start.y + current.y) / 2;
      return { ...shape, x, y, radiusX, radiusY };
    }
  }
}
