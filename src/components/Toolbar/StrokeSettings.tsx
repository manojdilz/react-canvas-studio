import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';

const STROKE_WIDTHS = [1, 2, 3, 5, 8, 12];

const StrokeSettings: React.FC = () => {
  const strokeWidth = useCanvasStore((s) => s.style.strokeWidth);
  const opacity = useCanvasStore((s) => s.style.opacity);
  const setStyle = useCanvasStore((s) => s.setStyle);

  return (
    <div className="toolbar-section">
      <span className="toolbar-section__title">Stroke Width</span>
      <div className="stroke-presets">
        {STROKE_WIDTHS.map((w) => (
          <button
            key={w}
            id={`stroke-width-${w}`}
            className={`stroke-preset ${strokeWidth === w ? 'stroke-preset--active' : ''}`}
            onClick={() => setStyle({ strokeWidth: w })}
            title={`${w}px`}
            aria-label={`Stroke width ${w}px`}
            aria-pressed={strokeWidth === w}
          >
            <span
              className="stroke-preview-line"
              style={{ height: `${Math.min(w, 10)}px` }}
            />
          </button>
        ))}
      </div>

      <div className="slider-row">
        <label className="slider-label" htmlFor="opacity-slider">
          Opacity
          <span className="slider-value">{Math.round(opacity * 100)}%</span>
        </label>
        <input
          id="opacity-slider"
          type="range"
          min={0.1}
          max={1}
          step={0.05}
          value={opacity}
          onChange={(e) => setStyle({ opacity: parseFloat(e.target.value) })}
          className="styled-slider"
        />
      </div>
    </div>
  );
};

export default StrokeSettings;
