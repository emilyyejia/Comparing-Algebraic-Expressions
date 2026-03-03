
import React from 'react';
import { Direction } from '../../levels/custom-frog-game/frogGameTypes';
import ControlButton from './ControlButton';

interface ControlsProps {
  onDirectionClick: (direction: Direction) => void;
  isGameOver: boolean;
  shuffledDirections: Direction[];
}

const getDirectionLabel = (direction: Direction): string => {
  switch (direction) {
    case Direction.NORTH: return 'North';
    case Direction.SOUTH: return 'South';
    case Direction.EAST: return 'East';
    case Direction.WEST: return 'West';
    default: return '';
  }
};

const Controls: React.FC<ControlsProps> = ({ onDirectionClick, isGameOver, shuffledDirections }) => {
  return (
    <div className="mt-8 flex flex-row items-center space-x-2" aria-label="Game controls">
      {shuffledDirections.map((direction) => {
        const label = getDirectionLabel(direction);
        return (
          <ControlButton
            key={direction}
            label={label}
            direction={direction}
            onClick={onDirectionClick}
            ariaLabel={`Move ${label}`}
            disabled={isGameOver}
          />
        );
      })}
    </div>
  );
};

export default Controls;
