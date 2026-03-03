
import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import type { DraggableItem, BlockOrientation } from '../../levels/custom-map-scales-2/mapScalesTypes2';

interface DraggableBlockProps {
  size: number;
  orientation: BlockOrientation;
  scale: number; // current level's scale in meters per grid unit
  baseUnitSize: number; // DYNAMIC size in px for one grid unit, calculated from actual grid size
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({ size, orientation, scale, baseUnitSize }) => {
  const item: DraggableItem = { id: `${orientation[0]}-${size}`, size, orientation };
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BLOCK',
    item,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const ref = useRef<HTMLDivElement>(null);
  drag(ref);

  // The length of the block in grid units is its size in meters divided by the map's scale.
  const lengthInGridUnits = size / scale;
  
  // The visual length in the palette is that ratio multiplied by the actual size of a grid unit on screen.
  // If baseUnitSize is 0 (can happen on first render), avoid negative size
  const displayLength = lengthInGridUnits * Math.max(0, baseUnitSize);
  
  // The thickness should be a fixed value, not dependent on the screen size.
  const thickness = 24; // 1.5rem

  const isHorizontal = orientation === 'horizontal';
  const style = {
    width: isHorizontal ? `${displayLength}px` : `${thickness}px`,
    height: isHorizontal ? `${thickness}px` : `${displayLength}px`,
    opacity: isDragging ? 0.5 : 1,
    // Add a min-width/height to prevent blocks from disappearing if calculation is very small
    minWidth: isHorizontal ? '16px' : `${thickness}px`,
    minHeight: isHorizontal ? `${thickness}px` : '16px',
  };
  
  // Hide the text if the block is too small to contain it.
  const canShowText = displayLength >= 35;

  return (
    <div
      ref={ref}
      style={style}
      className="bg-blue-500 text-white rounded-md flex items-center justify-center font-bold cursor-move border-2 border-blue-700 shadow-md transition-all duration-150 ease-in-out"
      role="button"
      aria-label={`Draggable ${size}m ${orientation} block`}
    >
      {canShowText && (
        <span className={`${!isHorizontal ? 'transform -rotate-90 whitespace-nowrap' : ''} text-sm`}>
          {size} m
        </span>
      )}
    </div>
  );
};

export default DraggableBlock;
