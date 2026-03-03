import React from 'react';

interface LevelIndicatorProps {
  level: number;
  totalLevels: number;
}

const LevelIndicator: React.FC<LevelIndicatorProps> = ({ level, totalLevels }) => {
  return (
    <div 
      className="absolute top-4 right-6 flex items-center space-x-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Level ${level} of ${totalLevels}`}
    >
      {Array.from({ length: totalLevels }).map((_, index) => {
        const currentLevelIndex = index + 1;
        const isCurrent = currentLevelIndex === level;
        const isCompleted = currentLevelIndex < level;
        
        let dotClass = 'text-slate-300';
        if (isCurrent) dotClass = 'text-blue-500';
        if (isCompleted) dotClass = 'text-slate-700';

        return (
          <span
            key={currentLevelIndex}
            className={`text-2xl transition-colors duration-300 ${dotClass}`}
            aria-hidden="true"
          >
            ●
          </span>
        );
      })}
    </div>
  );
};

export default LevelIndicator;
