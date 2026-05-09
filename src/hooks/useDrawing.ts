import { useCallback, useRef } from 'react';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCanvasStore } from '../store/canvasStore';
import { createShape, updateShapeInProgress } from '../utils/shapeFactory';
import type { DrawableToolType, Point } from '../types/canvas';

// Minimum pixel distance between pen points (throttles state updates for perf)
const PEN_MIN_DISTANCE = 4;

export function useDrawing(stageRef: React.RefObject<Konva.Stage>) {
  const isDrawing = useRef(false);
  const isErasing = useRef(false);
  const startPos = useRef<Point>({ x: 0, y: 0 });
  const lastPenPos = useRef<Point | null>(null);

  const {
    tool,
    style,
    inProgressShape,
    setInProgressShape,
    commitShape,
    deleteShapes,
    setSelectedIds,
    shapes,
  } = useCanvasStore();

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const getPointerPos = useCallback((): Point | null => {
    const pos = stageRef.current?.getPointerPosition();
    return pos ? { x: pos.x, y: pos.y } : null;
  }, [stageRef]);

  const eraseAtPoint = useCallback(
    (pos: Point) => {
      const stage = stageRef.current;
      if (!stage) return;
      const target = stage.getIntersection(pos);
      if (!target) return;
      const id = target.id();
      if (id && shapes.some((s) => s.id === id)) {
        deleteShapes([id]);
      }
    },
    [stageRef, shapes, deleteShapes],
  );

  // ─── Event Handlers ───────────────────────────────────────────────────────────
  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const pos = getPointerPos();
      if (!pos) return;

      if (tool === 'select') {
        // Deselect when clicking empty stage
        if (e.target === e.target.getStage()) {
          setSelectedIds([]);
        }
        return;
      }

      if (tool === 'eraser') {
        isErasing.current = true;
        eraseAtPoint(pos);
        return;
      }

      isDrawing.current = true;
      startPos.current = pos;
      lastPenPos.current = pos;

      const newShape = createShape(tool as DrawableToolType, pos, style);
      setInProgressShape(newShape);
    },
    [tool, style, getPointerPos, eraseAtPoint, setInProgressShape, setSelectedIds],
  );

  const handleMouseMove = useCallback(
    (_e: KonvaEventObject<MouseEvent>) => {
      const pos = getPointerPos();
      if (!pos) return;

      if (isErasing.current) {
        eraseAtPoint(pos);
        return;
      }

      if (!isDrawing.current || !inProgressShape) return;

      // Throttle pen points by distance to reduce rerender count
      if (inProgressShape.type === 'pen') {
        const last = lastPenPos.current!;
        const dist = Math.hypot(pos.x - last.x, pos.y - last.y);
        if (dist < PEN_MIN_DISTANCE) return;
        lastPenPos.current = pos;
      }

      const updated = updateShapeInProgress(inProgressShape, startPos.current, pos);
      setInProgressShape(updated);
    },
    [getPointerPos, inProgressShape, eraseAtPoint, setInProgressShape],
  );

  const handleMouseUp = useCallback(() => {
    if (isErasing.current) {
      isErasing.current = false;
      return;
    }

    if (!isDrawing.current || !inProgressShape) return;
    isDrawing.current = false;

    // Discard trivially small shapes
    const isTrivial = (() => {
      switch (inProgressShape.type) {
        case 'rect':
          return inProgressShape.width < 2 && inProgressShape.height < 2;
        case 'circle':
          return inProgressShape.radiusX < 2 && inProgressShape.radiusY < 2;
        case 'line':
        case 'arrow': {
          const [x1, y1, x2, y2] = inProgressShape.points;
          return Math.hypot(x2 - x1, y2 - y1) < 2;
        }
        case 'pen':
          return inProgressShape.points.length < 4;
      }
    })();

    if (!isTrivial) {
      commitShape(inProgressShape);
    }
    setInProgressShape(null);
  }, [inProgressShape, commitShape, setInProgressShape]);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
}
