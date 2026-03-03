import React from 'react';
import { Rotation } from './types';
import { COMPASS_N_ICON } from './constants';

interface CompassRoseProps {
  rotation: Rotation; // This is the map's rotation. Compass N should point to map's N.
}

export const CompassRose: React.FC<CompassRoseProps> = ({ rotation }) => {
  const rotationClass = (): string => {
    switch (rotation) {
      case 0: return 'rotate-0'; // N is Up
      case 90: return 'rotate-90'; // N is Right
      case 180: return 'rotate-180'; // N is Down
      case 270: return 'rotate-[270deg]'; // N is Left
      default: return 'rotate-0';
    }
  };

  return (
    <div className="relative w-16 h-16 mb-2 flex items-center justify-center bg-white/50 rounded-full shadow-md p-1">
      <div 
        className={`absolute w-full h-full flex items-center justify-center transition-transform duration-500 ease-in-out ${rotationClass()}`}
      >
        {/* Arrow pointing up, which will be rotated */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-600">
          <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1-1.06 1.06L13 5.81V21a.75.75 0 0 1-1.5 0V5.81L3.97 12.53a.75.75 0 0 1-1.06-1.06l7.5-7.5ZM12 3a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 12 3Z" clipRule="evenodd" />
        </svg>
      </div>
      {/* N letter, stays fixed relative to the arrow, so part of the rotating element */}
      <div 
        className={`absolute w-full h-full flex items-start justify-center pt-0 transition-transform duration-500 ease-in-out ${rotationClass()}`}
      >
         <span className="font-bold text-xl text-red-700" style={{ transform: 'translateY(-2px)' }}>{COMPASS_N_ICON}</span>
      </div>
    </div>
  );
};
