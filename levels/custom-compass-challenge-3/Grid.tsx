import React from 'react';
import { Position, Rotation } from './types';
import { GridCell } from './GridCell';

interface GridProps {
  gridSize: number;
  explorerPosition: Position;
  treasurePosition: Position;
  mapRotation: Rotation;
  obstaclePositions: Position[];
}

export const Grid: React.FC<GridProps> = ({ gridSize, explorerPosition, treasurePosition, mapRotation, obstaclePositions }) => {
  const cells = [];
  for (let y = 1; y <= gridSize; y++) {
    for (let x = 1; x <= gridSize; x++) {
      const isExplorer = explorerPosition.x === x && explorerPosition.y === y;
      const isTreasure = treasurePosition.x === x && treasurePosition.y === y;
      const isObstacle = obstaclePositions.some(op => op.x === x && op.y === y);
      
      cells.push(
        <GridCell
          key={`${x}-${y}`}
          isExplorer={isExplorer}
          isTreasure={isTreasure}
          isObstacle={isObstacle}
          mapRotation={mapRotation} // Pass mapRotation here
        />
      );
    }
  }

  const rotationClass = (): string => {
    switch (mapRotation) {
      case 0: return 'rotate-0';
      case 90: return 'rotate-90';
      case 180: return 'rotate-180';
      case 270: return 'rotate-[270deg]';
      default: return 'rotate-0';
    }
  };

  return (
    <div
      className={`grid bg-green-300/50 border-4 border-green-700 shadow-lg transition-transform duration-500 ease-in-out ${rotationClass()}`}
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        width: '300px',
        height: '300px',
      }}
      aria-label="Game Grid"
      role="grid"
    >
      {cells}
    </div>
  );
};
