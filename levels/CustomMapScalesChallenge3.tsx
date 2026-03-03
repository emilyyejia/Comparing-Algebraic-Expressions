import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { LevelComponentProps } from '../../types';
import GridMap from './custom-map-scales-3/components/GridMap';
import Key from './custom-map-scales-3/components/Key';
import Schedule from './custom-map-scales-3/components/Schedule';
import ArrowPalette from './custom-map-scales-3/components/ArrowPalette';
import CompletionModal from './custom-map-scales-3/components/CompletionModal';
import Modal from './custom-map-scales-3/components/Modal';
import { 
  ALL_LANDMARKS, GRID_ROWS, GRID_COLS
} from './custom-map-scales-3/constants';
import type { Landmark, LevelData, ScheduleItem, Direction, PlacedArrow } from './custom-map-scales-3/types';
import InstructionButton from '../../components/InstructionButton';
import InstructionModal from '../../components/InstructionModal';

// Helper function to shuffle array
const shuffle = <T,>(array: T[]): T[] => array.sort(() => Math.random() - 0.5);

const generateLevelData = (level: number): LevelData => {
  // 1. Set scale
  const possibleScales = [50, 200];
  const scale = possibleScales[Math.floor(Math.random() * possibleScales.length)];

  // 2. Define the fixed schedule
  const schedule: ScheduleItem[] = [
    { time: '8:00', fromId: 'linas-house', toId: 'school' },
    { time: '12:00', fromId: 'school', toId: 'park' },
    { time: '12:45', fromId: 'park', toId: 'school' },
    { time: '3:00', fromId: 'school', toId: 'pool' },
    { time: '4:30', fromId: 'pool', toId: 'linas-house' },
  ];
  
  const requiredLandmarkIds = ['linas-house', 'school', 'park', 'pool'];

  // 3. Pick landmarks, ensuring the required ones are included
  const requiredLandmarks = ALL_LANDMARKS.filter(l => requiredLandmarkIds.includes(l.id));
  const otherLandmarks = ALL_LANDMARKS.filter(l => !requiredLandmarkIds.includes(l.id));
  const remainingNeeded = 6 - requiredLandmarks.length;
  const extraLandmarks = shuffle(otherLandmarks).slice(0, remainingNeeded);
  
  const placedLandmarks: Landmark[] = [];
  const occupiedCoords = new Set<string>(); // "col,row" for intersections

  // Reserve top-left coords to avoid covering the scale bar, which is
  // positioned above the first grid column. Intersections (0, 6) and (1, 6)
  // are directly underneath it.
  occupiedCoords.add(`0,${GRID_ROWS}`);
  occupiedCoords.add(`1,${GRID_ROWS}`);


  // 4. Place landmarks on intersections.
  
  // Place required landmarks first, ensuring they are spread out and not on the grid edges.
  // The inner grid for these landmarks is from (1,1) to (5,5).
  // We define 2x2 quadrants in the corners of this inner grid to keep them separated.
  const innerCornerQuadrants = [
    { name: 'bottom-left',  colRange: [1, 2], rowRange: [1, 2] },
    { name: 'bottom-right', colRange: [GRID_COLS - 2, GRID_COLS - 1], rowRange: [1, 2] },
    { name: 'top-left',     colRange: [1, 2], rowRange: [GRID_ROWS - 2, GRID_ROWS - 1] },
    { name: 'top-right',    colRange: [GRID_COLS - 2, GRID_COLS - 1], rowRange: [GRID_ROWS - 2, GRID_ROWS - 1] },
  ];

  const shuffledRequiredLandmarks = shuffle(requiredLandmarks);
  const shuffledQuadrants = shuffle(innerCornerQuadrants);

  // Place required landmarks, one in each quadrant
  shuffledRequiredLandmarks.forEach((landmarkTemplate, index) => {
    const quadrant = shuffledQuadrants[index];
    let placed = false;
    // This loop is safe; each quadrant has 4 spots for one landmark.
    while (!placed) {
      const col = quadrant.colRange[0] + Math.floor(Math.random() * (quadrant.colRange[1] - quadrant.colRange[0] + 1));
      const row = quadrant.rowRange[0] + Math.floor(Math.random() * (quadrant.rowRange[1] - quadrant.rowRange[0] + 1));
      const coordKey = `${col},${row}`;
      if (!occupiedCoords.has(coordKey)) {
        const landmark = { ...landmarkTemplate, position: { col, row } };
        placedLandmarks.push(landmark);
        occupiedCoords.add(coordKey);
        placed = true;
      }
    }
  });

  // Place extra landmarks anywhere on remaining empty spots
  const extraLandmarksToPlace = [...extraLandmarks];
  for (const landmarkTemplate of extraLandmarksToPlace) {
    let placed = false;
    while (!placed) {
      const randCol = Math.floor(Math.random() * (GRID_COLS + 1));
      const randRow = Math.floor(Math.random() * (GRID_ROWS + 1));
      const coordKey = `${randCol},${randRow}`;

      if (!occupiedCoords.has(coordKey)) {
        const landmark = { ...landmarkTemplate, position: { col: randCol, row: randRow } };
        placedLandmarks.push(landmark);
        occupiedCoords.add(coordKey);
        placed = true;
      }
    }
  }

  return {
    level: 1,
    landmarks: shuffle(placedLandmarks), // Shuffle for the key display
    scale,
    schedule,
  };
};

const CustomMapScalesChallenge3: React.FC<LevelComponentProps> = ({ onComplete, onExit }) => {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [placedArrows, setPlacedArrows] = useState<PlacedArrow[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isCurrentTaskComplete, setIsCurrentTaskComplete] = useState(false);
  const [completedArrowCount, setCompletedArrowCount] = useState(0);
  const [isChallengeComplete, setIsChallengeComplete] = useState(false);
  const [isAllTasksComplete, setIsAllTasksComplete] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [isArrowHintActive, setIsArrowHintActive] = useState(false);
  const [incorrectArrowCount, setIncorrectArrowCount] = useState(0);
  const [inputErrorCount, setInputErrorCount] = useState(0);
  
  const [distanceInputs, setDistanceInputs] = useState<Record<number, string>>({});
  const [distanceInputStatus, setDistanceInputStatus] = useState<Record<number, 'incorrect' | 'correct' | undefined>>({});
  const [flashingInput, setFlashingInput] = useState<number | null>(null);

  const [totalDistanceInput, setTotalDistanceInput] = useState('');
  const [totalDistanceStatus, setTotalDistanceStatus] = useState<'incorrect' | 'correct' | undefined>();
  const [flashingTotalInput, setFlashingTotalInput] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  const handleStart = () => {
    setShowWelcomeModal(false);
    setIsArrowHintActive(true);
  };

  const handleArrowDragStart = () => {
    setIsArrowHintActive(false);
  };

  const startNewLevel = useCallback(() => {
    const newLevelData = generateLevelData(1);
    setLevelData(newLevelData);
    setPlacedArrows([]);
    setIsCurrentTaskComplete(false);
    setCurrentTaskIndex(0);
    setCompletedArrowCount(0);
    setIsChallengeComplete(false);
    setIsAllTasksComplete(false);
    setShowWelcomeModal(true);
    setIsArrowHintActive(false);
    setIncorrectArrowCount(0);
    setInputErrorCount(0);
    setDistanceInputs({});
    setDistanceInputStatus({});
    setFlashingInput(null);
    setTotalDistanceInput('');
    setTotalDistanceStatus(undefined);
    setFlashingTotalInput(false);
  }, []);

  useEffect(() => {
    const newLevelData = generateLevelData(1);
    setLevelData(newLevelData);
  }, []);

  const handleDistanceChange = (tripIndex: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setDistanceInputs(prev => ({ ...prev, [tripIndex]: numericValue }));
    
    if (numericValue && distanceInputStatus[tripIndex] === 'incorrect') {
        const newStatus = { ...distanceInputStatus };
        delete newStatus[tripIndex];
        setDistanceInputStatus(newStatus);
    }
  };

  const handleSubmitDistance = (tripIndex: number) => {
    if (!levelData) return;

    const submittedValue = distanceInputs[tripIndex];
    if (!submittedValue) return;

    const correctArrowsForTrip = placedArrows.filter(
      arrow => arrow.tripIndex === tripIndex && arrow.status === 'correct'
    ).length;
    const correctDistance = correctArrowsForTrip * levelData.scale;

    if (Number(submittedValue) === correctDistance) {
        setDistanceInputStatus(prev => ({ ...prev, [tripIndex]: 'correct' }));
        const isFinalTask = tripIndex === levelData.schedule.length - 1;
        
        setTimeout(() => {
            if (isFinalTask) {
                setIsAllTasksComplete(true);
            } else {
                setCompletedArrowCount(placedArrows.filter(a => a.status === 'correct').length);
                setCurrentTaskIndex(prev => prev + 1);
                setIsCurrentTaskComplete(false);
            }
        }, 500);
    } else {
        setInputErrorCount(prev => prev + 1);
        setDistanceInputStatus(prev => ({ ...prev, [tripIndex]: 'incorrect' }));
        setFlashingInput(tripIndex);
        setDistanceInputs(prev => ({ ...prev, [tripIndex]: '' }));
        setTimeout(() => {
          setFlashingInput(null);
        }, 500);
    }
  };

  const handleTotalDistanceChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setTotalDistanceInput(numericValue);
    if (numericValue && totalDistanceStatus === 'incorrect') {
        setTotalDistanceStatus(undefined);
    }
  };

  const getStarRating = (errors: number) => {
    if (errors <= 1) return 3;
    if (errors <= 3) return 2;
    return 1;
  };

  const handleSubmitTotalDistance = () => {
      if (!levelData) return;
      const correctTotalDistance = placedArrows.filter(arrow => arrow.status === 'correct').length * levelData.scale;

      if (Number(totalDistanceInput) === correctTotalDistance) {
          setTotalDistanceStatus('correct');
          const stars = getStarRating(inputErrorCount);
          onComplete(stars);
          setTimeout(() => {
              setIsChallengeComplete(true);
          }, 500);
      } else {
          setInputErrorCount(prev => prev + 1);
          setTotalDistanceStatus('incorrect');
          setFlashingTotalInput(true);
          setTotalDistanceInput('');
          setTimeout(() => {
              setFlashingTotalInput(false);
          }, 500);
      }
  };


  const handleArrowDrop = (direction: Direction, fromPos: {col: number, row: number}) => {
    if (isCurrentTaskComplete || !levelData) return;
    
    const currentTask = levelData.schedule[currentTaskIndex];
    const startLandmark = levelData.landmarks.find(l => l.id === currentTask.fromId);
    const endLandmark = levelData.landmarks.find(l => l.id === currentTask.toId);

    if (!startLandmark || !endLandmark) return;

    // 1. Determine the expected starting position for this new arrow
    let expectedFromPos: {col: number, row: number};
    const correctArrows = placedArrows.filter(a => a.status === 'correct' && a.tripIndex === currentTaskIndex);

    if (correctArrows.length === 0) {
        expectedFromPos = startLandmark.position;
    } else {
        const lastArrow = correctArrows[correctArrows.length - 1];
        const lastArrowToPos = { ...lastArrow.from };
        if (lastArrow.direction === 'N') lastArrowToPos.row += 1;
        else if (lastArrow.direction === 'S') lastArrowToPos.row -= 1;
        else if (lastArrow.direction === 'E') lastArrowToPos.col += 1;
        else if (lastArrow.direction === 'W') lastArrowToPos.col -= 1;
        expectedFromPos = lastArrowToPos;
    }

    // 2. Check if the arrow was dropped at the correct starting point for path continuity
    const isAtCorrectStart = fromPos.col === expectedFromPos.col && fromPos.row === expectedFromPos.row;

    if (!isAtCorrectStart) {
        return; 
    }
    
    const segmentId = `${fromPos.col},${fromPos.row}-${direction}`;
    const arrowId = `${segmentId}-${currentTaskIndex}`;
    if (placedArrows.some(a => a.id === arrowId)) {
        return;
    }

    const startPos = fromPos;
    const endPos = endLandmark.position;

    let nextPos = { ...startPos };
    if (direction === 'N') nextPos.row += 1;
    else if (direction === 'S') nextPos.row -= 1;
    else if (direction === 'E') nextPos.col += 1;
    else if (direction === 'W') nextPos.col -= 1;
    
    const dist = (p1: {col:number, row:number}, p2: {col:number, row:number}) => 
      Math.abs(p1.col - p2.col) + Math.abs(p1.row - p2.row);

    const isCorrectMove = dist(startPos, endPos) > dist(nextPos, endPos);
    
    const newArrow: PlacedArrow = {
      id: arrowId,
      from: startPos,
      direction,
      status: isCorrectMove ? 'correct' : 'incorrect',
      tripIndex: currentTaskIndex,
    };
    
    setPlacedArrows(prev => [...prev, newArrow]);

    if (isCorrectMove) {
      const nextArrowEndpoint = { ...fromPos };
      if (direction === 'N') nextArrowEndpoint.row += 1;
      else if (direction === 'S') nextArrowEndpoint.row -= 1;
      else if (direction === 'E') nextArrowEndpoint.col += 1;
      else if (direction === 'W') nextArrowEndpoint.col -= 1;
      
      const reachedDestination = nextArrowEndpoint.col === endPos.col && nextArrowEndpoint.row === endPos.row;
      
      if (reachedDestination) {
        // Count correct arrows for the current trip so far, then add 1 for the one just placed.
        // This is needed because `placedArrows` state has not updated yet.
        const correctArrowsForThisTripSoFar = placedArrows.filter(
            a => a.status === 'correct' && a.tripIndex === currentTaskIndex
        ).length;
        const currentTripArrowCount = correctArrowsForThisTripSoFar + 1;
        const shortestPathLength = dist(startLandmark.position, endLandmark.position);

        if (currentTripArrowCount === shortestPathLength) {
          setIsCurrentTaskComplete(true);
        }
      }
    } else {
      setIncorrectArrowCount(prev => prev + 1);
      setTimeout(() => {
        setPlacedArrows(prev => prev.filter(a => a.id !== newArrow.id));
      }, 500);
    }
  };

  return (
    <main className="bg-slate-100 min-h-screen w-full flex flex-col items-center justify-center p-4 font-sans">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} disabled={showWelcomeModal} />
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        title="Daily Schedule Challenge Instructions"
      >
        <p>How far does Lina walk each day? Drag the arrows onto the map to trace her route.</p>
      </InstructionModal>

      {showWelcomeModal && <Modal onStart={handleStart} />}
      {isChallengeComplete && levelData && (
        <CompletionModal
          totalDistance={placedArrows.filter(a => a.status === 'correct').length * levelData.scale}
          inputErrorCount={inputErrorCount + incorrectArrowCount}
          onPlayAgain={startNewLevel}
          onExit={onExit}
        />
      )}

      {levelData && (
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-7xl grid lg:grid-cols-[1fr_400px] gap-x-6 items-start">
          <div>
            <GridMap
              rows={GRID_ROWS}
              cols={GRID_COLS}
              landmarks={levelData.landmarks}
              scale={levelData.scale}
              placedArrows={placedArrows}
              onArrowDrop={handleArrowDrop}
              currentTaskIndex={currentTaskIndex}
            />
          </div>
          <aside className="flex flex-col gap-4">
            <Schedule
              schedule={levelData.schedule}
              landmarks={levelData.landmarks}
              currentTaskIndex={currentTaskIndex}
              isCurrentTaskComplete={isCurrentTaskComplete}
              placedArrows={placedArrows}
              scale={levelData.scale}
              isAllTasksComplete={isAllTasksComplete}
              distanceInputs={distanceInputs}
              onDistanceChange={handleDistanceChange}
              onSubmitDistance={handleSubmitDistance}
              distanceInputStatus={distanceInputStatus}
              flashingInput={flashingInput}
              totalDistanceInput={totalDistanceInput}
              onTotalDistanceChange={handleTotalDistanceChange}
              onSubmitTotalDistance={handleSubmitTotalDistance}
              totalDistanceStatus={totalDistanceStatus}
              flashingTotalInput={flashingTotalInput}
            />
            <ArrowPalette
              disabled={isCurrentTaskComplete}
              isHintActive={isArrowHintActive}
              onArrowDragStart={handleArrowDragStart}
            />
            <Key landmarks={levelData.landmarks} />
          </aside>
        </div>
      )}
    </main>
  );
};

export default CustomMapScalesChallenge3;
