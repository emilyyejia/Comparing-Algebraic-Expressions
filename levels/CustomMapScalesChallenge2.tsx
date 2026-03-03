
import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import GridMap from '../../components/custom-map-scales-2/GridMap';
import Key from '../../components/custom-map-scales-2/Key';
import Equation from '../../components/custom-map-scales-2/Equation';
import BlockPalette from '../../components/custom-map-scales-2/BlockPalette';
import Modal from '../../components/custom-map-scales-2/Modal';
import LevelIndicator from '../../components/custom-map-scales-2/LevelIndicator';
import { 
  ALL_LANDMARKS, GRID_ROWS, GRID_COLS, TOTAL_LEVELS, BASE_BLOCK_UNIT_SIZE_PX
} from './custom-map-scales-2/mapScalesConstants2';
import type { Landmark, PlacedBlock, BlockOrientation, LevelData, LevelSolution } from './custom-map-scales-2/mapScalesTypes2';
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

const shuffle = <T,>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

const generateLevelData = (level: number): LevelData => {
  const selectedLandmarkTemplates = shuffle([...ALL_LANDMARKS]).slice(0, 4);
  const placedLandmarks: Landmark[] = [];
  const occupiedCoords = new Set<string>();
  let scale: number;
  let orientation: BlockOrientation;
  let landmark1: Landmark, landmark2: Landmark;
  let distance: number;
  let line: number;
  let start: number;
  let end: number;

  scale = (level % 2 === 0 && level !== 4) ? 200 : 100;
  orientation = Math.random() > 0.5 ? 'horizontal' : 'vertical';
  
  if (level === 4) {
    distance = 1;
  } else {
    const maxPossibleDistance = (orientation === 'horizontal' ? GRID_COLS : GRID_ROWS) - 1;
    const minDistance = (level === 1) ? 1 : 2;
    distance = Math.floor(Math.random() * (maxPossibleDistance - minDistance + 1)) + minDistance;
  }
  
  if (orientation === 'horizontal') {
    line = Math.floor(Math.random() * (GRID_ROWS - 1)) + 1.5;
    const maxStartColIndex = GRID_COLS - distance;
    const startColIndex = Math.floor(Math.random() * (maxStartColIndex + 1));
    start = startColIndex + 0.5;
    end = start + distance;

    landmark1 = { ...selectedLandmarkTemplates[0], position: { row: line, col: start } };
    landmark2 = { ...selectedLandmarkTemplates[1], position: { row: line, col: end } };
  } else {
    line = Math.floor(Math.random() * (GRID_COLS - 1)) + 1.5;
    const maxStartRowIndex = GRID_ROWS - distance;
    const startRowIndex = Math.floor(Math.random() * (maxStartRowIndex + 1));
    start = startRowIndex + 0.5;
    end = start + distance;

    landmark1 = { ...selectedLandmarkTemplates[0], position: { row: start, col: line } };
    landmark2 = { ...selectedLandmarkTemplates[1], position: { row: end, col: line } };
  }

  occupiedCoords.add(`${Math.round(landmark1.position.col)},${Math.round(landmark1.position.row)}`);
  occupiedCoords.add(`${Math.round(landmark2.position.col)},${Math.round(landmark2.position.row)}`);
  placedLandmarks.push(landmark1, landmark2);

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

  return { level, landmarks: placedLandmarks, scale, solution };
};

const isTouchDevice = () => 'ontouchstart' in window;
const backendForDND = isTouchDevice() ? TouchBackend : HTML5Backend;

const CustomMapScalesChallenge2: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress, progress, levelId }) => {
  const [currentLevel, setCurrentLevel] = useState(() => partialProgress?.currentLevel || 1);
  const [levelData, setLevelData] = useState<LevelData | null>(() => partialProgress?.levelData || null);
  const [placedBlocks, setPlacedBlocks] = useState<PlacedBlock[]>(() => partialProgress?.placedBlocks || []);
  const [isMeasurementComplete, setIsMeasurementComplete] = useState(() => partialProgress?.isMeasurementComplete || false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  
  const [equationAnswer, setEquationAnswer] = useState(() => partialProgress?.equationAnswer || '');
  const [equationError, setEquationError] = useState(false);
  const [scaleAnswer, setScaleAnswer] = useState(() => partialProgress?.scaleAnswer || '');
  const [scaleError, setScaleError] = useState(false);
  const [countAnswer, setCountAnswer] = useState(() => partialProgress?.countAnswer || '');
  const [countError, setCountError] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [invalidDropScaleHintActive, setInvalidDropScaleHintActive] = useState(false);
  const [isEquationScaleHintActive, setIsEquationScaleHintActive] = useState(false);
  const [paletteHintActive, setPaletteHintActive] = useState(() => (partialProgress ? false : true));
  const [inputErrorCount, setInputErrorCount] = useState(() => partialProgress?.inputErrorCount || 0);
  const [finalStars, setFinalStars] = useState<number | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  
  const [cellPixelSize, setCellPixelSize] = useState(BASE_BLOCK_UNIT_SIZE_PX);
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    if (!levelData || levelData.level !== currentLevel) {
      const newLevelData = generateLevelData(currentLevel);
      setLevelData(newLevelData);
      
      if (levelData && levelData.level !== currentLevel) {
        setPlacedBlocks([]);
        setIsMeasurementComplete(false);
        setIsLevelComplete(false);
        setEquationAnswer('');
        setScaleAnswer('');
        setCountAnswer('');
        setIsEquationScaleHintActive(false);
      }
    }
  }, [currentLevel, levelData]);
  
  useLayoutEffect(() => {
    const wrapperEl = gridWrapperRef.current;
    if (!wrapperEl) return;
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
  }, [levelData]);

  useEffect(() => {
    if (!levelData) return;
    if (placedBlocks.length === levelData.solution.distance) {
      setIsMeasurementComplete(true);
    }
  }, [placedBlocks, levelData]);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({
          currentLevel,
          levelData,
          placedBlocks,
          isMeasurementComplete,
          equationAnswer,
          scaleAnswer,
          countAnswer,
          inputErrorCount,
        });
      }
    };
  }, [onSavePartialProgress, currentLevel, levelData, placedBlocks, isMeasurementComplete, equationAnswer, scaleAnswer, countAnswer, inputErrorCount]);

  const checkPlacement = useCallback((size: number, orientation: BlockOrientation, row: number, col: number): boolean => {
    if (!levelData) return false;
    const { solution } = levelData;
    if (orientation !== solution.orientation) return false;
    
    // Use a small epsilon for floating point comparisons just in case
    const EPSILON = 0.01;

    if (orientation === 'horizontal') {
      // row should match line + 0.5 (integer)
      const isCorrectLine = Math.abs(row - (solution.line + 0.5)) < EPSILON;
      // col should be within start + 0.5 and end + 0.5
      const isCorrectRange = (col >= solution.start + 0.5 - EPSILON) && (col < solution.end + 0.5 + EPSILON);
      return isCorrectLine && isCorrectRange;
    } else { // vertical
      // col should match line + 0.5 (integer)
      const isCorrectLine = Math.abs(col - (solution.line + 0.5)) < EPSILON;
      // row should be within start + 0.5 and end + 0.5
      const isCorrectRange = (row >= solution.start + 0.5 - EPSILON) && (row < solution.end + 0.5 + EPSILON);
      return isCorrectLine && isCorrectRange;
    }
  }, [levelData]);

  const handleAddBlock = useCallback((blockData: Omit<PlacedBlock, 'id' | 'type'>) => {
    const isOccupied = placedBlocks.some(
      b => b.position.row === blockData.position.row && b.position.col === blockData.position.col && b.orientation === blockData.orientation
    );
    if (isOccupied || !levelData) return;
    if (placedBlocks.length >= levelData.solution.distance) return;

    const newBlock: PlacedBlock = {
      id: Date.now(),
      type: `${blockData.orientation[0]}-${blockData.size}`,
      ...blockData,
    };
    setPlacedBlocks(prev => [...prev, newBlock]);
  }, [levelData, placedBlocks]);

  const handleInvalidDrop = (reason: 'scale' | 'location') => {
    setInputErrorCount(prev => prev + 1);
    if (reason === 'scale') {
      setInvalidDropScaleHintActive(true);
      setTimeout(() => setInvalidDropScaleHintActive(false), 2500);
    }
  };

  const getStarRating = (errors: number): number => {
    if (errors <= 2) return 3;
    if (errors <= 5) return 2;
    return 1;
  };

  const handleSubmitEquation = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!levelData) return;

    let allCorrect = true;
    const correctCount = String(levelData.solution.distance);
    const correctScale = String(levelData.scale);
    const correctTotal = String(levelData.solution.distance * levelData.scale);

    if (currentLevel >= 4) {
      if (countAnswer !== correctCount) {
        setCountError(true);
        allCorrect = false;
        setTimeout(() => { setCountError(false); setCountAnswer(''); }, 500);
      }
    }
    if (currentLevel >= 2) {
      if (scaleAnswer !== correctScale) {
        setScaleError(true);
        allCorrect = false;
        setTimeout(() => { setScaleError(false); setScaleAnswer(''); }, 500);
      }
    }
    if (equationAnswer !== correctTotal) {
      setEquationError(true);
      allCorrect = false;
      setTimeout(() => { setEquationError(false); setEquationAnswer(''); }, 500);
    }

    if (allCorrect) {
      setIsLevelComplete(true);
      if (currentLevel === TOTAL_LEVELS) {
        const rating = getStarRating(inputErrorCount);
        isCompletedRef.current = true;
        onComplete(rating);
        setFinalStars(rating);
      } else {
        setTimeout(() => setShowSuccessModal(true), 1500);
      }
    } else {
      setInputErrorCount(prev => prev + 1);
    }
  }, [levelData, currentLevel, countAnswer, scaleAnswer, equationAnswer, inputErrorCount, onComplete]);

  const handleNextLevel = () => {
    setShowSuccessModal(false);
    if (currentLevel < TOTAL_LEVELS) {
      setCurrentLevel(prev => prev + 1);
    }
  };

  const handleReplay = () => {
    setFinalStars(null);
    setInputErrorCount(0);
    isCompletedRef.current = false;
    onSavePartialProgress?.(null);
    setPlacedBlocks([]);
    setIsMeasurementComplete(false);
    setIsLevelComplete(false);
    setEquationAnswer('');
    setScaleAnswer('');
    setCountAnswer('');
    setCurrentLevel(1);
  };
  
  const handleNextLevelClick = () => onExit?.();

  if (!levelData) {
    return <div className="bg-slate-100 min-h-screen w-full flex items-center justify-center"><p>Loading level...</p></div>;
  }
  
  return (
    <DndProvider backend={backendForDND} options={{ enableMouseEvents: true }}>
      <main className="bg-slate-100 min-h-screen w-full flex items-center justify-center p-4 font-sans">
        <InstructionButton onClick={() => setIsInstructionModalOpen(true)} />
        <InstructionModal
            isOpen={isInstructionModalOpen}
            onClose={() => setIsInstructionModalOpen(false)}
            title="Map Scales Practice Instructions"
        >
            <p>Measure with the blocks, then solve the equation.</p>
        </InstructionModal>
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-7xl relative">
          <LevelIndicator level={currentLevel} totalLevels={TOTAL_LEVELS} />
          <header>
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-1">
              How far is it from the {levelData.solution.landmark1.label.toLowerCase()} to the {levelData.solution.landmark2.label.toLowerCase()}?
            </h2>
            <p className="text-center text-slate-500 mb-4">Measure with blocks, then solve the equation.</p>
          </header>
          
          <div className="grid lg:grid-cols-[240px_1fr_240px] gap-x-6 items-start mt-2">
            <aside>
              <h3 className="text-xl font-bold text-slate-700 text-center mb-2">Measuring Blocks</h3>
              <BlockPalette
                level={currentLevel}
                scale={levelData.scale}
                baseUnitSize={cellPixelSize}
                showHint={paletteHintActive}
                onInteraction={() => setPaletteHintActive(false)}
              />
            </aside>

            <div className="flex flex-col items-center" ref={gridWrapperRef}>
              <GridMap 
                level={currentLevel}
                rows={GRID_ROWS}
                cols={GRID_COLS}
                landmarks={levelData.landmarks}
                scale={levelData.scale}
                solution={levelData.solution}
                placedBlocks={placedBlocks}
                isCompleted={isLevelComplete}
                onAddBlock={handleAddBlock}
                onInvalidDrop={handleInvalidDrop}
                checkPlacement={checkPlacement}
                scaleHintActive={invalidDropScaleHintActive || isEquationScaleHintActive}
              />
              <Equation
                level={currentLevel}
                count={levelData.solution.distance}
                scale={levelData.scale}
                correctTotal={levelData.solution.distance * levelData.scale}
                isMeasurementComplete={isMeasurementComplete}
                isLevelComplete={isLevelComplete}
                onAnswerSubmit={handleSubmitEquation}
                answer={equationAnswer}
                setAnswer={setEquationAnswer}
                equationError={equationError}
                scaleAnswer={scaleAnswer}
                setScaleAnswer={setScaleAnswer}
                scaleError={scaleError}
                countAnswer={countAnswer}
                setCountAnswer={setCountAnswer}
                countError={countError}
                isScaleHintVisible={isEquationScaleHintActive}
                onScaleHintToggle={setIsEquationScaleHintActive}
              />
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
                  Solve with fewer errors to earn more stars.
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

export default CustomMapScalesChallenge2;
