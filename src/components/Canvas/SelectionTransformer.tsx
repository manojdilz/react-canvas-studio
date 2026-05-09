import React, { useEffect, useRef } from 'react';
import { Transformer } from 'react-konva';
import type Konva from 'konva';
import { useCanvasStore } from '../../store/canvasStore';

const TRANSFORMER_STYLE: Konva.TransformerConfig = {
  borderStroke: '#7c5cfc',
  borderStrokeWidth: 1.5,
  anchorStroke: '#7c5cfc',
  anchorFill: '#ffffff',
  anchorSize: 9,
  anchorCornerRadius: 3,
  rotateAnchorOffset: 24,
  enabledAnchors: [
    'top-left',
    'top-center',
    'top-right',
    'middle-right',
    'middle-left',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ],
};

interface SelectionTransformerProps {
  stageRef: React.RefObject<Konva.Stage>;
}

const SelectionTransformer: React.FC<SelectionTransformerProps> = ({ stageRef }) => {
  const transformerRef = useRef<Konva.Transformer>(null);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const tool = useCanvasStore((s) => s.tool);

  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    if (selectedIds.length === 0 || tool !== 'select') {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }

    const nodes = selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((n): n is Konva.Node => n !== undefined);

    transformer.nodes(nodes);
    transformer.getLayer()?.batchDraw();
  }, [selectedIds, stageRef, tool]);

  return (
    <Transformer
      ref={transformerRef}
      {...TRANSFORMER_STYLE}
      boundBoxFunc={(oldBox, newBox) => {
        // Prevent collapsing to invisible size
        if (newBox.width < 5 || newBox.height < 5) return oldBox;
        return newBox;
      }}
    />
  );
};

export default SelectionTransformer;
