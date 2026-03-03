
import React from 'react';
import { CharacterType } from '../../levels/custom-frog-game/frogGameTypes';
import Character from './Character';
import { CELL_SIZE_TW, FLY_EMOJI_SIZE_TW } from '../../levels/custom-frog-game/frogGameConstants';

interface CellProps {
  characterType: CharacterType;
  isLilyPad: boolean; 
  isDynamicFly: boolean;
}

const LilyPadIcon: React.FC = () => (
  <svg 
    viewBox="0 0 100 100" 
    className="absolute inset-0 w-full h-full p-1.5 opacity-85 pointer-events-none z-0" 
    preserveAspectRatio="xMidYMid meet" 
    aria-hidden="true"
  >
    <path d="M 50,95 A 45,45 0 1,1 81.21,18.78 L 50,50 Z" fill="#22c55e" stroke="#15803d" strokeWidth="3"/>
  </svg>
);

const Cell: React.FC<CellProps> = ({ characterType, isLilyPad, isDynamicFly }) => {
  const cellBaseStyles = `${CELL_SIZE_TW} flex items-center justify-center select-none transition-all duration-300 relative`;
  
  let effectiveBackgroundClasses = 'bg-blue-500 border border-blue-600 hover:bg-blue-400';
  let foregroundContent = null;

  if (characterType !== CharacterType.NONE) {
    foregroundContent = (
      <div className="relative z-20"> {/* Characters are top layer */}
        <Character type={characterType} />
      </div>
    );
  } else if (isDynamicFly) {
    foregroundContent = (
      <span 
        className={`${FLY_EMOJI_SIZE_TW} animate-ping-slow relative z-15 text-yellow-300 brightness-150 shadow-lg shadow-yellow-500/50`}
        role="img" 
        aria-label="glowing fly"
      >
        🪰
      </span>
    );
  }

  return (
    <div className={`${cellBaseStyles} ${effectiveBackgroundClasses}`}>
      {isLilyPad && <LilyPadIcon />}
      {foregroundContent}
    </div>
  );
};

export default Cell;
