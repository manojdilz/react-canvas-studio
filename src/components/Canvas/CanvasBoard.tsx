import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '../../store/canvasStore';
import { useDrawing } from '../../hooks/useDrawing';
import ShapeRenderer from './ShapeRenderer';
import SelectionTransformer from './SelectionTransformer';

const TOOLBAR_WIDTH = 260;

function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth - TOOLBAR_WIDTH,
    height: window.innerHeight,
  });

  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth - TOOLBAR_WIDTH, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return size;
}

// Cursor based on active tool
const TOOL_CURSORS: Record<string, string> = {
  select: 'default',
  pen: 'crosshair',
  line: 'crosshair',
  rect: 'crosshair',
  circle: 'crosshair',
  arrow: 'crosshair',
  eraser: 'cell',
};

const CanvasBoard: React.FC = () => {
  const stageRef = useRef<Konva.Stage>(null);
  const { width, height } = useWindowSize();

  const shapes = useCanvasStore((s) => s.shapes);
  const inProgressShape = useCanvasStore((s) => s.inProgressShape);
  const tool = useCanvasStore((s) => s.tool);

  const { handleMouseDown, handleMouseMove, handleMouseUp } = useDrawing(stageRef);

  const cursor = TOOL_CURSORS[tool] ?? 'crosshair';

  const handleMouseLeave = useCallback(() => {
    // Commit in-progress shape when mouse leaves canvas
    handleMouseUp();
  }, [handleMouseUp]);

  return (
    <div className="canvas-container" style={{ cursor }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <Layer>
          {shapes.map((shape) => (
            <ShapeRenderer key={shape.id} shape={shape} />
          ))}

          {inProgressShape && (
            <ShapeRenderer key="preview" shape={inProgressShape} isPreview />
          )}

          <SelectionTransformer stageRef={stageRef} />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasBoard;
