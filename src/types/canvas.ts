// ─── Tool Types ─────────────────────────────────────────────────────────────────
export type ToolType =
  | 'select'
  | 'pen'
  | 'line'
  | 'rect'
  | 'circle'
  | 'arrow'
  | 'eraser';

export type DrawableToolType = Exclude<ToolType, 'select' | 'eraser'>;

// ─── Style ──────────────────────────────────────────────────────────────────────
export interface ShapeStyle {
  stroke: string;
  fill: string;
  strokeWidth: number;
  opacity: number;
}

// ─── Base Shape ─────────────────────────────────────────────────────────────────
interface BaseShape extends ShapeStyle {
  id: string;
  rotation: number;
}

// ─── Shape Variants ─────────────────────────────────────────────────────────────
export interface PenShape extends BaseShape {
  type: 'pen';
  points: number[];
}

export interface LineShape extends BaseShape {
  type: 'line';
  points: number[];
}

export interface ArrowShape extends BaseShape {
  type: 'arrow';
  points: number[];
}

export interface RectShape extends BaseShape {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  x: number;
  y: number;
  radiusX: number;
  radiusY: number;
}

// ─── Union ──────────────────────────────────────────────────────────────────────
export type CanvasShape =
  | PenShape
  | LineShape
  | ArrowShape
  | RectShape
  | CircleShape;

// ─── Point ──────────────────────────────────────────────────────────────────────
export interface Point {
  x: number;
  y: number;
}
