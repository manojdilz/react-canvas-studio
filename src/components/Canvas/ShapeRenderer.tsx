import React, { useCallback } from 'react';
import { Line, Rect, Ellipse, Arrow } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCanvasStore } from '../../store/canvasStore';
import type { CanvasShape } from '../../types/canvas';

interface ShapeRendererProps {
  shape: CanvasShape;
  /** When true the shape is a transient in-progress preview (non-interactive) */
  isPreview?: boolean;
}

const ShapeRenderer: React.FC<ShapeRendererProps> = ({ shape, isPreview = false }) => {
  const tool = useCanvasStore((s) => s.tool);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const updateShapeAttrs = useCanvasStore((s) => s.updateShapeAttrs);

  const isSelected = selectedIds.includes(shape.id);
  const isDraggable = !isPreview && tool === 'select';

  // ─── Event Handlers ─────────────────────────────────────────────────────────
  const handleClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (tool !== 'select' || isPreview) return;
      e.cancelBubble = true;

      if (e.evt.shiftKey) {
        setSelectedIds(
          isSelected
            ? selectedIds.filter((id) => id !== shape.id)
            : [...selectedIds, shape.id],
        );
      } else {
        setSelectedIds([shape.id]);
      }
    },
    [tool, isPreview, isSelected, selectedIds, setSelectedIds, shape.id],
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const node = e.target;
      switch (shape.type) {
        case 'rect':
        case 'circle':
          updateShapeAttrs(shape.id, { x: node.x(), y: node.y() });
          break;
        case 'pen':
        case 'line':
        case 'arrow': {
          // Bake drag offset into points and reset node position
          const dx = node.x();
          const dy = node.y();
          const newPoints = (shape as { points: number[] }).points.map(
            (p, i) => (i % 2 === 0 ? p + dx : p + dy),
          );
          node.position({ x: 0, y: 0 });
          updateShapeAttrs(shape.id, { points: newPoints } as Partial<CanvasShape>);
          break;
        }
      }
    },
    [shape, updateShapeAttrs],
  );

  const handleTransformEnd = useCallback(
    (e: KonvaEventObject<Event>) => {
      const node = e.target as Konva.Node;
      switch (shape.type) {
        case 'rect': {
          const rectNode = node as Konva.Rect;
          updateShapeAttrs(shape.id, {
            x: rectNode.x(),
            y: rectNode.y(),
            width: Math.max(4, rectNode.width() * rectNode.scaleX()),
            height: Math.max(4, rectNode.height() * rectNode.scaleY()),
            rotation: rectNode.rotation(),
          } as Partial<CanvasShape>);
          rectNode.scaleX(1);
          rectNode.scaleY(1);
          break;
        }
        case 'circle': {
          const ellipseNode = node as Konva.Ellipse;
          updateShapeAttrs(shape.id, {
            x: ellipseNode.x(),
            y: ellipseNode.y(),
            radiusX: Math.max(4, ellipseNode.radiusX() * ellipseNode.scaleX()),
            radiusY: Math.max(4, ellipseNode.radiusY() * ellipseNode.scaleY()),
            rotation: ellipseNode.rotation(),
          } as Partial<CanvasShape>);
          ellipseNode.scaleX(1);
          ellipseNode.scaleY(1);
          break;
        }
        case 'arrow':
        case 'line':
        case 'pen': {
          // Apply absolute transform matrix to bake scale & rotation into points
          const absTransform = node.getAbsoluteTransform();
          const layerTransform = node
            .getLayer()
            ?.getAbsoluteTransform()
            .copy()
            .invert();
          const currentPoints = (shape as { points: number[] }).points;
          const newPoints: number[] = [];
          for (let i = 0; i < currentPoints.length; i += 2) {
            let pt = absTransform.point({
              x: currentPoints[i],
              y: currentPoints[i + 1],
            });
            if (layerTransform) {
              pt = layerTransform.point(pt);
            }
            newPoints.push(pt.x, pt.y);
          }
          node.setAttrs({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });
          updateShapeAttrs(shape.id, { points: newPoints } as Partial<CanvasShape>);
          break;
        }
      }
    },
    [shape, updateShapeAttrs],
  );

  // ─── Shared Props ────────────────────────────────────────────────────────────
  const commonProps = {
    id: isPreview ? undefined : shape.id,
    stroke: shape.stroke,
    fill: shape.fill === 'transparent' ? undefined : shape.fill,
    strokeWidth: shape.strokeWidth,
    opacity: shape.opacity,
    rotation: shape.rotation,
    draggable: isDraggable,
    listening: !isPreview,
    onClick: handleClick,
    onTap: handleClick,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
    // Highlight selected shapes
    shadowColor: isSelected && !isPreview ? '#7c5cfc' : undefined,
    shadowBlur: isSelected && !isPreview ? 12 : 0,
    shadowOpacity: isSelected && !isPreview ? 0.8 : 0,
  };

  // ─── Shape Render ────────────────────────────────────────────────────────────
  switch (shape.type) {
    case 'rect':
      return (
        <Rect
          {...commonProps}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
        />
      );
    case 'circle':
      return (
        <Ellipse
          {...commonProps}
          x={shape.x}
          y={shape.y}
          radiusX={shape.radiusX}
          radiusY={shape.radiusY}
        />
      );
    case 'line':
      return (
        <Line
          {...commonProps}
          points={shape.points}
          lineCap="round"
          lineJoin="round"
        />
      );
    case 'arrow':
      return (
        <Arrow
          {...commonProps}
          points={shape.points}
          pointerLength={12}
          pointerWidth={10}
          lineCap="round"
        />
      );
    case 'pen':
      return (
        <Line
          {...commonProps}
          points={shape.points}
          tension={0.4}
          lineCap="round"
          lineJoin="round"
        />
      );
  }
};

export default React.memo(ShapeRenderer);
