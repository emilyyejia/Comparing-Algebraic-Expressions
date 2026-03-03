import React from 'react';
import type { Landmark, MysteryPoint, Player } from '../../levels/custom-grid-nav/gridNavTypes';
import ScaleBar from './ScaleBar';
import CompassRose from './CompassRose';

interface GridMapProps {
  rows: number;
  cols: number;
  landmarks: Landmark[];
  scale: number;
  mysteryPoints: MysteryPoint[];
  player: Player;
  selectedMysteryPointId: string | null;
  onMysteryPointClick: (id: string) => void;
  revealedMysteryPoints: Set<string>;
  revealingPointId: string | null;
  leonAnimationState: 'idle' | 'falling';
  isSnappingBack: boolean;
  showExclamation: boolean;
  showIdleHint?: boolean;
}

const GridMap: React.FC<GridMapProps> = ({
  rows,
  cols,
  landmarks,
  scale,
  mysteryPoints,
  player,
  selectedMysteryPointId,
  onMysteryPointClick,
  revealedMysteryPoints,
  revealingPointId,
  leonAnimationState,
  isSnappingBack,
  showExclamation,
  showIdleHint = false,
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
  
  // Dynamic styles for Leon's animation
  const leonTransform = `translate(-50%, -50%) ${leonAnimationState === 'falling' ? 'rotate(90deg) translateY(0.75rem)' : ''}`;
  const leonTransition = isSnappingBack 
    ? 'none' 
    : leonAnimationState === 'falling' 
      ? 'transform 0.5s cubic-bezier(0.6, -0.28, 0.735, 0.045)' // EaseInBack for fall effect
      : 'all 1s ease-in-out';

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
                {/* Render Leon (the player) */}
                <div
                    key={player.id}
                    className="absolute flex items-center justify-center text-5xl"
                    style={{
                        left: `calc(${(player.position.col - 0.5) / cols} * 100%)`,
                        top: `calc(${(rows - player.position.row + 0.5) / rows} * 100%)`,
                        transform: leonTransform,
                        transition: leonTransition,
                        zIndex: 5,
                    }}
                    title={player.label}
                >
                    {player.symbol}
                </div>
                {/* Render Exclamation Mark */}
                {showExclamation && (
                  <div
                    className="absolute flex items-center justify-center text-6xl text-red-600 font-bold drop-shadow-lg"
                    style={{
                        left: `calc(${(player.position.col - 0.5) / cols} * 100%)`,
                        top: `calc(${(rows - player.position.row + 0.5) / rows} * 100%)`,
                        transform: 'translate(-50%, -180%)',
                        transition: 'opacity 0.2s ease-in-out',
                        zIndex: 6,
                    }}
                    aria-hidden="true"
                  >
                    !
                  </div>
                )}
                {/* Render idle hint bubble */}
                {showIdleHint && (
                    <div
                        className="absolute z-10"
                        style={{
                            left: `calc(${(player.position.col - 0.5) / cols} * 100%)`,
                            top: `calc(${(rows - player.position.row + 0.5) / rows} * 100%)`,
                            transform: 'translate(-50%, calc(-100% - 30px))',
                            pointerEvents: 'none',
                        }}
                    >
                        <div
                            className="bg-white text-slate-800 p-2 rounded-lg shadow-xl font-semibold text-sm animate-fade-in-up relative"
                            style={{ whiteSpace: 'nowrap' }}
                            role="alert"
                        >
                            Which mystery point is next? You choose!
                            {/* Speech bubble arrow */}
                            <div
                                className="absolute left-1/2 w-3 h-3 bg-white transform -translate-x-1/2 rotate-45"
                                style={{ bottom: '-6px' }}
                            ></div>
                        </div>
                    </div>
                )}
                {/* Render mystery points */}
                {mysteryPoints.map((point) => {
                    const isRevealed = revealedMysteryPoints.has(point.id);
                    const isSelected = point.id === selectedMysteryPointId;
                    const isPulsating = selectedMysteryPointId === null && !isRevealed;
                    const canInteract = !isRevealed && !revealingPointId && !selectedMysteryPointId;
                    
                    return (
                        <div
                            key={point.id}
                            className={`absolute flip-container ${canInteract ? 'cursor-pointer' : 'cursor-default'}`}
                            style={{
                                width: '2.25rem', // w-9
                                height: '2.25rem', // h-9
                                left: `calc(${(point.position.col - 0.5) / cols} * 100%)`,
                                top: `calc(${(rows - point.position.row + 0.5) / rows} * 100%)`,
                                transform: 'translate(-50%, -50%)',
                                zIndex: 10,
                            }}
                            title={isRevealed ? point.revealedLabel : "Mystery Point"}
                            role={canInteract ? "button" : undefined}
                            tabIndex={canInteract ? 0 : -1}
                            aria-label={isRevealed ? point.revealedLabel : `Mystery Point ${isSelected ? '(Selected)' : ''}`}
                            onClick={canInteract ? () => onMysteryPointClick(point.id) : undefined}
                            onKeyDown={canInteract ? (e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onMysteryPointClick(point.id);
                                }
                            } : undefined}
                        >
                            <div className={`flipper w-full h-full ${isRevealed ? 'is-flipped' : ''}`}>
                                {/* Front Face */}
                                <div className={`
                                    front-face text-white
                                    ${isSelected ? 'bg-green-500' : 'bg-slate-500'}
                                    ${isPulsating ? 'animate-pulse' : ''}
                                `}>
                                    ?
                                </div>
                                {/* Back Face */}
                                <div className="back-face" aria-hidden="true">
                                    {point.revealedSymbol}
                                </div>
                            </div>
                        </div>
                    );
                })}
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