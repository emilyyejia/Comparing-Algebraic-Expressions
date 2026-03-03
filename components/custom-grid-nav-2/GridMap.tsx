import React from 'react';
import type { Landmark, Player } from '../../levels/custom-grid-nav-2/types';
import ScaleBar from './ScaleBar';
import CompassRose from './CompassRose';

interface GridMapProps {
  rows: number;
  cols: number;
  landmarks: Landmark[];
  scale: number;
  player: Player;
  showInstruction?: boolean;
  instructionText?: string;
  targetPosition?: { row: number; col: number } | null;
  relativeLandmark?: Landmark;
  isPulsing?: boolean;
  onDotClick?: (position: { row: number, col: number }) => void;
}

const GridMap: React.FC<GridMapProps> = ({
  rows,
  cols,
  landmarks,
  scale,
  player,
  showInstruction = false,
  instructionText = '',
  targetPosition = null,
  relativeLandmark,
  isPulsing = false,
  onDotClick,
}) => {
  const colLabels = Array.from({ length: cols + 1 }, (_, i) => String.fromCharCode(65 + i));
  const rowLabels = Array.from({ length: rows + 1 }, (_, i) => rows + 1 - i);

  const headerGridStyle = { display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` };
  const mainGridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    border: '2px solid #94a3b8',
    position: 'relative' as const,
    backgroundColor: 'transparent',
    transition: 'background-color 150ms ease-in-out',
  };

  const intersectionPoints = [];
  // Create points for all intersections where grid lines cross, including edges.
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      // Intersections are at half-integer coordinates in our 1-based system.
      intersectionPoints.push({ row: r + 0.5, col: c + 0.5 });
    }
  }

  // Logic to dynamically position the instruction bubble to avoid covering a referenced landmark or the target dot.
  const getBubbleStyles = () => {
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      left: `calc(${(player.position.col - 0.5) / cols} * 100%)`,
      transform: 'translateX(-50%)',
      zIndex: 10,
      pointerEvents: 'none', // Prevent container from blocking clicks
    };

    const arrowStyle: React.CSSProperties = {};
    
    let placeBubbleAbove = true;

    if (relativeLandmark) {
      // If the instruction is relative to a landmark, make sure we don't cover it.
      // If the landmark is north of the player (higher row value), place the bubble below the player.
      if (relativeLandmark.position.row > player.position.row) {
        placeBubbleAbove = false;
      }
      // Otherwise, the default `true` is to place it above, which is correct if the landmark
      // is south of or on the same row as the player.
    } else if (targetPosition && player.position.row < targetPosition.row) {
      // Fallback for other instructions: avoid covering the target dot.
      // If target is north of player (higher row value), place bubble below player.
      placeBubbleAbove = false;
    }

    if (placeBubbleAbove) {
      // Position bubble above the player
      containerStyle.bottom = `calc(${((player.position.row - 0.5) / rows) * 100}% + 40px)`;
      arrowStyle.bottom = '-8px';
    } else {
      // Position bubble below the player
      containerStyle.top = `calc(${((rows - player.position.row + 0.5) / rows) * 100}% + 40px)`;
      arrowStyle.top = '-8px';
    }

    return { containerStyle, arrowStyle };
  };

  const { containerStyle: bubbleContainerStyle, arrowStyle: bubbleArrowStyle } = getBubbleStyles();

  return (
    <div className="w-full">
        <div className="grid grid-cols-[auto_1fr] w-full mb-1">
            <div className="w-10"></div>
            <div style={headerGridStyle} className="items-end">
                <div className="col-span-1">
                    <ScaleBar scale={scale} />
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
            <div style={mainGridStyle}>
                {Array.from({ length: rows * cols }).map((_, i) => (
                    <div key={i} className="border border-slate-300"></div>
                ))}
                
                {/* Render intersection dots */}
                {intersectionPoints.map((point) => {
                  const isTargetAndPulsing = isPulsing && targetPosition && point.row === targetPosition.row && point.col === targetPosition.col;
                  const isClickable = showInstruction;

                  const dotClasses = [
                      'absolute',
                      'rounded-full',
                      'transition-all', 'duration-300',
                      'bg-slate-400',
                      'w-4 h-4', // Always have a base size
                      isClickable ? 'cursor-pointer' : 'cursor-default',
                      isTargetAndPulsing ? 'animate-pulse-dot' : '',
                  ].filter(Boolean).join(' ');
                  
                  return (
                    <div
                        key={`dot-${point.row}-${point.col}`}
                        className={dotClasses}
                        style={{
                            left: `calc(${(point.col - 0.5) / cols} * 100%)`,
                            top: `calc(${(rows - point.row + 0.5) / rows} * 100%)`,
                            transform: 'translate(-50%, -50%)',
                            zIndex: isTargetAndPulsing ? 4 : 2,
                        }}
                        onClick={isClickable ? () => onDotClick?.(point) : undefined}
                        role={isClickable ? 'button' : undefined}
                        aria-label={isTargetAndPulsing ? "Target destination" : `Intersection point`}
                    />
                  );
                })}

                {landmarks.map((landmark) => {
                    const isTargetUnderLandmark = targetPosition &&
                                                  landmark.position.row === targetPosition.row &&
                                                  landmark.position.col === targetPosition.col;
                    
                    const isLandmarkClickable = showInstruction;

                    const landmarkClasses = [
                        'absolute', 'flex', 'items-center', 'justify-center', 'text-4xl',
                        landmark.color,
                        'transition-transform', 'duration-200',
                        isLandmarkClickable ? 'cursor-pointer hover:scale-110' : '',
                    ].filter(Boolean).join(' ');

                    return (
                        <div
                            key={landmark.id}
                            className={landmarkClasses}
                            style={{
                                left: `calc(${(landmark.position.col - 0.5) / cols} * 100%)`,
                                top: `calc(${(rows - landmark.position.row + 0.5) / rows} * 100%)`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 3,
                            }}
                            title={landmark.label}
                            onClick={isLandmarkClickable ? () => onDotClick?.(landmark.position) : undefined}
                            role={isLandmarkClickable ? 'button' : undefined}
                            aria-label={isLandmarkClickable ? `Go to ${landmark.label}` : landmark.label}
                        >
                            {landmark.symbol}
                        </div>
                    );
                })}
                {/* Render the player */}
                <div
                    key={player.id}
                    className="absolute flex items-center justify-center text-5xl transition-all duration-1000 ease-in-out"
                    style={{
                        left: `calc(${(player.position.col - 0.5) / cols} * 100%)`,
                        top: `calc(${(rows - player.position.row + 0.5) / rows} * 100%)`,
                        transform: 'translate(-50%, -50%)',
                        zIndex: 5,
                    }}
                    title={player.label}
                >
                    {player.symbol}
                </div>

                {/* Render instruction bubble */}
                {showInstruction && instructionText && (
                  <div style={bubbleContainerStyle} role="alert">
                    <div
                      className="bg-slate-800 text-white p-3 rounded-lg shadow-xl font-bold text-md animate-fade-in-up relative"
                      style={{ whiteSpace: 'nowrap', pointerEvents: 'auto' }}
                    >
                      {instructionText}
                      {/* Speech bubble arrow */}
                      <div
                        className="absolute left-1/2 w-4 h-4 bg-slate-800 transform -translate-x-1/2 rotate-45"
                        style={bubbleArrowStyle}
                      ></div>
                    </div>
                  </div>
                )}
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
