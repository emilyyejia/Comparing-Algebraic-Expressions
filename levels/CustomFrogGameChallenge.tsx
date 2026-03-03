import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import Grid from '../components/custom-frog-game/Grid';
import Controls from '../components/custom-frog-game/Controls';
import Modal from '../components/custom-frog-game/Modal';
import CompassRose from '../components/custom-frog-game/CompassRose';
import StartScreen from '../components/custom-frog-game/StartScreen';
import { Position, Direction } from './custom-frog-game/frogGameTypes';
import {
  INITIAL_FROG_POSITION,
  INITIAL_WORM_POSITION,
  GRID_SIZE,
  DYNAMIC_FLY_DURATION_MS,
  DYNAMIC_FLY_RESPAWN_DELAY_MS
} from './custom-frog-game/frogGameConstants';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const initialDirections = [Direction.NORTH, Direction.SOUTH, Direction.EAST, Direction.WEST];

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

const CustomFrogGameChallenge: React.FC<LevelComponentProps> = ({ onComplete, onExit, progress, levelId }) => {
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [frogPosition, setFrogPosition] = useState<Position>(INITIAL_FROG_POSITION);
  const [wormPosition, setWormPosition] = useState<Position>(INITIAL_WORM_POSITION);
  const [lilyPads, setLilyPads] = useState<Position[]>([]);
  const [fliesEatenCount, setFliesEatenCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [starRating, setStarRating] = useState<number>(0);
  const [isTrapped, setIsTrapped] = useState<boolean>(false);
  const [trapDelayTimer, setTrapDelayTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [shuffledDirections, setShuffledDirections] = useState<Direction[]>(() => shuffleArray(initialDirections));
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);


  const [dynamicFlyPosition, setDynamicFlyPosition] = useState<Position | null>(null);
  const [activeFlyLifetimeTimer, setActiveFlyLifetimeTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const nextFlySpawnTimerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFlySpawnScheduledRef = useRef<boolean>(false);

  const clearActiveDynamicFly = useCallback(() => {
    if (activeFlyLifetimeTimer) {
      clearTimeout(activeFlyLifetimeTimer);
    }
    setActiveFlyLifetimeTimer(null);
    setDynamicFlyPosition(null);
    isFlySpawnScheduledRef.current = false; 
  }, [activeFlyLifetimeTimer, setActiveFlyLifetimeTimer, setDynamicFlyPosition]);

  const spawnNewDynamicFly = useCallback(() => {
    if (nextFlySpawnTimerIdRef.current) {
        clearTimeout(nextFlySpawnTimerIdRef.current);
        nextFlySpawnTimerIdRef.current = null;
    }
    isFlySpawnScheduledRef.current = false;

    if (fliesEatenCount >= 5) {
      clearActiveDynamicFly();
      return;
    }

    if (!gameStarted || isGameOver || isTrapped || dynamicFlyPosition) {
      return;
    }

    const invalidPos = [
      frogPosition,
      wormPosition,
      ...lilyPads,
    ];
    const availableSpots: Position[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!invalidPos.some(p => p.row === r && p.col === c)) {
          availableSpots.push({ row: r, col: c });
        }
      }
    }

    if (availableSpots.length > 0) {
      const spot = availableSpots[Math.floor(Math.random() * availableSpots.length)];
      setDynamicFlyPosition(spot);

      const flyLifetimeTimerId = setTimeout(() => {
        clearActiveDynamicFly(); 
      }, DYNAMIC_FLY_DURATION_MS);
      setActiveFlyLifetimeTimer(flyLifetimeTimerId);
    }
  }, [
    gameStarted, isGameOver, isTrapped, dynamicFlyPosition,
    frogPosition, wormPosition, lilyPads, clearActiveDynamicFly,
    setDynamicFlyPosition, setActiveFlyLifetimeTimer, fliesEatenCount
  ]);

  useEffect(() => {
    const shouldManageFlies = gameStarted && !isGameOver && !isTrapped && fliesEatenCount < 5;

    if (shouldManageFlies) {
      if (dynamicFlyPosition === null && !isFlySpawnScheduledRef.current) {
        isFlySpawnScheduledRef.current = true;
        nextFlySpawnTimerIdRef.current = setTimeout(spawnNewDynamicFly, DYNAMIC_FLY_RESPAWN_DELAY_MS);
      }
    } else {
      clearActiveDynamicFly();
      if (nextFlySpawnTimerIdRef.current) {
        clearTimeout(nextFlySpawnTimerIdRef.current);
        nextFlySpawnTimerIdRef.current = null;
      }
      isFlySpawnScheduledRef.current = false;
    }

    return () => {
      if (nextFlySpawnTimerIdRef.current) {
        clearTimeout(nextFlySpawnTimerIdRef.current);
        nextFlySpawnTimerIdRef.current = null;
        isFlySpawnScheduledRef.current = false; 
      }
    };
  }, [
    gameStarted, isGameOver, isTrapped, fliesEatenCount,
    dynamicFlyPosition, 
    spawnNewDynamicFly, clearActiveDynamicFly
  ]);

  const checkIfTrapped = useCallback((
    currentFrogPos: Position,
    targetWormPos: Position,
    currentLilyPads: Position[],
    gridSize: number
  ): boolean => {
    const queue: Position[] = [{ ...currentFrogPos }];
    const visited: boolean[][] = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false));

    if (currentFrogPos.row < 0 || currentFrogPos.row >= gridSize || currentFrogPos.col < 0 || currentFrogPos.col >= gridSize) {
        return true;
    }
    visited[currentFrogPos.row][currentFrogPos.col] = true;

    const directions = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.row === targetWormPos.row && current.col === targetWormPos.col) return false;

      for (const move of directions) {
        const nextRow = current.row + move.dr;
        const nextCol = current.col + move.dc;

        if (nextRow < 0 || nextRow >= gridSize || nextCol < 0 || nextCol >= gridSize || visited[nextRow][nextCol]) continue;
        if (currentLilyPads.some(pad => pad.row === nextRow && pad.col === nextCol)) continue;

        visited[nextRow][nextCol] = true;
        queue.push({ row: nextRow, col: nextCol });
      }
    }
    return true;
  }, []);

  const resetGameState = useCallback(() => {
    setFrogPosition(INITIAL_FROG_POSITION);
    setWormPosition(INITIAL_WORM_POSITION);
    setLilyPads([]);
    setFliesEatenCount(0);
    setIsGameOver(false);
    setStarRating(0);
    setIsTrapped(false);
    setShowWinModal(false); 
    setShuffledDirections(shuffleArray(initialDirections));

    if (trapDelayTimer) {
      clearTimeout(trapDelayTimer);
      setTrapDelayTimer(null);
    }
    
    clearActiveDynamicFly();
    if (nextFlySpawnTimerIdRef.current) {
        clearTimeout(nextFlySpawnTimerIdRef.current);
        nextFlySpawnTimerIdRef.current = null;
    }
    isFlySpawnScheduledRef.current = false;
  }, [clearActiveDynamicFly, trapDelayTimer, setShowWinModal]);


  const handleStartGame = useCallback(() => {
    resetGameState();
    setGameStarted(true);
  }, [resetGameState]);

  const handleRestart = useCallback((skipStartScreen: boolean = false) => {
    resetGameState();
    setGameStarted(skipStartScreen);
  }, [resetGameState]);

  const handleDirectionClick = useCallback((direction: Direction) => {
    if (isGameOver || isTrapped || trapDelayTimer) return;

    let newRow = frogPosition.row;
    let newCol = frogPosition.col;

    switch (direction) {
      case Direction.NORTH: newRow--; break;
      case Direction.SOUTH: newRow++; break;
      case Direction.WEST: newCol--; break;
      case Direction.EAST: newCol++; break;
    }

    if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE ||
        lilyPads.some(pad => pad.row === newRow && pad.col === newCol)) {
      return;
    }

    const previousFrogPosition = { ...frogPosition };
    const newFrogPosition = { row: newRow, col: newCol };

    let currentFliesEaten = fliesEatenCount;

    if (dynamicFlyPosition && dynamicFlyPosition.row === newFrogPosition.row && dynamicFlyPosition.col === newFrogPosition.col) {
      currentFliesEaten++;
      clearActiveDynamicFly(); 
    }
    setFliesEatenCount(currentFliesEaten);

    const updatedLilyPads = [...lilyPads, previousFrogPosition];
    setLilyPads(updatedLilyPads);
    setFrogPosition(newFrogPosition);

    if (newFrogPosition.row === wormPosition.row && newFrogPosition.col === wormPosition.col) {
      let calculatedStars = 0;
      if (currentFliesEaten <= 1) { 
        calculatedStars = 1;
      } else if (currentFliesEaten >= 2 && currentFliesEaten <= 4) { 
        calculatedStars = 2;
      } else if (currentFliesEaten >= 5) { 
        calculatedStars = 3;
      }

      setStarRating(calculatedStars);
      setIsGameOver(true);
      setShowWinModal(true);
      onComplete(calculatedStars); 
      if (trapDelayTimer) {
          clearTimeout(trapDelayTimer);
          setTrapDelayTimer(null);
      }
    } else {
      if (trapDelayTimer) clearTimeout(trapDelayTimer);

      if (checkIfTrapped(newFrogPosition, wormPosition, updatedLilyPads, GRID_SIZE)) {
        const timerId = setTimeout(() => {
          setIsTrapped(true);
          setIsGameOver(true);
          setTrapDelayTimer(null);
        }, 1000);
        setTrapDelayTimer(timerId);
      } else {
        setTrapDelayTimer(null);
      }
    }
  }, [
    frogPosition, wormPosition, lilyPads, isGameOver, isTrapped, fliesEatenCount,
    checkIfTrapped, dynamicFlyPosition, clearActiveDynamicFly, trapDelayTimer,
    setShowWinModal, onComplete
  ]);

  useEffect(() => {
    if (gameStarted && !isGameOver && !isTrapped && !trapDelayTimer) {
        if (frogPosition.row === wormPosition.row && frogPosition.col === wormPosition.col) {
            let calculatedStars = 0;
            if (fliesEatenCount <= 1) { 
                calculatedStars = 1;
            } else if (fliesEatenCount >= 2 && fliesEatenCount <= 4) { 
                calculatedStars = 2;
            } else if (fliesEatenCount >= 5) { 
                calculatedStars = 3;
            }
            setStarRating(calculatedStars);
            onComplete(calculatedStars);
            setIsGameOver(true);
            setShowWinModal(true); 
        }
    }
  }, [gameStarted, frogPosition, wormPosition, isGameOver, fliesEatenCount, isTrapped, trapDelayTimer, setShowWinModal, onComplete]);

  const handleReplay = () => {
    handleRestart(false);
  };

  const handleNextLevelClick = () => {
    onExit?.();
  };

  return (
    <div className="min-h-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 text-white flex flex-col items-center justify-center p-4 selection:bg-teal-600 selection:text-white">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} disabled={!gameStarted} />
      <InstructionModal
          isOpen={isInstructionModalOpen}
          onClose={() => setIsInstructionModalOpen(false)}
          title="Frog Path Challenge Instructions"
      >
          <p>Help the hungry frog build a path to the caterpillar. Catch the flies along the way!</p>
      </InstructionModal>
      <div className="bg-slate-800/70 backdrop-blur-md shadow-2xl rounded-xl p-6 md:p-10 border border-slate-700 w-full max-w-max">
        <header className="mb-6 md:mb-8 text-center">
          <p className="text-teal-400 mt-3 text-xl sm:text-2xl font-semibold">
            {fliesEatenCount >= 5 ? (
              <span className="text-yellow-400">All flies caught!</span>
            ) : (
              <>
                Flies Eaten: <span className="text-yellow-400">{fliesEatenCount}</span>
              </>
            )}
          </p>
        </header>

        <main className="flex flex-row items-start justify-center space-x-4">
          <div className="flex flex-col items-center">
            <Grid
              frogPosition={frogPosition}
              wormPosition={wormPosition}
              lilyPads={lilyPads}
              dynamicFlyPosition={dynamicFlyPosition}
            />
            <Controls 
              onDirectionClick={handleDirectionClick} 
              isGameOver={isGameOver || isTrapped || !!trapDelayTimer}
              shuffledDirections={shuffledDirections}
            />
          </div>
          <CompassRose />
        </main>
      </div>

      <Modal 
        isOpen={isTrapped} 
        onRestart={() => handleRestart(true)} 
        title="Uh oh! The frog is trapped!"
        buttonText="Restart" 
      >
        {null}
      </Modal>

      {showWinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] p-4 antialiased">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
                Munch munch!
                <br />
                Challenge complete!
                </h2>
                <div className="flex justify-center my-5 md:my-8">
                  {[1, 2, 3].map((starIndex) => (
                    <StarIcon key={starIndex} filled={starIndex <= starRating} className="w-12 h-12 md:w-16 md:h-16 mx-1.5 md:mx-2"/>
                  ))}
                </div>
                {starRating < 3 && (
                    <p className="text-sm md:text-base text-gray-700/70 mt-3 md:mt-4 px-2">
                        Collect more flies to get more stars.
                    </p>
                )}
                <div className="mt-6 md:mt-8 flex justify-center items-start gap-4">
                    <button
                        onClick={handleReplay}
                        className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                        aria-label="Replay the game"
                    >
                        Replay
                    </button>
                    <div className="flex flex-col items-center gap-2">
                      {(() => {
                        const bestStars = (progress && levelId && progress[levelId]) || 0;
                        const canProceed = starRating >= 2 || bestStars >= 2;
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

      {!gameStarted && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-opacity duration-300 ease-in-out"
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-screen-title"
        >
          <StartScreen onStartGame={handleStartGame} />
        </div>
      )}
    </div>
  );
};

export default CustomFrogGameChallenge;