import React, { useState, useEffect, useMemo, useRef } from 'react';
import GridMap from '../../components/custom-grid-nav/GridMap';
import Key from '../../components/custom-grid-nav/Key';
import { 
  ALL_LANDMARKS, GRID_ROWS, GRID_COLS
} from './custom-grid-nav/gridNavConstants';
import type { Landmark, LevelData, MysteryPoint, Player } from './custom-grid-nav/gridNavTypes';
import MovementController from '../../components/custom-grid-nav/MovementController';
import Modal from '../../components/custom-grid-nav/Modal';
import StarRating from '../../components/custom-grid-nav/StarRating';
import ProgressBar from '../../components/custom-grid-nav/ProgressBar';
import type { LevelComponentProps } from '../../types';
import InstructionButton from '../../components/InstructionButton';
import InstructionModal from '../../components/InstructionModal';

// Helper function to shuffle array
const shuffle = <T,>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

const generateLevelData = (): LevelData => {
  // 1. Set map scale
  const scale = 50;

  const occupiedCoords = new Set<string>();

  // Helper to reserve the four cells around an intersection point to prevent overlap
  const reserveIntersectionSpace = (position: { row: number; col: number }) => {
    const { col, row } = position;
    occupiedCoords.add(`${Math.floor(col)},${Math.floor(row)}`);
    occupiedCoords.add(`${Math.ceil(col)},${Math.floor(row)}`);
    occupiedCoords.add(`${Math.floor(col)},${Math.ceil(row)}`);
    occupiedCoords.add(`${Math.ceil(col)},${Math.ceil(row)}`);
  };

  // 2. Create a pool of all possible intersection points and shuffle it
  const intersectionPoints: { row: number; col: number }[] = [];
  // We go to GRID_ROWS-1 and COLS-1 because intersections are between cells
  for (let r = 1; r < GRID_ROWS; r++) {
    for (let c = 1; c < GRID_COLS; c++) {
      intersectionPoints.push({ row: r + 0.5, col: c + 0.5 });
    }
  }
  shuffle(intersectionPoints);

  // Function to safely get the next available position from the shuffled pool
  const getNextPosition = (): { row: number; col: number } => {
    if (intersectionPoints.length === 0) {
      // This is a fallback and should not be reached with the current grid/item count
      console.error("Ran out of intersection points for placement.");
      return { row: 1.5, col: 1.5 };
    }
    const position = intersectionPoints.pop()!;
    reserveIntersectionSpace(position);
    return position;
  };

  // --- Assign revealed content to mystery points ---
  const revealedContent = shuffle([
    { symbol: '⛲', label: 'Fountain' },
    { symbol: '🍵', label: 'Tea Shop' },
    { symbol: '🛝', label: 'Playground' },
    { symbol: '🚓', label: 'Police Station' },
    { symbol: '🌉', label: 'Bridge' },
  ]);

  // 3. Place Mystery Points at random intersections
  const mysteryPoints: MysteryPoint[] = revealedContent.map((content, index) => {
    return {
      id: `mystery-point-${index + 1}`,
      position: getNextPosition(),
      revealedSymbol: content.symbol,
      revealedLabel: content.label,
    };
  });

  // 4. Place Leon at a random intersection
  const leon: Player = {
    id: 'leon',
    symbol: '🧍',
    label: 'Leon',
    position: getNextPosition(),
  };

  // 5. Place all 4 landmarks at random intersections
  const selectedLandmarkTemplates = shuffle([...ALL_LANDMARKS]);
  const placedLandmarks: Landmark[] = selectedLandmarkTemplates.map((template) => {
    return { ...template, position: getNextPosition() };
  });

  return {
    level: 1,
    landmarks: placedLandmarks,
    scale,
    mysteryPoints,
    player: leon,
  };
};


const CustomGridNavChallenge: React.FC<LevelComponentProps> = ({ onComplete, onExit, progress, levelId }) => {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(true);
  const [selectedMysteryPointId, setSelectedMysteryPointId] = useState<string | null>(null);
  const [direction, setDirection] = useState('north');
  const [distance, setDistance] = useState(50);
  const [revealedMysteryPoints, setRevealedMysteryPoints] = useState<Set<string>>(new Set());
  const [revealingPointId, setRevealingPointId] = useState<string | null>(null);
  
  // Player movement and animation states
  const [isMoving, setIsMoving] = useState(false);
  const [leonAnimationState, setLeonAnimationState] = useState<'idle' | 'falling'>('idle');
  const [isSnappingBack, setIsSnappingBack] = useState(false);
  const [showExclamation, setShowExclamation] = useState(false);

  // States for arrival, selfie, and completion flow
  const [isArrivalModalOpen, setIsArrivalModalOpen] = useState(false);
  const [showSelfiePlaceholder, setShowSelfiePlaceholder] = useState(false);
  const [isGameCompleteModalOpen, setIsGameCompleteModalOpen] = useState(false);

  // States for the one-time movement hint
  const [isMovementHintModalOpen, setIsMovementHintModalOpen] = useState(false);
  const [hasShownMovementHint, setHasShownMovementHint] = useState(false);

  // New states for fair scoring based on efficiency
  const [legMoveCount, setLegMoveCount] = useState(0);
  const [totalWastedMoves, setTotalWastedMoves] = useState(0);
  const [legStartPos, setLegStartPos] = useState<{ row: number; col: number; } | null>(null);

  const [showIdleHint, setShowIdleHint] = useState(false);
  const idleHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  useEffect(() => {
    setLevelData(generateLevelData());
    
    // Cleanup timer on unmount
    return () => {
        if (idleHintTimerRef.current) {
            clearTimeout(idleHintTimerRef.current);
        }
    };
  }, []);
  
  const revealingPointDetails = useMemo(() => {
    if (!levelData || !revealingPointId) return null;
    return levelData.mysteryPoints.find(p => p.id === revealingPointId);
  }, [levelData, revealingPointId]);

  // Check if Leon has arrived at the selected mystery point
  useEffect(() => {
    if (!levelData || !selectedMysteryPointId || revealingPointId || isMoving) return;

    const { player } = levelData;
    const targetPoint = levelData.mysteryPoints.find(p => p.id === selectedMysteryPointId);

    if (targetPoint && 
        Math.abs(player.position.row - targetPoint.position.row) < 0.01 && 
        Math.abs(player.position.col - targetPoint.position.col) < 0.01) {
        
        // Leon has arrived! Calculate wasted moves for this leg.
        if (legStartPos) {
          const calculateOptimalMoves = (startPos: {row: number, col: number}, endPos: {row: number, col: number}) => {
              const deltaRow = Math.abs(endPos.row - startPos.row);
              const deltaCol = Math.abs(endPos.col - startPos.col);
              let moves = 0;
              if (deltaRow > 0.01) moves++;
              if (deltaCol > 0.01) moves++;
              return moves;
          };
          const optimal = calculateOptimalMoves(legStartPos, targetPoint.position);
          const wasted = Math.max(0, legMoveCount - optimal);
          setTotalWastedMoves(prev => prev + wasted);
        }
        
        setRevealingPointId(selectedMysteryPointId);
        setIsArrivalModalOpen(true);
    }
  }, [levelData, selectedMysteryPointId, revealingPointId, isMoving, legStartPos, legMoveCount]);

  // Calculate final rating based on total wasted moves
  const getFinalRating = () => {
    if (totalWastedMoves <= 1) return 3;
    if (totalWastedMoves <= 3) return 2;
    return 1;
  };
  const finalRating = getFinalRating();

  const handleNextLevelClick = () => {
    onExit?.();
  };

  const handleReplay = () => {
    setLevelData(generateLevelData());
    setIsIntroModalOpen(true);
    setSelectedMysteryPointId(null);
    setRevealedMysteryPoints(new Set());
    setRevealingPointId(null);
    setIsMoving(false);
    setLeonAnimationState('idle');
    setIsSnappingBack(false);
    setShowExclamation(false);
    setIsArrivalModalOpen(false);
    setShowSelfiePlaceholder(false);
    setIsGameCompleteModalOpen(false);
    setLegMoveCount(0);
    setTotalWastedMoves(0);
    setLegStartPos(null);
    setShowIdleHint(false);
    if (idleHintTimerRef.current) {
        clearTimeout(idleHintTimerRef.current);
        idleHintTimerRef.current = null;
    }
  };

  const handleTakeSelfie = () => {
    if (!revealingPointId || !levelData) return;

    setIsArrivalModalOpen(false);
    setShowSelfiePlaceholder(true);

    // After 3 seconds, hide selfie and reveal point on map
    setTimeout(() => {
        setShowSelfiePlaceholder(false);

        const newRevealed = new Set(revealedMysteryPoints);
        newRevealed.add(revealingPointId);
        
        // This triggers the flip animation
        setRevealedMysteryPoints(newRevealed);

        // After the flip animation (800ms) is complete, check for game over
        setTimeout(() => {
            if (newRevealed.size === levelData.mysteryPoints.length) {
                onComplete(finalRating);
                setIsGameCompleteModalOpen(true);
            } else {
                setRevealingPointId(null);
                setSelectedMysteryPointId(null);
                if (idleHintTimerRef.current) clearTimeout(idleHintTimerRef.current);
                idleHintTimerRef.current = setTimeout(() => {
                    setShowIdleHint(true);
                }, 4000);
            }
        }, 800);
    }, 3000);
  };

  const handleMysteryPointClick = (id: string) => {
    // Prevent selecting a new point if another is being revealed, Leon is moving,
    // or if a mystery point has already been selected for the current leg of the journey.
    if (revealingPointId || isMoving || selectedMysteryPointId) return;
    
    setShowIdleHint(false);
    if (idleHintTimerRef.current) {
        clearTimeout(idleHintTimerRef.current);
        idleHintTimerRef.current = null;
    }

    // Start a new leg for scoring
    if (levelData) {
      setLegStartPos(levelData.player.position);
      setLegMoveCount(0);
    }
    
    setSelectedMysteryPointId(id);

    // Show one-time hint after first selection
    if (!hasShownMovementHint) {
      setIsMovementHintModalOpen(true);
    }
  };
  
  const handleMove = () => {
    if (!levelData || isMoving) return;

    setLegMoveCount(prev => prev + 1);
    setIsMoving(true);
    const originalPosition = { ...levelData.player.position };
    const distanceInGridUnits = distance / levelData.scale;
    const targetPosition = { ...originalPosition };

    switch (direction) {
      case 'north':
        targetPosition.row += distanceInGridUnits;
        break;
      case 'south':
        targetPosition.row -= distanceInGridUnits;
        break;
      case 'east':
        targetPosition.col += distanceInGridUnits;
        break;
      case 'west':
        targetPosition.col -= distanceInGridUnits;
        break;
    }
    
    const isOffMap =
      targetPosition.row < 0.5 ||
      targetPosition.row > GRID_ROWS + 0.5 ||
      targetPosition.col < 0.5 ||
      targetPosition.col > GRID_COLS + 0.5;

    if (isOffMap) {
      // 1. Calculate position at the edge of the map
      const edgePosition = { ...targetPosition };
      edgePosition.row = Math.max(0.5, Math.min(GRID_ROWS + 0.5, edgePosition.row));
      edgePosition.col = Math.max(0.5, Math.min(GRID_COLS + 0.5, edgePosition.col));

      // 2. Animate Leon to the edge
      const playerMovingToEdge = { ...levelData.player, position: edgePosition };
      setLevelData({ ...levelData, player: playerMovingToEdge });

      // 3. After 1s (move animation), trigger the fall
      setTimeout(() => {
        setLeonAnimationState('falling');
        setShowExclamation(true);

        // 4. After fall animation (0.5s) + pause (0.25s), snap back
        setTimeout(() => {
          setIsSnappingBack(true);
          setLeonAnimationState('idle');
          setShowExclamation(false);

          const playerSnappedBack = { ...levelData.player, position: originalPosition };
          setLevelData({ ...levelData, player: playerSnappedBack });

          // Use a micro-task to re-enable transitions after the snap has rendered
          requestAnimationFrame(() => {
            setIsSnappingBack(false);
            setIsMoving(false);
          });
        }, 750); // 500ms fall animation + 250ms pause
      }, 1000); // 1000ms for move-to-edge animation
    } else {
      // Valid move, update position and re-enable controls after animation
      const newPlayer = { ...levelData.player, position: targetPosition };
      setLevelData({ ...levelData, player: newPlayer });
      setTimeout(() => {
        setIsMoving(false);
      }, 1000);
    }
  };

  const keyItems = useMemo(() => {
    if (!levelData) return [];

    const initialLandmarks = levelData.landmarks;

    const revealedLandmarks: Landmark[] = Array.from(revealedMysteryPoints)
      .map(pointId => {
        const mysteryPoint = levelData.mysteryPoints.find(p => p.id === pointId);
        if (!mysteryPoint) return null;
        
        // Create a Landmark-like object for the Key component
        return {
          id: mysteryPoint.id,
          symbol: mysteryPoint.revealedSymbol,
          label: mysteryPoint.revealedLabel,
          color: 'text-slate-800', // Use a standard color for discovered items
          position: { row: -1, col: -1 }, // Position is not used by the key
        };
      })
      .filter((p): p is Landmark => p !== null);
      
    return [...initialLandmarks, ...revealedLandmarks];
  }, [levelData, revealedMysteryPoints]);

  if (!levelData) {
    return <div className="bg-slate-100 min-h-screen w-full flex items-center justify-center"><p>Loading map...</p></div>;
  }
  
  return (
    <main className="bg-slate-100 min-h-screen w-full flex items-center justify-center p-4 font-sans">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} disabled={isIntroModalOpen} />
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        title="Photo Scavenger Hunt Instructions"
      >
        <p>Click a mystery point, then move Leon to it.</p>
      </InstructionModal>
      <Modal
        isOpen={isIntroModalOpen}
        onClose={() => setIsIntroModalOpen(false)}
        buttonText="Start"
      >
        <p>Leon is on a photo scavenger hunt! Click a mystery point to start.</p>
      </Modal>

      <Modal
        isOpen={isMovementHintModalOpen}
        onClose={() => {
          setIsMovementHintModalOpen(false);
          setHasShownMovementHint(true);
        }}
        buttonText="Go"
      >
        <p>Now help Leon reach the mystery point.</p>
      </Modal>

      {revealingPointDetails && (
        <Modal
            isOpen={isArrivalModalOpen}
            onClose={handleTakeSelfie}
            title="Leon reached the mystery point!"
            buttonText="Take selfie 🤳"
            closeOnOverlayClick={false}
        >
            <div className="flex flex-col items-center gap-2">
                <span className="text-6xl" aria-hidden="true">{revealingPointDetails.revealedSymbol}</span>
                <p className="font-bold text-lg">{revealingPointDetails.revealedLabel}</p>
            </div>
        </Modal>
      )}

      {showSelfiePlaceholder && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" aria-modal="true" role="dialog">
              <div className="bg-white rounded-lg p-8 text-slate-800 text-2xl font-bold shadow-2xl">
                  placeholder: Leon's selfie
              </div>
          </div>
      )}

      {isGameCompleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] p-4 antialiased">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
                Scavenger hunt complete!
                </h2>
                <StarRating rating={finalRating} />
                {finalRating < 3 && (
                    <p className="text-sm md:text-base text-gray-700/70 mt-3 md:mt-4 px-2">
                        Help Leon complete the hunt in fewer moves to earn more stars.
                    </p>
                )}
                <div className="mt-6 md:mt-8 flex justify-center items-start gap-4">
                    <button
                        onClick={handleReplay}
                        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                        aria-label="Replay the challenge"
                    >
                        Replay
                    </button>
                    <div className="flex flex-col items-center gap-2">
                      {(() => {
                          const bestStars = (progress && levelId && progress[levelId]) || 0;
                          const canProceed = finalRating >= 2 || bestStars >= 2;
                          return (
                              <>
                                  <button
                                      onClick={handleNextLevelClick}
                                      disabled={!canProceed}
                                      className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                      aria-label="Go to the next level"
                                  >
                                      Next level
                                  </button>
                                  {!canProceed && (
                                      <p className="text-sm text-slate-600">Get more stars to unlock.</p>
                                  )}
                              </>
                          );
                      })()}
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl">
        <div className="grid lg:grid-cols-[1fr_200px] gap-x-6 items-start">
          <div className="flex flex-col items-center">
            <GridMap 
              rows={GRID_ROWS}
              cols={GRID_COLS}
              landmarks={levelData.landmarks}
              scale={levelData.scale}
              mysteryPoints={levelData.mysteryPoints}
              player={levelData.player}
              selectedMysteryPointId={selectedMysteryPointId}
              onMysteryPointClick={handleMysteryPointClick}
              revealedMysteryPoints={revealedMysteryPoints}
              revealingPointId={revealingPointId}
              leonAnimationState={leonAnimationState}
              isSnappingBack={isSnappingBack}
              showExclamation={showExclamation}
              showIdleHint={showIdleHint}
            />
            {selectedMysteryPointId && !revealingPointId && (
              <div className="mt-4 w-full">
                <MovementController
                  direction={direction}
                  onDirectionChange={setDirection}
                  distance={distance}
                  onDistanceChange={setDistance}
                  onMove={handleMove}
                  isMoving={isMoving}
                />
              </div>
            )}
          </div>
          
          <aside className="flex flex-col gap-4">
            <ProgressBar
              completed={revealedMysteryPoints.size}
              total={levelData.mysteryPoints.length}
            />
            <Key landmarks={keyItems} />
          </aside>
        </div>
      </div>
    </main>
  );
};

export default CustomGridNavChallenge;