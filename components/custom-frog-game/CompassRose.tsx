
import React from 'react';

interface CompassRoseProps {
  className?: string;
}

const CompassRose: React.FC<CompassRoseProps> = ({ className = '' }) => {
  return (
    <div
      className={`
        w-14 h-14 
        flex flex-col items-center justify-center 
        bg-slate-700/70 backdrop-blur-sm
        border border-slate-600 
        rounded-full 
        shadow-lg 
        p-1 
        ${className}
      `}
      aria-hidden="true"
      role="img"
      aria-label="Compass rose indicating North is up"
    >
      <span className="text-sm font-bold text-slate-200 select-none -mb-0.5">
        N
      </span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-1/2 h-1/2 text-slate-200"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </div>
  );
};

export default CompassRose;
