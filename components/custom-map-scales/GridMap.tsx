import React, { useRef } from 'react';
import { useDrop } from 'react-dnd';
import type { Landmark, DraggableItem, PlacedBlock, BlockOrientation, LevelSolution } from '../../levels/custom-map-scales/mapScalesTypes';
import ScaleBar from './ScaleBar';
import CompassRose from './CompassRose';

interface GridMapProps {
  rows: number;
  cols: number;
  landmarks: Landmark[];
  scale: number;
  solution: LevelSolution;
  placedBlocks: PlacedBlock[];
  isCompleted: boolean;
  scaleHintActive: boolean;
  onAddBlock: (blockData: Omit<PlacedBlock, 'id' | 'type'>) => void;
  onInvalidDrop: (reason: 'scale' | 'location', position: { x: number, y: number } | null) => void;
  checkPlacement: (size: number, orientation: BlockOrientation, row: number, col: number) => boolean;
}

const GridMap: React.FC<GridMapProps> = ({
  rows,
  cols,
  landmarks,
  scale,
  solution,
  placedBlocks,
  isCompleted,
  scaleHintActive,
  onAddBlock,
  onInvalidDrop,
  checkPlacement,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: 'BLOCK',
      drop: (item: DraggableItem, monitor) => {
        const gridEl = gridRef.current;
        const offset = monitor.getClientOffset();
        if (!gridEl || !offset) {
          onInvalidDrop('location', offset);
          return;
        };
        
        if (item.size !== scale) {
          onInvalidDrop('scale', offset);
          return;
        }

        // FIX: Moved the declaration of `gridRect` before its usage to fix a 'used before its declaration' error.
        const gridRect = gridEl.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(gridEl);
        const borderLeftWidth = parseFloat(computedStyle.borderLeftWidth);
        const borderTopWidth = parseFloat(computedStyle.borderTopWidth);
        const contentWidth = gridRect.width - borderLeftWidth - parseFloat(computedStyle.borderRightWidth);
        const contentHeight = gridRect.height - borderTopWidth - parseFloat(computedStyle.borderBottomWidth);

        const x = offset.x - gridRect.left - borderLeftWidth;
        const y = offset.y - gridRect.top - borderTopWidth;

        const cellWidth = contentWidth / cols;
        const cellHeight = contentHeight / rows;

        let snappedRow: number, snappedCol: number;

        if (item.orientation === 'horizontal') {
            const snapToleranceY = cellHeight * 0.3;
            const rowIndex = y / cellHeight;
            const closestLineIndex = Math.round(rowIndex);
            
            if (Math.abs(y - (closestLineIndex * cellHeight)) > snapToleranceY) {
                onInvalidDrop('location', offset);
                return;
            }

            snappedRow = rows - closestLineIndex + 1;
            snappedCol = Math.floor(x / cellWidth) + 1;

        } else { // vertical
            const snapToleranceX = cellWidth * 0.3;
            const colIndex = x / cellWidth;
            const closestLineIndex = Math.round(colIndex);

            if (Math.abs(x - (closestLineIndex * cellWidth)) > snapToleranceX) {
                onInvalidDrop('location', offset);
                return;
            }
            
            snappedCol = closestLineIndex;
            snappedRow = rows - Math.floor(y / cellHeight);
        }
        
        if (snappedCol < 1 || snappedCol > cols + 1 || snappedRow < 1 || snappedRow > rows + 1) {
            onInvalidDrop('location', offset);
            return;
        }

        const isCorrect = checkPlacement(item.size, item.orientation, snappedRow, snappedCol);

        if (!isCorrect) {
            onInvalidDrop('location', offset);
            return;
        }

        onAddBlock({
            position: { row: snappedRow, col: snappedCol },
            orientation: item.orientation,
            isCorrect: true, // Only correct blocks are added now
            size: item.size,
        });
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [onAddBlock, onInvalidDrop, checkPlacement, rows, cols, scale]
  );

  drop(gridRef);

  const colLabels = Array.from({ length: cols + 1 }, (_, i) => String.fromCharCode(65 + i));
  const rowLabels = Array.from({ length: rows + 1 }, (_, i) => rows + 1 - i);

  const headerGridStyle = { display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };
  const mainGridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    border: '2px solid #94a3b8',
    position: 'relative' as const,
    backgroundColor: isOver ? 'rgba(187, 247, 208, 0.3)' : 'transparent',
    transition: 'background-color 150ms ease-in-out',
  };

  const cellWidthPercent = 100 / cols;
  const cellHeightPercent = 100 / rows;
  const blockThicknessPx = 24;

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
            <div ref={gridRef} style={mainGridStyle}>
                {Array.from({ length: rows * cols }).map((_, i) => (
                    <div key={i} className="border border-slate-300"></div>
                ))}
                {landmarks.map((landmark) => (
                    <div
                        key={landmark.id}
                        className={`absolute flex items-center justify-center text-4xl ${landmark.color}`}
                        style={{
                            left: `calc(${(landmark.position.col - 0.5) / cols} * 100%)`,
                            top: `calc(${(rows - landmark.position.row + 0.5) / rows} * 100%)`,
                            transform: 'translate(-50%, -50%)',
                        }}
                        title={landmark.label}
                    >
                        {landmark.symbol}
                    </div>
                ))}
                {placedBlocks.map((block) => {
                    const bgColor = block.isCorrect ? 'bg-green-500/80' : 'bg-slate-500/80';
                    const borderColor = block.isCorrect ? 'border-green-700' : 'border-slate-600';
                    const baseClasses = "absolute flex items-center justify-center font-bold text-white rounded-md border-2 shadow-md";

                    if (block.orientation === 'horizontal') {
                        return (
                            <div key={block.id} className={`${baseClasses} ${bgColor} ${borderColor}`}
                                style={{
                                    top: `calc(${(rows - block.position.row + 1) * cellHeightPercent}%)`,
                                    left: `calc(${(block.position.col - 1) * cellWidthPercent}%)`,
                                    width: `${cellWidthPercent}%`,
                                    height: `${blockThicknessPx}px`,
                                    transform: 'translateY(-50%)',
                                    fontSize: 'clamp(0.5rem, 2.5vw, 0.875rem)',
                                }}
                            ><span>{block.size} m</span></div>
                        );
                    } else { // vertical
                        return (
                            <div key={block.id} className={`${baseClasses} ${bgColor} ${borderColor}`}
                                style={{
                                    top: `calc(${(rows - block.position.row) * cellHeightPercent}%)`,
                                    left: `calc(${block.position.col * cellWidthPercent}%)`,
                                    width: `${blockThicknessPx}px`,
                                    height: `${cellHeightPercent}%`,
                                    transform: 'translateX(-50%)',
                                    fontSize: 'clamp(0.5rem, 2.5vw, 0.875rem)',
                                }}
                            ><span className="transform -rotate-90 whitespace-nowrap">{block.size} m</span></div>
                        );
                    }
                })}
                {isCompleted && (() => {
                    const commonStyle = {
                        position: 'absolute' as const,
                        background: 'rgb(34 197 94)',
                        borderRadius: '0.375rem',
                        border: '2px solid rgb(21 128 61)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        fontSize: 'clamp(0.5rem, 2.5vw, 0.875rem)',
                    };
                    if (solution.orientation === 'horizontal') {
                        return (
                            <div style={{
                                ...commonStyle,
                                left: `calc(${(solution.start - 0.5) / cols} * 100%)`,
                                top: `calc(${(rows - solution.line + 0.5) / rows} * 100%)`,
                                width: `calc(${solution.distance * cellWidthPercent}%)`,
                                height: `${blockThicknessPx}px`,
                                transform: 'translateY(-50%)',
                            }}><span>{solution.distance * scale} m</span></div>
                        );
                    } else { // vertical
                         return (
                            <div style={{
                                ...commonStyle,
                                left: `calc(${(solution.line - 0.5) / cols} * 100%)`,
                                top: `calc(${(rows - solution.end + 0.5) / rows} * 100%)`,
                                width: `${blockThicknessPx}px`,
                                height: `calc(${solution.distance * cellHeightPercent}%)`,
                                transform: 'translateX(-50%)',
                            }}><span className="transform -rotate-90 whitespace-nowrap">{solution.distance * scale} m</span></div>
                        );
                    }
                })()}
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
