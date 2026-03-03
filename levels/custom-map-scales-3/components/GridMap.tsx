import React from 'react';
import type { Landmark, PlacedArrow, Direction } from '../types';
import ScaleBar from './ScaleBar';
import CompassRose from './CompassRose';

interface GridMapProps {
  rows: number;
  cols: number;
  landmarks: Landmark[];
  scale: number;
  scaleHintActive?: boolean;
  placedArrows: PlacedArrow[];
  onArrowDrop: (direction: Direction, fromPos: { col: number, row: number }) => void;
  currentTaskIndex: number;
}

const arrowShapes = {
  N: 'polygon(50% 0%, 100% 25%, 75% 25%, 75% 100%, 25% 100%, 25% 25%, 0% 25%)',
  S: 'polygon(25% 0%, 75% 0%, 75% 75%, 100% 75%, 50% 100%, 0% 75%, 25% 75%)',
  E: 'polygon(0% 25%, 75% 25%, 75% 0%, 100% 50%, 75% 100%, 75% 75%, 0% 75%)',
  W: 'polygon(100% 25%, 25% 25%, 25% 0%, 0% 50%, 25% 100%, 25% 75%, 100% 75%)',
};

const PlacedBlockArrow: React.FC<{
  arrow: PlacedArrow;
  rows: number;
  cols: number;
  currentTaskIndex: number;
}> = ({ arrow, rows, cols, currentTaskIndex }) => {
  const isVertical = arrow.direction === 'N' || arrow.direction === 'S';
  const widthPx = isVertical ? 32 : 96;
  const heightPx = isVertical ? 96 : 32;

  // Calculate the center of the grid line segment the arrow represents
  let centerXpct: number;
  let centerYpct: number;

  switch (arrow.direction) {
    case 'N':
      centerXpct = (arrow.from.col / cols) * 100;
      centerYpct = ((rows - (arrow.from.row + 0.5)) / rows) * 100;
      break;
    case 'S':
      centerXpct = (arrow.from.col / cols) * 100;
      centerYpct = ((rows - (arrow.from.row - 0.5)) / rows) * 100;
      break;
    case 'E':
      centerXpct = ((arrow.from.col + 0.5) / cols) * 100;
      centerYpct = ((rows - arrow.from.row) / rows) * 100;
      break;
    case 'W':
      centerXpct = ((arrow.from.col - 0.5) / cols) * 100;
      centerYpct = ((rows - arrow.from.row) / rows) * 100;
      break;
  }
  
  const isFromPastTrip = arrow.tripIndex < currentTaskIndex;
  const isIncorrect = arrow.status === 'incorrect';

  const style: React.CSSProperties = {
    position: 'absolute',
    width: `${widthPx}px`,
    height: `${heightPx}px`,
    left: `${centerXpct}%`,
    top: `${centerYpct}%`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    transition: 'opacity 300ms ease-in-out',
    opacity: isFromPastTrip ? 0.4 : 1,
  };

  const flashClass = isIncorrect ? 'arrow-incorrect-flash' : '';
  const arrowColorClass = isIncorrect ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div 
        style={style} 
        className={`relative ${flashClass}`}
        aria-label={`Arrow from ${JSON.stringify(arrow.from)} direction ${arrow.direction}`}
    >
      <div
        className={`absolute inset-0 ${arrowColorClass}`}
        style={{ clipPath: arrowShapes[arrow.direction] }}
      />
    </div>
  );
};


const GridMap: React.FC<GridMapProps> = ({
  rows,
  cols,
  landmarks,
  scale,
  scaleHintActive = false,
  placedArrows,
  onArrowDrop,
  currentTaskIndex,
}) => {

  const colLabels = Array.from({ length: cols + 1 }, (_, i) => String.fromCharCode(65 + i));
  const rowLabels = Array.from({ length: rows + 1 }, (_, i) => rows + 1 - i);

  const headerGridStyle = { display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };
  const mainGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    border: '2px solid #94a3b8',
    position: 'relative',
    backgroundColor: '#f8fafc', // A light background for the grid
    transition: 'background-color 150ms ease-in-out',
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const direction = e.dataTransfer.getData('application/direction') as Direction;
    if (!['N', 'S', 'E', 'W'].includes(direction)) return;

    const gridRect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const cellWidth = gridRect.width / cols;
    const cellHeight = gridRect.height / rows;

    // Get coordinates relative to the grid, allowing them to be outside the bounds.
    const x = e.clientX - gridRect.left;
    const y = e.clientY - gridRect.top;
    
    let fromPos: { col: number; row: number; };

    if (direction === 'N' || direction === 'S') {
        // For vertical arrows, we snap to the nearest vertical grid line (column).
        const col = Math.round(x / cellWidth);
        // And find the cell row the cursor is in.
        const visRow = Math.floor(y / cellHeight);

        // Clamp values to be within the grid, making the drop forgiving.
        const clampedCol = Math.max(0, Math.min(cols, col));
        const clampedVisRow = Math.max(0, Math.min(rows - 1, visRow));
        
        if (direction === 'N') {
            // 'N' arrows start at the bottom line of a grid cell.
            // A cell at visual row 'r' (from top, 0-indexed) has a bottom line at model row 'rows - 1 - r'.
            fromPos = { col: clampedCol, row: rows - 1 - clampedVisRow };
        } else { // 'S'
            // 'S' arrows start at the top line of a grid cell.
            // A cell at visual row 'r' has a top line at model row 'rows - r'.
            fromPos = { col: clampedCol, row: rows - clampedVisRow };
        }
    } else { // 'E' or 'W'
        // For horizontal arrows, we snap to the nearest horizontal grid line (row).
        const row = Math.round(y / cellHeight);
        // And find the cell column the cursor is in.
        const visCol = Math.floor(x / cellWidth);

        // Clamp values to be within the grid.
        const clampedRow = Math.max(0, Math.min(rows, row));
        const clampedVisCol = Math.max(0, Math.min(cols - 1, visCol));
        
        const modelRow = rows - clampedRow;

        if (direction === 'E') {
            // 'E' arrows start at the left line of a grid cell.
            // A cell at visual col 'c' has a left line at model col 'c'.
            fromPos = { col: clampedVisCol, row: modelRow };
        } else { // 'W'
            // 'W' arrows start at the right line of a grid cell.
            // A cell at visual col 'c' has a right line at model col 'c + 1'.
            fromPos = { col: clampedVisCol + 1, row: modelRow };
        }
    }

    // By clamping the values, we ensure fromPos is always valid, so we can drop.
    onArrowDrop(direction, fromPos);
  };


  return (
    <div className="w-full">
        <div className="grid grid-cols-[auto_1fr] w-full mb-1">
            <div className="w-10"></div>
            <div style={headerGridStyle} className="items-end">
                <div className="col-span-1">
                    <ScaleBar scale={scale} isHintActive={scaleHintActive} />
                </div>
                <div className="flex justify-end" style={{ gridColumnStart: cols }}>
                    <CompassRose />
                </div>
            </div>
        </div>
        <div className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto] w-full" style={{ aspectRatio: `${cols}/${rows}` }}>
            <div className="relative w-10">
                {rowLabels.map((label, i) => (
                    <div
                        key={label}
                        className="absolute font-bold text-slate-600 text-lg"
                        style={{
                            top: `${(i / rows) * 100}%`,
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>
            <div style={mainGridStyle} onDragOver={handleDragOver} onDrop={handleDrop}>
                {Array.from({ length: rows * cols }).map((_, i) => (
                    <div key={i} className="border border-slate-300"></div>
                ))}
                {placedArrows.map((arrow) => (
                  <PlacedBlockArrow key={arrow.id} arrow={arrow} rows={rows} cols={cols} currentTaskIndex={currentTaskIndex} />
                ))}
                {landmarks.map((landmark) => (
                    <div
                        key={landmark.id}
                        className={`absolute flex items-center justify-center text-4xl ${landmark.color}`}
                        style={{
                            left: `calc(${landmark.position.col / cols} * 100%)`,
                            top: `calc(${(rows - landmark.position.row) / rows} * 100%)`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1,
                        }}
                        title={landmark.label}
                    >
                        {landmark.symbol}
                    </div>
                ))}
            </div>
             <div className="col-start-2 relative h-10">
                {colLabels.map((label, i) => (
                    <div
                        key={label}
                        className="absolute font-bold text-slate-600 text-lg"
                        style={{
                            left: `${(i / cols) * 100}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {label}
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default GridMap;
