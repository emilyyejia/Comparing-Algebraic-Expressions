
import React from 'react';
import { Direction } from '../../levels/custom-frog-game/frogGameTypes';

interface ControlButtonProps {
  label: string;
  direction: Direction;
  onClick: (direction: Direction) => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({ label, direction, onClick, className = '', ariaLabel, disabled = false }) => {
  return (
    <button
      onClick={() => onClick(direction)}
      aria-label={ariaLabel || `Move ${label.toLowerCase()}`}
      disabled={disabled}
      className={`
        bg-slate-700 hover:bg-slate-600 text-white font-bold 
        py-3 px-4 rounded-lg shadow-md transition-all duration-200 ease-in-out 
        text-lg focus:outline-none focus:ring-4 focus:ring-sky-500 focus:ring-opacity-50 
        active:bg-slate-800 transform active:scale-95 
        h-14 flex items-center justify-center
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-700 disabled:active:scale-100
        ${className}
      `}
    >
      {label}
    </button>
  );
};

export default ControlButton;
