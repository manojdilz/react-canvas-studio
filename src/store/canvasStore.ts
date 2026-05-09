import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { CanvasShape, ToolType, ShapeStyle } from '../types/canvas';

// ─── Constants ──────────────────────────────────────────────────────────────────
const MAX_HISTORY = 50;

// ─── State & Actions Types ───────────────────────────────────────────────────────
interface CanvasState {
  shapes: CanvasShape[];
  inProgressShape: CanvasShape | null;
  selectedIds: string[];
  tool: ToolType;
  style: ShapeStyle;
  history: CanvasShape[][];
  historyIndex: number;
}

interface CanvasActions {
  commitShape: (shape: CanvasShape) => void;
  updateShapeAttrs: (id: string, attrs: Partial<CanvasShape>) => void;
  deleteShapes: (ids: string[]) => void;
  clearCanvas: () => void;
  setInProgressShape: (shape: CanvasShape | null) => void;
  setSelectedIds: (ids: string[]) => void;
  setTool: (tool: ToolType) => void;
  setStyle: (partialStyle: Partial<ShapeStyle>) => void;
  undo: () => void;
  redo: () => void;
}

type CanvasStore = CanvasState & CanvasActions;

// ─── History Helper ──────────────────────────────────────────────────────────────
function withHistory(
  state: CanvasState,
  nextShapes: CanvasShape[],
): Partial<CanvasState> {
  const trimmed = state.history.slice(0, state.historyIndex + 1);
  const newHistory = [...trimmed, nextShapes].slice(-MAX_HISTORY);
  return { history: newHistory, historyIndex: newHistory.length - 1 };
}

// ─── Default Style ───────────────────────────────────────────────────────────────
const DEFAULT_STYLE: ShapeStyle = {
  stroke: '#7c5cfc',
  fill: 'transparent',
  strokeWidth: 3,
  opacity: 1,
};

// ─── Store ───────────────────────────────────────────────────────────────────────
export const useCanvasStore = create<CanvasStore>()(
  devtools(
    (set) => ({
      shapes: [],
      inProgressShape: null,
      selectedIds: [],
      tool: 'pen',
      style: DEFAULT_STYLE,
      history: [[]],
      historyIndex: 0,

      commitShape: (shape) =>
        set((state) => {
          const nextShapes = [...state.shapes, shape];
          return { shapes: nextShapes, ...withHistory(state, nextShapes) };
        }, false, 'commitShape'),

      updateShapeAttrs: (id, attrs) =>
        set((state) => {
          const nextShapes = state.shapes.map((s) =>
            s.id === id ? ({ ...s, ...attrs } as CanvasShape) : s,
          );
          return { shapes: nextShapes, ...withHistory(state, nextShapes) };
        }, false, 'updateShapeAttrs'),

      deleteShapes: (ids) =>
        set((state) => {
          const nextShapes = state.shapes.filter((s) => !ids.includes(s.id));
          return {
            shapes: nextShapes,
            selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
            ...withHistory(state, nextShapes),
          };
        }, false, 'deleteShapes'),

      clearCanvas: () =>
        set((state) => ({
          shapes: [],
          selectedIds: [],
          inProgressShape: null,
          ...withHistory(state, []),
        }), false, 'clearCanvas'),

      setInProgressShape: (shape) =>
        set({ inProgressShape: shape }, false, 'setInProgressShape'),

      setSelectedIds: (ids) =>
        set({ selectedIds: ids }, false, 'setSelectedIds'),

      setTool: (tool) =>
        set({ tool, selectedIds: [], inProgressShape: null }, false, 'setTool'),

      setStyle: (partialStyle) =>
        set(
          (state) => ({ style: { ...state.style, ...partialStyle } }),
          false,
          'setStyle',
        ),

      undo: () =>
        set((state) => {
          if (state.historyIndex <= 0) return {};
          const newIndex = state.historyIndex - 1;
          return {
            shapes: state.history[newIndex],
            historyIndex: newIndex,
            selectedIds: [],
            inProgressShape: null,
          };
        }, false, 'undo'),

      redo: () =>
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return {};
          const newIndex = state.historyIndex + 1;
          return {
            shapes: state.history[newIndex],
            historyIndex: newIndex,
            selectedIds: [],
          };
        }, false, 'redo'),
    }),
    { name: 'CanvasStore' },
  ),
);

// ─── Derived Selectors ───────────────────────────────────────────────────────────
export const selectCanUndo = (s: CanvasStore) => s.historyIndex > 0;
export const selectCanRedo = (s: CanvasStore) =>
  s.historyIndex < s.history.length - 1;
