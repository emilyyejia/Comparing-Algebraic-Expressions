
import React from 'react';

interface LevelIndicatorProps {
  level: number;
  totalLevels: number;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({ level, totalLevels }) => {
  return (
    <div 
      className="flex items-center space-x-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Level ${level} of ${totalLevels}`}
    >
      {Array.from({ length: totalLevels }).map((_, index) => {
        const currentLevelIndex = index + 1;
        const isCurrent = currentLevelIndex === level;
        return (
          <span
            key={currentLevelIndex}
            className={`text-2xl transition-colors duration-300 ${isCurrent ? 'text-white' : 'text-white/50'}`}
            aria-hidden="true"
          >
            {isCurrent ? '●' : '○'}
          </span>
        );
      })}
    </div>
  );
};

export default LevelIndicator;
