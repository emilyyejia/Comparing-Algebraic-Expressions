import React from 'react';
import { EXPLORER_ICON, TREASURE_ICON, OBSTACLE_ICON } from './constants';
import { Rotation } from './types';

interface GridCellProps {
  isExplorer: boolean;
  isTreasure: boolean;
  isObstacle: boolean;
  mapRotation: Rotation; // Added to know how to counter-rotate explorer
}

export const GridCell: React.FC<GridCellProps> = ({ isExplorer, isTreasure, isObstacle, mapRotation }) => {
  let content = null;
  let cellStyle = "w-full h-full border border-green-600/50 flex items-center justify-center bg-green-400/30 hover:bg-green-500/40 transition-colors";
  let ariaLabel = "Empty path";

  const getExplorerRotationClass = (currentMapRotation: Rotation): string => {
    switch (currentMapRotation) {
      case 0: return 'rotate-0';
      case 90: return '-rotate-90'; // Counter-rotate
      case 180: return '-rotate-180'; // Counter-rotate
      case 270: return 'rotate-90'; // Counter-rotate (-270 is +90)
      default: return 'rotate-0';
    }
  };

  if (isObstacle) {
    content = <span className="text-3xl" aria-hidden="true">{OBSTACLE_ICON}</span>;
    cellStyle = "w-full h-full border border-gray-600/50 flex items-center justify-center bg-gray-400/40";
    ariaLabel = "Obstacle (tree)";
  } else if (isExplorer) {
    const explorerRotationClass = getExplorerRotationClass(mapRotation);
    content = (
      <span 
        className={`text-3xl transform transition-transform duration-300 hover:scale-125 inline-block ${explorerRotationClass}`}
        aria-hidden="true"
      >
        {EXPLORER_ICON}
      </span>
    );
    ariaLabel = "Explorer current position";
  } else if (isTreasure) {
    content = <span className="text-3xl transform transition-transform duration-300 hover:scale-125" aria-hidden="true">{TREASURE_ICON}</span>;
    ariaLabel = "Treasure location";
  }

  return (
    <div 
        className={cellStyle}
        role="gridcell"
        aria-label={ariaLabel}
    >
      {content}
    </div>
  );
};
