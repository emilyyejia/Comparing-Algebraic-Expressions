import React from 'react';

const SuccessIndicator: React.FC = () => (
  <div className="flex items-center justify-center h-[68px] md:h-[76px]">
    <div className="relative">
      <div className="w-16 h-16 rounded-full bg-green-500 animate-pulse"></div>
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-white"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>
  </div>
);

export default SuccessIndicator;
