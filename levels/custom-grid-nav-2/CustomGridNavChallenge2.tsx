import React, { useState, useEffect } from 'react';
import GridMap from '../../components/custom-grid-nav-2/GridMap';
import Key from '../../components/custom-grid-nav-2/Key';
import Modal from '../../components/custom-grid-nav-2/Modal';
import Timer from '../../components/custom-grid-nav-2/Timer';
import ProgressBar from '../../components/custom-grid-nav-2/ProgressBar';
import StarRating from '../../components/custom-grid-nav-2/StarRating';
import { 
  ALL_LANDMARKS, GRID_ROWS, GRID_COLS
} from './constants';
import type { Landmark, LevelData, Player, Instruction, Move } from './types';
import type { LevelComponentProps } from '../../types';
import InstructionButton from '../../components/InstructionButton';
import InstructionModal from '../../components/InstructionModal';

// Helper function to shuffle array
const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

const generateRandomInstructions = (
  player: Player, 
  landmarks: Landmark[], 
  scale: number, 
  gridRows: number, 
  gridCols: number
): Instruction[] => {
  const instructions: Instruction[] = [];
  const MAX_STEPS = 10;
  let currentPos = {...player.position};
  
  const landmarkPool = shuffle([...landmarks]);
  const randomInstructionCount = MAX_STEPS - 2;

  // --- Create an instruction plan to guarantee variety ---
  type InstructionType = 'normal' | 'landmark' | 'dual';
  const instructionPlan: InstructionType[] = Array(randomInstructionCount).fill('normal');
  
  // 1. Plan 2 landmark instructions in slots 4-7
  const landmarkIndices = shuffle([4, 5, 6, 7]).slice(0, 2);
  landmarkIndices.forEach(i => {
    instructionPlan[i] = 'landmark';
  });

  // 2. Plan at least 2 dual-move instructions in available slots, preferring later ones
  const availableForDual: number[] = [];
  for (let i = randomInstructionCount - 1; i >= 0; i--) {
    if (instructionPlan[i] === 'normal') {
      availableForDual.push(i);
    }
  }
  // Take the two latest available slots for dual moves
  const dualIndices = availableForDual.slice(0, 2); 
  dualIndices.forEach(i => {
    instructionPlan[i] = 'dual';
  });
  
  // --- Generate instructions based on the plan ---
  for (let i = 0; i < randomInstructionCount; i++) {
    let instructionType = instructionPlan[i];
    let newEndPos: {row: number, col: number} | null = null;
    let moveFound = false;

    let landmarkForInstruction: Landmark | null = null;
    
    // Pre-flight check for landmark instructions to ensure player isn't on the landmark
    if (instructionType === 'landmark') {
      const landmarkIndex = landmarkPool.findIndex(lm => 
        !(Math.abs(lm.position.row - currentPos.row) < 0.01 && 
          Math.abs(lm.position.col - currentPos.col) < 0.01)
      );

      if (landmarkIndex !== -1) {
        // We found a valid landmark. Use it.
        landmarkForInstruction = landmarkPool[landmarkIndex];
        landmarkPool.splice(landmarkIndex, 1); // Remove from pool so it's not used again.
      } else {
        // Fallback: No valid landmark available. Change instruction to normal.
        instructionType = 'normal';
      }
    }

    if (instructionType === 'landmark' && landmarkForInstruction) {
      const relativeLandmark = landmarkForInstruction;
      const startForInstruction = relativeLandmark.position;
      while (!moveFound) {
        const directions = shuffle(['north', 'east', 'south', 'west'] as const);
        const distancesInUnits = shuffle([1, 2, 3]);
        for (const dir of directions) {
          if (moveFound) break;
          for (const dist of distancesInUnits) {
            let tempEndPos = {...startForInstruction};
            if (dir === 'north') tempEndPos.row += dist; else if (dir === 'south') tempEndPos.row -= dist; else if (dir === 'east') tempEndPos.col += dist; else tempEndPos.col -= dist;

            const isWithinBounds = tempEndPos.row >= 0.5 && tempEndPos.row <= gridRows + 0.5 && tempEndPos.col >= 0.5 && tempEndPos.col <= gridCols + 0.5;
            const isTargetSameAsCurrent = Math.abs(tempEndPos.row - currentPos.row) < 0.01 && Math.abs(tempEndPos.col - currentPos.col) < 0.01;

            if (isWithinBounds && !isTargetSameAsCurrent) {
              newEndPos = tempEndPos;
              instructions.push({
                text: `Go ${dist * scale} metres ${dir} of the ${relativeLandmark.label.toLowerCase()}.`,
                moves: [{ distance: dist * scale, direction: dir }],
                relativeToLandmark: relativeLandmark.id,
              });
              moveFound = true;
              break;
            }
          }
        }
      }
    } else if (instructionType === 'dual') {
      const startForInstruction = currentPos;
      while (!moveFound) {
        type Direction = Move['direction'];
        const allDirectionPairs: [Direction, Direction][] = shuffle<[Direction, Direction]>([
          ['north', 'east'], ['north', 'west'],
          ['south', 'east'], ['south', 'west'],
        ]);
        const distancesInUnits1 = shuffle([1, 2]);
        const distancesInUnits2 = shuffle([1, 2]);

        for (const pair of allDirectionPairs) {
          if (moveFound) break;
          const [dir1, dir2] = pair;
          for (const dist1 of distancesInUnits1) {
            if (moveFound) break;
            for (const dist2 of distancesInUnits2) {
              let tempEndPos = {...startForInstruction};
              if (dir1 === 'north') tempEndPos.row += dist1; else if (dir1 === 'south') tempEndPos.row -= dist1; else if (dir1 === 'east') tempEndPos.col += dist1; else tempEndPos.col -= dist1;
              if (dir2 === 'north') tempEndPos.row += dist2; else if (dir2 === 'south') tempEndPos.row -= dist2; else if (dir2 === 'east') tempEndPos.col += dist2; else tempEndPos.col -= dist2;
              
              if (tempEndPos.row >= 0.5 && tempEndPos.row <= gridRows + 0.5 && tempEndPos.col >= 0.5 && tempEndPos.col <= gridCols + 0.5) {
                newEndPos = tempEndPos;
                instructions.push({
                  text: `Go ${dist1 * scale} metres ${dir1} and ${dist2 * scale} metres ${dir2}.`,
                  moves: [
                    { distance: dist1 * scale, direction: dir1 },
                    { distance: dist2 * scale, direction: dir2 }
                  ],
                });
                moveFound = true;
                break;
              }
            }
          }
        }
      }
    } else { // 'normal'
      const startForInstruction = currentPos;
      while (!moveFound) {
        const directions = shuffle(['north', 'east', 'south', 'west'] as const);
        const distancesInUnits = shuffle([1, 2, 3]);
        for (const dir of directions) {
          if (moveFound) break;
          for (const dist of distancesInUnits) {
            let tempEndPos = {...startForInstruction};
            if (dir === 'north') tempEndPos.row += dist; else if (dir === 'south') tempEndPos.row -= dist; else if (dir === 'east') tempEndPos.col += dist; else tempEndPos.col -= dist;

            if (tempEndPos.row >= 0.5 && tempEndPos.row <= gridRows + 0.5 && tempEndPos.col >= 0.5 && tempEndPos.col <= gridCols + 0.5) {
              newEndPos = tempEndPos;
              instructions.push({
                text: `Go ${dist * scale} metres ${dir}.`,
                moves: [{ distance: dist * scale, direction: dir }],
              });
              moveFound = true;
              break;
            }
          }
        }
      }
    }
    
    if (newEndPos) {
      currentPos = newEndPos;
    }
  }

  // --- Generate final instructions to return to start and ensure 10 total steps ---
  const posAfter8 = currentPos;
  const startPos = player.position;
  
  const returnInstructions: Instruction[] = [];

  const d_col = startPos.col - posAfter8.col;
  const d_row = startPos.row - posAfter8.row;

  const colDistUnits = Math.abs(Math.round(d_col));
  const rowDistUnits = Math.abs(Math.round(d_row));

  if (colDistUnits > 0) {
      const direction = d_col > 0 ? 'east' : 'west';
      returnInstructions.push({ 
        text: `Go ${colDistUnits * scale} metres ${direction}.`, 
        moves: [{ distance: colDistUnits * scale, direction }]
      });
  }
  if (rowDistUnits > 0) {
      const direction = d_row > 0 ? 'north' : 'south';
      returnInstructions.push({ 
        text: `Go ${rowDistUnits * scale} metres ${direction}.`, 
        moves: [{ distance: rowDistUnits * scale, direction }]
      });
  }

  // Pad to 10 instructions if needed
  const neededPadding = MAX_STEPS - (instructions.length + returnInstructions.length);

  if (neededPadding === 2) {
    returnInstructions.unshift(
      { text: `Go ${1 * scale} metres north.`, moves: [{ distance: 1 * scale, direction: 'north' }] },
      { text: `Go ${1 * scale} metres south.`, moves: [{ distance: 1 * scale, direction: 'south' }] }
    );
  } else if (neededPadding === 1) {
    const instructionToSplit = returnInstructions.pop();
    // All instructions in returnInstructions are single-move, so moves[0] is safe
    if (instructionToSplit && instructionToSplit.moves[0].distance / scale > 1) {
      const originalMove = instructionToSplit.moves[0];
      const originalUnits = originalMove.distance / scale;
      const firstMoveUnits = 1;
      const secondMoveUnits = originalUnits - 1;
      returnInstructions.push({
        text: `Go ${firstMoveUnits * scale} metres ${originalMove.direction}.`,
        moves: [{ distance: firstMoveUnits * scale, direction: originalMove.direction }]
      });
      returnInstructions.push({
        text: `Go ${secondMoveUnits * scale} metres ${originalMove.direction}.`,
        moves: [{ distance: secondMoveUnits * scale, direction: originalMove.direction }]
      });
    } else if (instructionToSplit) {
      returnInstructions.unshift(
        { text: `Go ${1 * scale} metres north.`, moves: [{ distance: 1 * scale, direction: 'north' }] },
        { text: `Go ${1 * scale} metres south.`, moves: [{ distance: 1 * scale, direction: 'south' }] },
        instructionToSplit
      );
    }
  }

  instructions.push(...returnInstructions);
  
  return instructions.slice(0, MAX_STEPS);
};


const generateLevelData = (): LevelData => {
  const scale = 50;
  const occupiedIntersections = new Set<string>();
  const placedLandmarks: Landmark[] = [];
  const MAX_ATTEMPTS = 100;

  // --- Maria starts at A1 ---
  const maria: Player = {
    id: 'maria',
    symbol: '🧍🏾‍♀️',
    label: 'Maria',
    position: { row: 0.5, col: 0.5 },
  };
  occupiedIntersections.add(`${maria.position.row},${maria.position.col}`);

  // --- Place all landmarks randomly on inner intersections ---
  const landmarkTemplates = shuffle([...ALL_LANDMARKS]);
  for (const template of landmarkTemplates) {
    let placed = false;
    let placeAttempt = 0;
    while (!placed && placeAttempt < MAX_ATTEMPTS) {
      placeAttempt++;
      // Generate random integer from 1 to GRID_SIZE-1 to avoid outer gridlines
      const randColInt = Math.floor(Math.random() * (GRID_COLS - 1)) + 1;
      const randRowInt = Math.floor(Math.random() * (GRID_ROWS - 1)) + 1;

      // Add 0.5 to be on an intersection point
      const randCol = randColInt + 0.5;
      const randRow = randRowInt + 0.5;
      const coordKey = `${randRow},${randCol}`;
      
      if (!occupiedIntersections.has(coordKey)) {
        const landmark = { ...template, position: { row: randRow, col: randCol } };
        placedLandmarks.push(landmark);
        occupiedIntersections.add(coordKey);
        placed = true;
      }
    }
  }

  const instructions = generateRandomInstructions(maria, placedLandmarks, scale, GRID_ROWS, GRID_COLS);

  return {
    level: 1,
    // Sort landmarks for a consistent key order
    landmarks: placedLandmarks.sort((a,b) => a.label.localeCompare(b.label)),
    scale,
    player: maria,
    instructions,
  };
};

const CustomGridNavChallenge2: React.FC<LevelComponentProps> = ({ onComplete, onExit }) => {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [isIntroModalOpen, setIsIntroModalOpen] = useState(true);
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(-1);
  const [targetPosition, setTargetPosition] = useState<{row: number, col: number} | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  useEffect(() => {
    setLevelData(generateLevelData());
  }, []);

  // Effect for the timer
  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning) {
      interval = window.setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTimerRunning]);

  // Effect to set up the current instruction
  useEffect(() => {
    if (currentInstructionIndex === -1 || !levelData) {
      return;
    }

    if (currentInstructionIndex >= levelData.instructions.length) {
      setIsGameComplete(true);
      setTargetPosition(null);
      setIsPulsing(false);
      setIsTimerRunning(false);
      return;
    }

    const instruction = levelData.instructions[currentInstructionIndex];
    
    let startPosition: { row: number, col: number };

    if (instruction.relativeToLandmark) {
      const landmark = levelData.landmarks.find(lm => lm.id === instruction.relativeToLandmark);
      // If landmark isn't found, fallback to player's position. This is a safe fallback.
      startPosition = landmark ? landmark.position : levelData.player.position;
    } else {
      // For dual or normal moves, the start position is where the player was after the *previous* move.
      // We need to calculate this from scratch to be accurate.
      let calculatedPos = { ...levelData.player.position };
      for (let i = 0; i < currentInstructionIndex; i++) {
        const pastInstruction = levelData.instructions[i];
        let pastStartPos: { row: number, col: number };
        if (pastInstruction.relativeToLandmark) {
          const pastLandmark = levelData.landmarks.find(lm => lm.id === pastInstruction.relativeToLandmark);
          pastStartPos = pastLandmark ? pastLandmark.position : calculatedPos;
        } else {
          pastStartPos = calculatedPos;
        }

        let tempTarget = { ...pastStartPos };
        for (const move of pastInstruction.moves) {
           const gridUnits = move.distance / levelData.scale;
            switch (move.direction) {
              case 'north': tempTarget.row += gridUnits; break;
              case 'south': tempTarget.row -= gridUnits; break;
              case 'east': tempTarget.col += gridUnits; break;
              case 'west': tempTarget.col -= gridUnits; break;
            }
        }
        calculatedPos = tempTarget;
      }
      startPosition = calculatedPos;
    }

    let newTarget = { ...startPosition };

    for(const move of instruction.moves) {
      const gridUnits = move.distance / levelData.scale;
      switch (move.direction) {
        case 'north': newTarget.row += gridUnits; break;
        case 'south': newTarget.row -= gridUnits; break;
        case 'east': newTarget.col += gridUnits; break;
        case 'west': newTarget.col -= gridUnits; break;
      }
    }
    
    setTargetPosition(newTarget);

    // Only pulse for the very first instruction (index 0) after a delay.
    setIsPulsing(false);
    if (currentInstructionIndex === 0) {
      const timer = setTimeout(() => setIsPulsing(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentInstructionIndex, levelData]);

  const handleStartGame = () => {
    setIsIntroModalOpen(false);
    setCurrentInstructionIndex(0);
    setElapsedTime(0);
    setIsTimerRunning(true);
  };
  
  const handleFinishGame = () => {
    const stars = elapsedTime <= 40 ? 3 : elapsedTime <= 60 ? 2 : 1;
    onComplete(stars);
    onExit?.();
  };

  const handleReplay = () => {
    setIsIntroModalOpen(true);
    setCurrentInstructionIndex(-1);
    setTargetPosition(null);
    setIsPulsing(false);
    setIsGameComplete(false);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setIsPenaltyModalOpen(false);
    setLevelData(generateLevelData());
  };

  const handleCorrectMove = (newPosition: {row: number, col: number}) => {
    if (!levelData) return;
    
    // The player model's position doesn't update, as path is recalculated each time
    // to correctly handle relative landmark instructions.

    setCurrentInstructionIndex(prevIndex => prevIndex + 1);
  };

  const handleWrongMove = () => {
    if (isTimerRunning) {
        setElapsedTime(prevTime => prevTime + 2);
    }
    setIsPenaltyModalOpen(true);
  };

  if (!levelData) {
    return <div className="bg-slate-100 min-h-screen w-full flex items-center justify-center"><p>Loading map...</p></div>;
  }
  
  // We cannot use levelData.player.position as the source of truth for the player's current location,
  // as it does not update. We calculate the current position based on completed instructions.
  let currentPlayerPosition = { ...levelData.player.position };
  if (currentInstructionIndex > 0) {
    let calculatedPos = { ...levelData.player.position };
      for (let i = 0; i < currentInstructionIndex; i++) {
        const pastInstruction = levelData.instructions[i];
        let pastStartPos: { row: number, col: number };
        if (pastInstruction.relativeToLandmark) {
          const pastLandmark = levelData.landmarks.find(lm => lm.id === pastInstruction.relativeToLandmark);
          pastStartPos = pastLandmark ? pastLandmark.position : calculatedPos;
        } else {
          pastStartPos = calculatedPos;
        }

        let tempTarget = { ...pastStartPos };
        for (const move of pastInstruction.moves) {
           const gridUnits = move.distance / levelData.scale;
            switch (move.direction) {
              case 'north': tempTarget.row += gridUnits; break;
              case 'south': tempTarget.row -= gridUnits; break;
              case 'east': tempTarget.col += gridUnits; break;
              case 'west': tempTarget.col -= gridUnits; break;
            }
        }
        calculatedPos = tempTarget;
      }
      currentPlayerPosition = calculatedPos;
  }
  
  const currentInstruction = levelData.instructions[currentInstructionIndex];
  const showInstruction = !!currentInstruction && !isGameComplete;
  const relativeLandmarkForInstruction = currentInstruction?.relativeToLandmark
    ? levelData.landmarks.find(lm => lm.id === currentInstruction.relativeToLandmark)
    // FIX: Add parentheses to fix an "Expected ')'" error.
    : undefined;
  
  return (
    <main className="bg-slate-100 min-h-screen w-full flex items-center justify-center p-4 font-sans">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} disabled={isIntroModalOpen} />
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        title="Orienteering Race Instructions"
      >
        <p>Maria is in an orienteering race. Help her get to each checkpoint!</p>
      </InstructionModal>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl relative">
        <ProgressBar 
          completed={Math.max(0, currentInstructionIndex)}
          total={levelData.instructions.length}
        />
        <div className="grid lg:grid-cols-[1fr_200px] gap-x-6 items-start">
          <div className="flex flex-col items-center">
            <GridMap 
              rows={GRID_ROWS}
              cols={GRID_COLS}
              landmarks={levelData.landmarks}
              scale={levelData.scale}
              player={{...levelData.player, position: currentPlayerPosition}}
              showInstruction={showInstruction}
              instructionText={currentInstruction?.text}
              relativeLandmark={relativeLandmarkForInstruction}
              targetPosition={targetPosition}
              isPulsing={isPulsing}
              onDotClick={(clickedPosition) => {
                if (targetPosition && Math.abs(clickedPosition.row - targetPosition.row) < 0.01 && Math.abs(clickedPosition.col - targetPosition.col) < 0.01) {
                    handleCorrectMove(clickedPosition);
                } else {
                    handleWrongMove();
                }
              }}
            />
          </div>
          
          <aside className="mt-[3.25rem]">
            <Timer timeInSeconds={elapsedTime} />
            <Key landmarks={levelData.landmarks} />
          </aside>
        </div>
      </div>
      <Modal
        isOpen={isIntroModalOpen}
        onClose={handleStartGame}
        buttonText="Start"
      >
        <p>Maria is in an orienteering race. Help her get to each checkpoint!</p>
      </Modal>
      {isGameComplete && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] p-4 antialiased">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Finish!</h2>
                {(() => {
                    const finalTime = `${String(Math.floor(elapsedTime / 60)).padStart(2, '0')}:${String(elapsedTime % 60).padStart(2, '0')}`;
                    const stars = elapsedTime <= 40 ? 3 : elapsedTime <= 60 ? 2 : 1;
                    
                    return (
                        <>
                            <div className="text-6xl mb-4" role="img" aria-label="Finish flag">🏁</div>
                            <p className="text-xl font-bold text-slate-700 mb-2">
                                Maria's time: {finalTime}
                            </p>
                            <StarRating rating={stars} />
                            {stars < 3 && (
                                <p className="text-slate-500 mt-4">
                                    Can you help Maria beat her time?
                                </p>
                            )}
                            <div className="mt-6 md:mt-8 flex justify-center items-center gap-4">
                                {stars === 1 && (
                                    <>
                                        <button
                                            onClick={handleReplay}
                                            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                                            aria-label="Replay the challenge"
                                        >
                                            Replay
                                        </button>
                                        <button
                                            onClick={handleFinishGame}
                                            className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
                                            aria-label="Back to map"
                                        >
                                            Back to map
                                        </button>
                                    </>
                                )}
                                {stars === 2 && (
                                    <>
                                        <button
                                            onClick={handleReplay}
                                            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                                            aria-label="Replay the challenge"
                                        >
                                            Replay
                                        </button>
                                        <button
                                            onClick={handleFinishGame}
                                            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75"
                                            aria-label="Finish"
                                        >
                                            Finish
                                        </button>
                                    </>
                                )}
                                {stars === 3 && (
                                    <button
                                        onClick={handleFinishGame}
                                        className="w-full px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75"
                                        aria-label="Finish"
                                    >
                                        Finish
                                    </button>
                                )}
                            </div>
                        </>
                    );
                })()}
            </div>
        </div>
      )}
      <Modal
        isOpen={isPenaltyModalOpen}
        onClose={() => setIsPenaltyModalOpen(false)}
        buttonText="Resume"
        title="Uh oh!"
      >
        <p>Maria went wrong. 2-second penalty.</p>
      </Modal>
    </main>
  );
};

export default CustomGridNavChallenge2;