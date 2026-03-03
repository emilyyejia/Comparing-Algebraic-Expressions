import React from 'react';
import { Direction } from './types';

interface ControlsProps {
  onMove: (direction: Direction) => void;
  disabled: boolean;
}

const Button: React.FC<{
  onClick: () => void;
  disabled: boolean;
  label: string;
  className?: string;
  children: React.ReactNode;
}> = ({ onClick, disabled, label, children, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={`Move ${label}`}
    className={`bg-sky-500 hover:bg-sky-600 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-bold py-2 px-3 text-sm rounded-lg shadow-md transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 ${className}`}
  >
    {children}
  </button>
);


export const Controls: React.FC<ControlsProps> = ({ onMove, disabled }) => {
  return (
    <div className="flex flex-row items-center justify-center space-x-2 mt-6 text-slate-700">
      <Button onClick={() => onMove('N')} disabled={disabled} label="North">North</Button>
      <Button onClick={() => onMove('S')} disabled={disabled} label="South">South</Button>
      <Button onClick={() => onMove('E')} disabled={disabled} label="East">East</Button>
      <Button onClick={() => onMove('W')} disabled={disabled} label="West">West</Button>
    </div>
  );
};
