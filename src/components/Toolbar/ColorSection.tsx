import React, { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useCanvasStore } from '../../store/canvasStore';

interface ColorSwatchProps {
  label: string;
  colorKey: 'stroke' | 'fill';
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ label, colorKey }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const color = useCanvasStore((s) => s.style[colorKey]);
  const setStyle = useCanvasStore((s) => s.setStyle);

  const displayColor = color === 'transparent' ? '#ffffff' : color;
  const isTransparent = color === 'transparent';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="color-swatch-wrapper" ref={ref}>
      <button
        className="color-swatch-btn"
        onClick={() => setOpen((v) => !v)}
        title={`${label}: ${color}`}
        aria-label={`Change ${label}`}
      >
        <span
          className={`color-swatch ${isTransparent ? 'color-swatch--transparent' : ''}`}
          style={{ backgroundColor: isTransparent ? 'transparent' : color }}
        />
        <span className="color-swatch-label">{label}</span>
      </button>

      {open && (
        <div className="color-picker-popover">
          <HexColorPicker
            color={displayColor}
            onChange={(c) => setStyle({ [colorKey]: c })}
          />
          {colorKey === 'fill' && (
            <button
              className="transparent-btn"
              onClick={() => {
                setStyle({ fill: 'transparent' });
                setOpen(false);
              }}
            >
              No Fill (Transparent)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ColorSection: React.FC = () => {
  return (
    <div className="toolbar-section">
      <span className="toolbar-section__title">Colors</span>
      <div className="color-row">
        <ColorSwatch label="Stroke" colorKey="stroke" />
        <ColorSwatch label="Fill" colorKey="fill" />
      </div>
    </div>
  );
};

export default ColorSection;
