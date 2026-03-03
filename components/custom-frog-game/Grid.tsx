
import React from 'react';
import { Position, CharacterType } from '../../levels/custom-frog-game/frogGameTypes';
import { GRID_SIZE } from '../../levels/custom-frog-game/frogGameConstants';
import Cell from './Cell';

interface GridProps {
  frogPosition: Position;
  wormPosition: Position;
  lilyPads: Position[];
  dynamicFlyPosition: Position | null; // Dynamic fly
}

const Grid: React.FC<GridProps> = ({ frogPosition, wormPosition, lilyPads, dynamicFlyPosition }) => {
  const cells = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      let charType = CharacterType.NONE;
      if (r === frogPosition.row && c === frogPosition.col) {
        charType = CharacterType.FROG;
      } else if (r === wormPosition.row && c === wormPosition.col) {
        charType = CharacterType.WORM;
      }
      
      const isLilyPad = lilyPads.some(pad => pad.row === r && pad.col === c);
      const isDynamicFly = dynamicFlyPosition !== null && dynamicFlyPosition.row === r && dynamicFlyPosition.col === c;
      
      cells.push(
        <Cell 
          key={`${r}-${c}`} 
          characterType={charType} 
          isLilyPad={isLilyPad}
          isDynamicFly={isDynamicFly} 
        />
      );
    }
  }

  return (
    <div
      className={`grid grid-cols-6 gap-0.5 bg-blue-700 p-1 rounded-md shadow-xl border-2 border-blue-800`}
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
    >
      {cells}
    </div>
  );
};

export default Grid;
