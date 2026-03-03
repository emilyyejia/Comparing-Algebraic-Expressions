import React from 'react';

interface ScaleBarProps {
  scale: number;
}

const ScaleBar: React.FC<ScaleBarProps> = ({ scale }) => {
  return (
    <div className="w-full">
      <p className="text-center text-sm font-semibold text-slate-600 mb-1">{scale} metres</p>
      <div className="flex items-center justify-between h-2">
        <div className="h-full w-0.5 bg-slate-800"></div>
        <div className="flex-grow h-0.5 bg-slate-800"></div>
        <div className="h-full w-0.5 bg-slate-800"></div>
      </div>
    </div>
  );
};

export default ScaleBar;