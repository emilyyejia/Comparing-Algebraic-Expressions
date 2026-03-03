import React from 'react';

const CompassRose: React.FC = () => {
  return (
    <div 
        className="relative w-12 h-12 flex flex-col items-center justify-center bg-slate-50 border-2 border-slate-600 rounded-full shadow-md"
        aria-label="Compass rose indicating North"
        title="North"
    >
        <span className="font-bold text-slate-800 text-lg leading-none -mb-1">N</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 text-slate-800"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
        </svg>
    </div>
  );
};

export default CompassRose;