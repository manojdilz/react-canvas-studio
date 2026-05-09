<div align="center">

# ✦ Canvas Studio

**A production-grade, browser-based drawing application**  
built with React, TypeScript, Konva, and Zustand.

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Konva](https://img.shields.io/badge/Konva-9-0D83CD?style=flat-square)
![Zustand](https://img.shields.io/badge/Zustand-4-brown?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

</div>

---

## Overview

Canvas Studio is a fully-featured, client-side drawing application that runs entirely in the browser. It provides a rich set of drawing tools, a fully interactive selection system with resize/move support, real-time color and stroke customization, and a robust undo/redo history — all built with clean, well-organized, production-quality code.

---

## Features

### 🖊️ Drawing Tools
| Tool | Description |
|------|-------------|
| **Select** | Click to select shapes; Shift+click for multi-select; drag to move; resize via handles |
| **Pen** | Smooth freehand drawing with Bézier tension |
| **Line** | Straight lines from point to point |
| **Rectangle** | Drag to draw filled or outlined rectangles |
| **Circle / Ellipse** | Drag to draw circles and ellipses |
| **Arrow** | Directional arrows with styled pointerheads |
| **Eraser** | Click or drag to erase shapes under the cursor |

### 🎨 Style Controls
- **Stroke color** picker with full HEX color palette
- **Fill color** picker with transparent (no-fill) option
- **Stroke width** presets (1 px → 12 px)
- **Opacity** slider (10% → 100%)

### ⚡ Productivity
- **Undo / Redo** — 50-step history stack (`Ctrl+Z` / `Ctrl+Y`)
- **Delete selected** — `Delete` or `Backspace` key
- **Deselect** — `Escape` key
- **Multi-select** — `Shift+click` shapes
- **Resize & Rotate** — Konva Transformer handles on selected shapes
- **Clear canvas** — one-click reset

---

## Tech Stack

| Layer | Library | Purpose |
|-------|---------|---------|
| Framework | [React 18](https://react.dev) | Component model & reactivity |
| Language | [TypeScript 5](https://www.typescriptlang.org) | Type safety across the codebase |
| Bundler | [Vite 5](https://vitejs.dev) | Fast dev server & optimized builds |
| Canvas | [react-konva](https://konvajs.org/docs/react/) + [Konva](https://konvajs.org) | Scene-graph canvas rendering |
| State | [Zustand 4](https://zustand-demo.pmnd.rs) | Lightweight global state management |
| Colors | [react-colorful](https://omgovich.github.io/react-colorful/) | Accessible HEX color picker |
| Icons | [lucide-react](https://lucide.dev) | Clean, consistent icon set |

---

## Project Structure

```
src/
├── components/
│   ├── Canvas/
│   │   ├── CanvasBoard.tsx          # Konva Stage + Layer; pointer event delegation
│   │   ├── ShapeRenderer.tsx        # Renders any CanvasShape as a Konva node
│   │   └── SelectionTransformer.tsx # Konva Transformer (resize / rotate handles)
│   └── Toolbar/
│       ├── Toolbar.tsx              # Main sidebar panel
│       ├── ToolButton.tsx           # Individual accessible tool button
│       ├── ColorSection.tsx         # Stroke & fill color pickers with popover
│       └── StrokeSettings.tsx       # Stroke width presets + opacity slider
├── hooks/
│   ├── useDrawing.ts                # All pointer event logic (draw, erase, preview)
│   └── useKeyboardShortcuts.ts      # Undo, redo, delete, escape shortcuts
├── store/
│   └── canvasStore.ts               # Zustand store — shapes, tool, style, history
├── types/
│   └── canvas.ts                    # All shared TypeScript interfaces & unions
├── utils/
│   └── shapeFactory.ts              # Creates & mutates in-progress shapes
├── styles/
│   └── index.css                    # Design tokens, glassmorphism toolbar, all styles
├── App.tsx                          # Root layout
└── main.tsx                         # React DOM entry point
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) v18 or later
- npm v9 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/canvas-studio.git
cd canvas-studio

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

Output is placed in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Z` | Undo |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Redo |
| `Delete` / `Backspace` | Delete selected shape(s) |
| `Escape` | Deselect all |
| `Shift + Click` | Add/remove shape from selection |

---

## Architecture Notes

### State Management
The Zustand store (`canvasStore.ts`) is the single source of truth. It manages:
- The committed `shapes[]` array
- The `inProgressShape` (live preview, not yet committed)
- The `history` stack (max 50 entries) for undo/redo
- Current `tool`, `style` (stroke, fill, strokeWidth, opacity), and `selectedIds`

### Drawing Flow
1. `mousedown` → `createShape()` generates the initial shape object and stores it as `inProgressShape`
2. `mousemove` → `updateShapeInProgress()` mutates the live preview based on current pointer position. Pen tool uses a minimum-distance threshold to throttle updates
3. `mouseup` → trivially-small shapes are discarded; valid shapes are committed via `commitShape()` which also pushes a history entry

### Transform Baking
When a shape is resized or rotated via the Konva Transformer:
- **Rect / Circle**: dimensions are read from the node after transform and the scale is baked into `width`/`height` or `radiusX`/`radiusY`. Scale is then reset to 1
- **Line / Arrow / Pen**: the absolute transform matrix is applied to every point in the array, then the node's transform is reset to identity

---

## License

This project is licensed under the [MIT License](LICENSE) — free to use, modify, and distribute.

Copyright © 2026 Manoj

