import React from 'react';
import type { Direction } from '../types';

interface ArrowPaletteProps {
  disabled: boolean;
  isHintActive?: boolean;
  onArrowDragStart?: () => void;
}

interface BlockArrowProps {
  direction: Direction;
  label: string;
  color: string;
  clipPath: string;
  disabled: boolean;
  isHintActive: boolean;
  onCustomDragStart: () => void;
}

const BlockArrow: React.FC<BlockArrowProps> = ({
  direction,
  label,
  color,
  clipPath,
  disabled,
  isHintActive,
  onCustomDragStart,
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onCustomDragStart();
    e.dataTransfer.setData('application/direction', direction);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable={!disabled}
      onDragStart={handleDragStart}
      className={`relative w-full h-full transition-transform duration-150
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-100 active:cursor-grabbing cursor-grab'}
                ${isHintActive ? 'arrow-pulse' : ''}`}
      title={`Drag to place ${label} arrow`}
    >
      <div
        className={`absolute inset-0 ${color}`}
        style={{ clipPath: clipPath }}
      />
    </div>
  );
};


const ArrowPalette: React.FC<ArrowPaletteProps> = ({ disabled, isHintActive = false, onArrowDragStart = () => {} }) => {
    const arrowShapes = {
      N: 'polygon(50% 0%, 100% 25%, 75% 25%, 75% 100%, 25% 100%, 25% 25%, 0% 25%)',
      S: 'polygon(25% 0%, 75% 0%, 75% 75%, 100% 75%, 50% 100%, 0% 75%, 25% 75%)',
      E: 'polygon(0% 25%, 75% 25%, 75% 0%, 100% 50%, 75% 100%, 75% 75%, 0% 75%)',
      W: 'polygon(100% 25%, 25% 25%, 25% 0%, 0% 50%, 25% 100%, 25% 75%, 100% 75%)',
    };

    return (
        <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
            <div className="flex justify-around items-center gap-4 h-32">
                <div className="w-8 h-24">
                    <BlockArrow direction="N" label="north" color="bg-blue-500" clipPath={arrowShapes.N} disabled={disabled} isHintActive={isHintActive} onCustomDragStart={onArrowDragStart} />
                </div>
                <div className="w-8 h-24">
                    <BlockArrow direction="S" label="south" color="bg-blue-500" clipPath={arrowShapes.S} disabled={disabled} isHintActive={isHintActive} onCustomDragStart={onArrowDragStart} />
                </div>
                <div className="w-24 h-8">
                    <BlockArrow direction="W" label="west" color="bg-blue-500" clipPath={arrowShapes.W} disabled={disabled} isHintActive={isHintActive} onCustomDragStart={onArrowDragStart} />
                </div>
                <div className="w-24 h-8">
                    <BlockArrow direction="E" label="east" color="bg-blue-500" clipPath={arrowShapes.E} disabled={disabled} isHintActive={isHintActive} onCustomDragStart={onArrowDragStart} />
                </div>
            </div>
        </div>
    );
};

export default ArrowPalette;
