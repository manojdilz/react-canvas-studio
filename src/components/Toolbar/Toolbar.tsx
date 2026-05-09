import React from 'react';
import {
  MousePointer2,
  Pencil,
  Minus,
  Square,
  Circle,
  MoveRight,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
} from 'lucide-react';
import { useCanvasStore, selectCanUndo, selectCanRedo } from '../../store/canvasStore';
import ToolButton from './ToolButton';
import ColorSection from './ColorSection';
import StrokeSettings from './StrokeSettings';
import type { ToolType } from '../../types/canvas';

interface ToolDef {
  id: ToolType;
  label: string;
  icon: React.ReactNode;
}

const TOOLS: ToolDef[] = [
  { id: 'select', label: 'Select (V)', icon: <MousePointer2 size={18} /> },
  { id: 'pen', label: 'Pen (P)', icon: <Pencil size={18} /> },
  { id: 'line', label: 'Line (L)', icon: <Minus size={18} /> },
  { id: 'rect', label: 'Rectangle (R)', icon: <Square size={18} /> },
  { id: 'circle', label: 'Circle (C)', icon: <Circle size={18} /> },
  { id: 'arrow', label: 'Arrow (A)', icon: <MoveRight size={18} /> },
  { id: 'eraser', label: 'Eraser (E)', icon: <Eraser size={18} /> },
];

const Toolbar: React.FC = () => {
  const tool = useCanvasStore((s) => s.tool);
  const setTool = useCanvasStore((s) => s.setTool);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const clearCanvas = useCanvasStore((s) => s.clearCanvas);
  const selectedIds = useCanvasStore((s) => s.selectedIds);
  const deleteShapes = useCanvasStore((s) => s.deleteShapes);
  const setSelectedIds = useCanvasStore((s) => s.setSelectedIds);
  const canUndo = useCanvasStore(selectCanUndo);
  const canRedo = useCanvasStore(selectCanRedo);

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      deleteShapes(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <aside className="toolbar" role="complementary" aria-label="Drawing tools">
      {/* Brand */}
      <div className="toolbar-brand">
        <span className="toolbar-brand__icon">✦</span>
        <span className="toolbar-brand__name">Canvas Studio</span>
      </div>

      {/* Tools */}
      <div className="toolbar-section">
        <span className="toolbar-section__title">Tools</span>
        <div className="tool-grid">
          {TOOLS.map((t) => (
            <ToolButton
              key={t.id}
              toolId={t.id}
              label={t.label}
              icon={t.icon}
              isActive={tool === t.id}
              onClick={() => setTool(t.id)}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-divider" />

      {/* Colors */}
      <ColorSection />

      <div className="toolbar-divider" />

      {/* Stroke & Opacity */}
      <StrokeSettings />

      <div className="toolbar-divider" />

      {/* Actions */}
      <div className="toolbar-section">
        <span className="toolbar-section__title">Actions</span>
        <div className="action-row">
          <button
            id="btn-undo"
            className="action-btn"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <Undo2 size={16} />
            <span>Undo</span>
          </button>
          <button
            id="btn-redo"
            className="action-btn"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <Redo2 size={16} />
            <span>Redo</span>
          </button>
        </div>

        {selectedIds.length > 0 && (
          <button
            id="btn-delete-selected"
            className="action-btn action-btn--danger"
            onClick={handleDeleteSelected}
            title="Delete selected (Del)"
            aria-label="Delete selected shapes"
          >
            <Trash2 size={16} />
            <span>Delete Selected ({selectedIds.length})</span>
          </button>
        )}

        <button
          id="btn-clear"
          className="action-btn action-btn--ghost"
          onClick={clearCanvas}
          title="Clear all"
          aria-label="Clear canvas"
        >
          <Trash2 size={16} />
          <span>Clear Canvas</span>
        </button>
      </div>

      {/* Keyboard hint */}
      <div className="toolbar-hints">
        <p>Del — delete selected</p>
        <p>Shift+click — multi-select</p>
        <p>Ctrl+Z / Ctrl+Y — undo/redo</p>
        <p>Esc — deselect</p>
      </div>
    </aside>
  );
};

export default Toolbar;
