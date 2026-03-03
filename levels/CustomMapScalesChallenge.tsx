import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import GridMap from '../../components/custom-map-scales/GridMap';
import Key from '../../components/custom-map-scales/Key';
import Equation from '../../components/custom-map-scales/Equation';
import BlockPalette from '../../components/custom-map-scales/BlockPalette';
import Modal from '../../components/custom-map-scales/Modal';
import LevelIndicator from '../../components/custom-map-scales/LevelIndicator';
import StarRating from '../../components/custom-map-scales/StarRating';
import { 
  ALL_LANDMARKS, GRID_ROWS, GRID_COLS, TOTAL_LEVELS, BASE_BLOCK_UNIT_SIZE_PX
} from './custom-map-scales/mapScalesConstants';
import type { Landmark, PlacedBlock, BlockOrientation, LevelData, LevelSolution } from './custom-map-scales/mapScalesTypes';
import type { LevelComponentProps } from '../../types';
import InstructionButton from '../../components/InstructionButton';
import InstructionModal from '../../components/InstructionModal';

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-10 h-10 md:w-12 md:h-12 mx-1" }) => (
  <svg
    className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-400'}`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "0" : "1.5"}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
    />
  </svg>
);

// Helper function to shuffle array
const shuffle = <T,>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

const generateLevelData = (level: number): LevelData => {
  // 1. Pick scale
  // Alternate between 100m and 200m based on the level number.
  // Level 1: 100m, Level 2: 200m, Level 3: 100m, etc.
  const scale = (level % 2 === 1) ? 100 : 200;

  // 2. Pick landmarks
  const selectedLandmarkTemplates = shuffle([...ALL_LANDMARKS]).slice(0, 4);
  const placedLandmarks: Landmark[] = [];
  const occupiedCoords = new Set<string>(); // "col,row"

  // 3. Define alignment and place first two landmarks on grid intersections
  const orientation: BlockOrientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
  let landmark1: Landmark, landmark2: Landmark;
  let distance: number;
  let line: number;
  let start: number;
  let end: number;

  // Determine distance based on level
  if (level === 1) {
    distance = 2; // Crawl: Must place two 100m blocks for a 200m distance.
  } else {
    // For levels > 1, distance must be at least 2.
    const maxPossibleDistance = (orientation === 'horizontal' ? GRID_COLS : GRID_ROWS) - 1;
    const minDistance = 2;
    // We want a distance of at least 2, up to max.
    // e.g., if max is 4, we want 2, 3, or 4. Range is max - 2 + 1 = 3.
    distance = Math.floor(Math.random() * (maxPossibleDistance - minDistance + 1)) + minDistance;
  }
  
  if (orientation === 'horizontal') {
    line = Math.floor(Math.random() * (GRID_ROWS - 1)) + 1.5; // Row line
    
    // Pick a starting column that allows for the required distance
    const maxStartColIndex = GRID_COLS - distance;
    const startColIndex = Math.floor(Math.random() * (maxStartColIndex + 1));
    
    start = startColIndex + 0.5;
    end = start + distance;

    landmark1 = { ...selectedLandmarkTemplates[0], position: { row: line, col: start } };
    landmark2 = { ...selectedLandmarkTemplates[1], position: { row: line, col: end } };
  } else { // vertical
    line = Math.floor(Math.random() * (GRID_COLS - 1)) + 1.5; // Column line
    
    // Pick a starting row that allows for the required distance
    const maxStartRowIndex = GRID_ROWS - distance;
    const startRowIndex = Math.floor(Math.random() * (maxStartRowIndex + 1));

    start = startRowIndex + 0.5;
    end = start + distance;

    landmark1 = { ...selectedLandmarkTemplates[0], position: { row: start, col: line } };
    landmark2 = { ...selectedLandmarkTemplates[1], position: { row: end, col: line } };
  }


  // Use the integer cell coordinates for the occupied set to prevent overlaps with other landmarks
  occupiedCoords.add(`${Math.round(landmark1.position.col)},${Math.round(landmark1.position.row)}`);
  occupiedCoords.add(`${Math.round(landmark2.position.col)},${Math.round(landmark2.position.row)}`);
  placedLandmarks.push(landmark1, landmark2);

  // 4. Place remaining two landmarks in the center of cells
  for (let i = 2; i < 4; i++) {
    let placed = false;
    while (!placed) {
      const randCol = Math.floor(Math.random() * GRID_COLS) + 1;
      const randRow = Math.floor(Math.random() * GRID_ROWS) + 1;
      const coordKey = `${randCol},${randRow}`;
      if (!occupiedCoords.has(coordKey)) {
        const landmark = { ...selectedLandmarkTemplates[i], position: { row: randRow, col: randCol } };
        placedLandmarks.push(landmark);
        occupiedCoords.add(coordKey);
        placed = true;
      }
    }
  }

  const questionLandmarks = shuffle([landmark1, landmark2]);

  const solution: LevelSolution = {
    landmark1: questionLandmarks[0],
    landmark2: questionLandmarks[1],
    distance,
    orientation,
    line,
    start,
    end,
  };

  return {
    level,
    landmarks: placedLandmarks,
    scale,
    solution
  };
};

// Helper to detect touch devices
const isTouchDevice = () => {
  return 'ontouchstart' in window;
};

// Choose the backend based on the device
const backendForDND = isTouchDevice() ? TouchBackend : HTML5Backend;

const CustomMapScalesChallenge: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress, progress, levelId }) => {
  const [currentLevel, setCurrentLevel] = useState(() => partialProgress?.currentLevel || 1);
  const [levelData, setLevelData] = useState<LevelData | null>(() => partialProgress?.levelData || null);
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>(() => partialProgress?.placedBlocks || []);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [scaleHintActive, setScaleHintActive] = useState(false);
  const [incorrectMoves, setIncorrectMoves] = useState(() => partialProgress?.incorrectMoves || 0);
  const [finalStars, setFinalStars] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; position: { x: number; y: number } } | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  
  const [cellPixelSize, setCellPixelSize] = useState(BASE_BLOCK_UNIT_SIZE_PX);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    // Generate data for the current level only if it's missing or for a different level.
    if (!levelData || levelData.level !== currentLevel) {
      const newLevelData = generateLevelData(currentLevel);
      setLevelData(newLevelData);
      
      // When the level actually changes (not the initial load from progress), reset the board.
      if (levelData && levelData.level !== currentLevel) {
        setPlacedBlocks([]);
        setIsCompleted(false);
      }
    }
  }, [currentLevel, levelData]);
  
  useLayoutEffect(() => {
    const wrapperEl = gridWrapperRef.current;
    if (!wrapperEl) return;

    // The grid's width is the wrapper's width minus the static width of the row labels column (w-10 or 2.5rem/40px).
    const ROW_LABEL_WIDTH_PX = 40;
    
    const setSize = () => {
      if (gridWrapperRef.current) {
        const wrapperWidth = gridWrapperRef.current.clientWidth;
        const gridWidth = wrapperWidth - ROW_LABEL_WIDTH_PX;
        setCellPixelSize(gridWidth / GRID_COLS);
      }
    };
    
    setSize();

    const resizeObserver = new ResizeObserver(setSize);
    
    resizeObserver.observe(wrapperEl);
    
    return () => resizeObserver.disconnect();
  }, [levelData]); // Re-run when level changes

  const correctBlocks = placedBlocks.filter(b => b.isCorrect);
  const equationBlocksCount = correctBlocks.length;
  
  const checkPlacement = useCallback((
    size: number,
    orientation: BlockOrientation,
    row: number,
    col: number
  ): boolean => {
    if (!levelData) return false;
    const { solution } = levelData;
    
    // The size check is handled by GridMap before this, but as a safeguard:
    if (orientation !== solution.orientation) return false;
    
    if (orientation === 'horizontal') {
      // solution.line is R.5. Block is on the line between row R and R+1.
      // The dropped 'row' corresponds to the cell number *above* the line.
      // e.g. line 2.5 (from bottom) -> snappedRow is 3. `3 === 2.5 + 0.5`.
      const isCorrectLine = row === solution.line + 0.5;
      // Dropped col is a cell index. Landmarks are on lines C.5.
      // e.g. start=1.5, end=4.5. Blocks go in cells 2,3,4.
      const isCorrectRange = col >= solution.start && col < solution.end;
      return isCorrectLine && isCorrectRange;
    } else { // vertical
      // solution.line is C.5. Block is on the line between col C and C+1.
      // The dropped 'col' is the 0-indexed line number from the left.
      // e.g. line 1.5 -> snappedCol is 1. `1 === 1.5 - 0.5`.
      const isCorrectLine = col === solution.line - 0.5;
      // Dropped row is a cell index. Landmarks are on lines R.5.
      const isCorrectRange = row >= solution.start && row < solution.end;
      return isCorrectLine && isCorrectRange;
    }
  }, [levelData]);

  const handleAddBlock = (blockData: Omit<PlacedBlock, 'id' | 'type'>) => {
    const isOccupied = placedBlocks.some(
      b => b.position.row === blockData.position.row && b.position.col === blockData.position.col && b.orientation === blockData.orientation
    );
    if (isOccupied || !levelData) return;

    if (blockData.isCorrect && correctBlocks.length >= levelData.solution.distance) return;

    const newBlock: PlacedBlock = {
      id: Date.now(),
      type: `${blockData.orientation[0]}-${blockData.size}`,
      ...blockData,
    };
    
    setPlacedBlocks(prev => [...prev, newBlock]);
  };

  const handleInvalidDrop = (reason: 'scale' | 'location' = 'location', position: { x: number; y: number } | null) => {
    setIncorrectMoves(prev => prev + 1);

    // Only provide visual feedback (pulsing scale, hint pop-up) on sub-levels 3 or higher.
    if (currentLevel >= 3) {
        // For sub-levels 3 and higher, show a specific message on wrong block size drop.
        if (reason === 'scale' && position) {
          setScaleHintActive(true);
          setFeedback({
            message: "Hint! Choose a block that matches the map scale",
            position,
          });
        }
    }
  };

  const dismissFeedback = () => {
    setFeedback(null);
    setScaleHintActive(false);
  };

  const getStarRating = (moves: number): number => {
    if (moves <= 1) return 3;
    if (moves <= 4) return 2;
    return 1;
  };

  useEffect(() => {
    if (levelData && correctBlocks.length === levelData.solution.distance) {
      setIsCompleted(true);
      if (levelData.level === TOTAL_LEVELS) {
        const rating = getStarRating(incorrectMoves);
        isCompletedRef.current = true;
        onComplete(rating); // Save progress
        setFinalStars(rating); // Trigger final modal
      } else {
        setTimeout(() => setShowSuccessModal(true), 1500); // Show inter-level modal
      }
    } else {
      setIsCompleted(false);
    }
  }, [correctBlocks.length, levelData, incorrectMoves, onComplete]);

  // Effect to save partial progress on unmount
  useEffect(() => {
    return () => {
        // Only save if the whole challenge isn't completed and the save function exists.
        if (!isCompletedRef.current && onSavePartialProgress) {
            onSavePartialProgress({
                currentLevel,
                levelData,
                placedBlocks,
                incorrectMoves,
            });
        }
    };
  }, [onSavePartialProgress, currentLevel, levelData, placedBlocks, incorrectMoves]);
  
  const handleNextLevel = () => {
    setShowSuccessModal(false);
    if (currentLevel < TOTAL_LEVELS) {
      setCurrentLevel(prev => prev + 1);
    }
  };

  const handleReplay = () => {
    setFinalStars(null);
    setIncorrectMoves(0);
    isCompletedRef.current = false;
    onSavePartialProgress?.(null); // Clear saved progress on replay
    setPlacedBlocks([]);
    setIsCompleted(false);
    setCurrentLevel(1);
    setFeedback(null);
  };

  const handleNextLevelClick = () => {
    onExit?.();
  };
  
  if (!levelData) {
    return <div className="bg-slate-100 min-h-screen w-full flex items-center justify-center"><p>Loading level...</p></div>;
  }
  
  const getAvailableBlockSizes = (level: number): number[] => {
    if (level === 1) {
      return [100]; // Crawl: Only 100m blocks for 100m scale.
    }
    if (level === 2) {
      return [200]; // Walk: Only 200m blocks for 200m scale.
    }
    // Run: Both blocks available to test understanding.
    return [100, 200];
  };

  const availableSizes = getAvailableBlockSizes(currentLevel);

  return (
    <DndProvider backend={backendForDND} options={{ enableMouseEvents: true }}>
      <main className="bg-slate-100 min-h-screen w-full flex items-center justify-center p-4 font-sans">
        <InstructionButton onClick={() => setIsInstructionModalOpen(true)} />
        <InstructionModal
            isOpen={isInstructionModalOpen}
            onClose={() => setIsInstructionModalOpen(false)}
            title="Map Scales Instructions"
        >
            <p>Drag the blocks onto the map to measure.</p>
        </InstructionModal>

        {feedback && (
          <div
            className="fixed inset-0 z-40" // Fullscreen backdrop
            onClick={dismissFeedback}
            aria-label="Close hint"
            role="button"
          >
            <div
              className="absolute z-50"
              style={{
                left: feedback.position.x,
                top: feedback.position.y,
                transform: 'translate(-50%, -120%)',
              }}
              onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking on bubble
            >
              <div
                className="bg-slate-800 text-white p-2 rounded-lg shadow-xl font-semibold text-sm animate-fade-in-up relative"
                style={{ whiteSpace: 'nowrap' }}
                role="alert"
              >
                {feedback.message}
                <div
                  className="absolute left-1/2 w-3 h-3 bg-slate-800 transform -translate-x-1/2 rotate-45"
                  style={{ bottom: '-6px' }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-7xl relative">
          <LevelIndicator level={currentLevel} totalLevels={TOTAL_LEVELS} />
          <header>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
              How far is it from the {levelData.solution.landmark1.label.toLowerCase()} to the {levelData.solution.landmark2.label.toLowerCase()}?
            </h2>
            <p className="text-center text-slate-500 mb-4">Drag the blocks onto the map to measure.</p>
          </header>
          
          <div className="grid lg:grid-cols-[240px_1fr_240px] gap-x-6 items-start mt-2">
            <aside>
              <h3 className="text-xl font-bold text-slate-700 text-center mb-2">Measuring Blocks</h3>
              <BlockPalette 
                scale={levelData.scale} 
                baseUnitSize={cellPixelSize} 
                availableSizes={availableSizes} 
              />
            </aside>

            <div className="flex flex-col items-center" ref={gridWrapperRef}>
              <GridMap 
                rows={GRID_ROWS}
                cols={GRID_COLS}
                landmarks={levelData.landmarks}
                scale={levelData.scale}
                solution={levelData.solution}
                placedBlocks={placedBlocks}
                isCompleted={isCompleted}
                onAddBlock={handleAddBlock}
                onInvalidDrop={handleInvalidDrop}
                checkPlacement={checkPlacement}
                scaleHintActive={scaleHintActive}
              />
              <Equation count={equationBlocksCount} scale={levelData.scale} total={equationBlocksCount * levelData.scale} />
              <div className="h-8 mt-2 text-center" aria-live="polite">
              </div>
            </div>
            
            <aside>
              <Key landmarks={levelData.landmarks} />
            </aside>
          </div>
        </div>
        <Modal 
          isOpen={showSuccessModal} 
          onClose={handleNextLevel}
          onNext={handleNextLevel}
          title={"Correct!"}
          buttonText={"Next"}
        />
        {finalStars !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] p-4 antialiased">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
                Challenge complete!
              </h2>
              <div className="flex justify-center my-5 md:my-8">
                {[1, 2, 3].map((starIndex) => (
                  <StarIcon key={starIndex} filled={starIndex <= finalStars} className="w-12 h-12 md:w-16 md:h-16 mx-1.5 md:mx-2"/>
                ))}
              </div>
              {finalStars < 3 && (
                <p className="text-sm md:text-base text-gray-700/70 mt-3 md:mt-4 px-2">
                  Measure in fewer moves to earn more stars.
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
                      const canProceed = finalStars >= 2 || bestStars >= 2;
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
      </main>
    </DndProvider>
  );
};

export default CustomMapScalesChallenge;