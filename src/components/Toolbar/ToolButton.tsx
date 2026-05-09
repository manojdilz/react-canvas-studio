import React from 'react';
import type { ToolType } from '../../types/canvas';

interface ToolButtonProps {
  toolId: ToolType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const ToolButton: React.FC<ToolButtonProps> = ({
  toolId,
  label,
  icon,
  isActive,
  onClick,
}) => {
  return (
    <button
      id={`tool-${toolId}`}
      className={`tool-btn ${isActive ? 'tool-btn--active' : ''}`}
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={isActive}
    >
      <span className="tool-btn__icon">{icon}</span>
      <span className="tool-btn__label">{label}</span>
    </button>
  );
};

export default React.memo(ToolButton);
