import React, { useState, useCallback, useEffect } from 'react';
import type { LevelComponentProps } from '../../types';
import { Grid } from './custom-compass-challenge-3/Grid';
import { Controls } from './custom-compass-challenge-3/Controls';
import { CompassRose } from './custom-compass-challenge-3/CompassRose';
import { Modal } from './custom-compass-challenge-3/Modal';
import { Position, Direction, Rotation } from './custom-compass-challenge-3/types';
import { GRID_SIZE, INITIAL_EXPLORER_POS, MOVES_FOR_LEVEL_2_TRIGGER, OBSTACLE_POSITIONS } from './custom-compass-challenge-3/constants';
import InstructionButton from '../../components/InstructionButton';
import InstructionModal from '../../components/InstructionModal';

// Helper function to generate a new treasure position
const generateNewTreasurePosition = (
  explorerInitialPos: Position,
  obstacles: Position[],
  gridSize: number,
  initialMinManhattanDistance: number
): Position => {
  let attempts = 0;
  const MAX_RANDOM_ATTEMPTS_PER_DISTANCE = 50; 

  for (let currentMinDistance = initialMinManhattanDistance; currentMinDistance >= 0; currentMinDistance--) {
    for (attempts = 0; attempts < MAX_RANDOM_ATTEMPTS_PER_DISTANCE; attempts++) {
      const x = Math.floor(Math.random() * gridSize) + 1;
      const y = Math.floor(Math.random() * gridSize) + 1;
      const newPos: Position = { x, y };

      const isExplorerStart = newPos.x === explorerInitialPos.x && newPos.y === explorerInitialPos.y;
      const isObstacle = obstacles.some(op => op.x === newPos.x && op.y === newPos.y);
      const manhattanDistance = Math.abs(newPos.x - explorerInitialPos.x) + Math.abs(newPos.y - explorerInitialPos.y);

      if (!isExplorerStart && !isObstacle && manhattanDistance >= currentMinDistance) {
        return newPos;
      }
    }
  }

  console.warn(`Random treasure generation failed for distance ${initialMinManhattanDistance} after all attempts. Iterating systematically.`);
  for (let y_fb = 1; y_fb <= gridSize; y_fb++) {
    for (let x_fb = 1; x_fb <= gridSize; x_fb++) {
      const newPos: Position = { x: x_fb, y: y_fb };
      const isExplorerStart = newPos.x === explorerInitialPos.x && newPos.y === explorerInitialPos.y;
      const isObstacle = obstacles.some(op => op.x === newPos.x && op.y === newPos.y);
      if (!isExplorerStart && !isObstacle) {
        return newPos;
      }
    }
  }
  
  console.error("CRITICAL: Could not place treasure anywhere. Defaulting to (gridSize, gridSize).");
  return { x: gridSize, y: gridSize }; 
};


const CustomCompassChallenge3: React.FC<LevelComponentProps> = ({ onComplete, onExit }) => {
  const [explorerPosition, setExplorerPosition] = useState<Position>(INITIAL_EXPLORER_POS);
  const [treasurePosition, setTreasurePosition] = useState<Position>(() => 
    generateNewTreasurePosition(INITIAL_EXPLORER_POS, OBSTACLE_POSITIONS, GRID_SIZE, 9)
  );
  const [movesMade, setMovesMade] = useState<number>(0);
  const [currentLevel, setCurrentLevel] = useState<1 | 2>(1);
  const [mapRotation, setMapRotation] = useState<Rotation>(0);
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [starsEarned, setStarsEarned] = useState<number | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  // Resets game for replay without showing initial instructions. Used by Modal's "Replay" button.
  const replayGame = () => {
    setExplorerPosition(INITIAL_EXPLORER_POS);
    setTreasurePosition(generateNewTreasurePosition(INITIAL_EXPLORER_POS, OBSTACLE_POSITIONS, GRID_SIZE, 9));
    setMovesMade(0);
    setCurrentLevel(1);
    setMapRotation(0);
    setModalMessage("Guide the explorer (🚶) to the treasure (💎)! Avoid the trees (🌲).");
    setIsModalOpen(true);
    setIsGameOver(false);
    setStarsEarned(null);
  };
  
  const handleMove = useCallback((buttonPressed: Direction) => {
    if (isGameOver || isModalOpen) return;

    let dx = 0;
    let dy = 0;

    if (buttonPressed === 'N') dy = -1;      
    else if (buttonPressed === 'S') dy = 1; 
    else if (buttonPressed === 'E') dx = 1; 
    else if (buttonPressed === 'W') dx = -1;
    
    const newMovesMade = movesMade + 1;
    setMovesMade(newMovesMade);

    const potentialNewX = explorerPosition.x + dx;
    const potentialNewY = explorerPosition.y + dy;

    let canMoveToTarget = false;
    if (dx !== 0 || dy !== 0) {
        const isWithinBounds = potentialNewX >= 1 && potentialNewX <= GRID_SIZE && potentialNewY >= 1 && potentialNewY <= GRID_SIZE;
        if (isWithinBounds) {
            const isTargetObstacle = OBSTACLE_POSITIONS.some(op => op.x === potentialNewX && op.y === potentialNewY);
            if (!isTargetObstacle) {
                canMoveToTarget = true;
            }
        }
    }
    
    let finalExplorerX = explorerPosition.x;
    let finalExplorerY = explorerPosition.y;

    if (canMoveToTarget) {
        setExplorerPosition({ x: potentialNewX, y: potentialNewY });
        finalExplorerX = potentialNewX;
        finalExplorerY = potentialNewY;
    }

    if (finalExplorerX === treasurePosition.x && finalExplorerY === treasurePosition.y) {
        let stars = 0;
        if (newMovesMade <= 10) {
            stars = 3;
        } else if (newMovesMade <= 12) {
            stars = 2;
        } else {
            stars = 1;
        }
        setStarsEarned(stars);
        onComplete(stars); // Notify main app of completion

        // Set only the base win message. The modal will handle the conditional hint.
        const baseWinMessage = "You found the treasure! Challenge complete.";
        setModalMessage(baseWinMessage);
        setIsModalOpen(true);
        setIsGameOver(true);
        return; 
    }

    if (newMovesMade === MOVES_FOR_LEVEL_2_TRIGGER && currentLevel === 1 && !isGameOver) {
        setModalMessage("Whoosh! A gust of wind has spun the map. Can your explorer still make it to the treasure?");
        setIsModalOpen(true);
    }

  }, [explorerPosition, treasurePosition, movesMade, currentLevel, isGameOver, isModalOpen, onComplete]);
  

  const handleCloseModal = () => {
    const wasGameOverModal = isGameOver; // Capture state before it's potentially changed by replayGame
    const wasLevelTransitionModal = modalMessage?.startsWith("Whoosh!");

    setIsModalOpen(false); // Always close the current modal first

    // This now only handles replay for 1-star finish, or non-game-over modals
    if (wasGameOverModal) {
      replayGame();
    } else if (wasLevelTransitionModal) {
      setCurrentLevel(2);
      const possibleRotations: Rotation[] = [90, 180, 270];
      const randomRotation = possibleRotations[Math.floor(Math.random() * possibleRotations.length)];
      setMapRotation(randomRotation);
      setModalMessage(null); // Clear the "Whoosh" message
    } else {
      // For other modals (like initial instructions modal being closed by its "Start" button)
      setModalMessage(null); // Clear the message
    }
  };
  
  useEffect(() => {
    // Show initial instructions modal only on the very first load.
    if (movesMade === 0 && currentLevel === 1 && !isGameOver && !isModalOpen) {
        setModalMessage("Guide the explorer (🚶) to the treasure (💎)! Avoid the trees (🌲).");
        setIsModalOpen(true);
    }
  }, []); // Empty dependency array ensures this runs once on mount.


  return (
    <div className="min-h-full h-full bg-gradient-to-br from-sky-400 to-blue-600 flex flex-col items-center justify-center p-4 text-white selection:bg-sky-700 selection:text-white">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} disabled={isModalOpen && movesMade === 0 && currentLevel === 1} />
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        title="Explorer Grid Challenge Instructions"
      >
        <p>Guide the explorer (🚶) to the treasure (💎)! Avoid the trees (🌲).</p>
      </InstructionModal>
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-xl p-6 md:p-8 max-w-lg w-full">
        
        <div className="relative flex flex-col items-center mb-6 pt-6"> 
          <CompassRose rotation={mapRotation} />
          <Grid
            gridSize={GRID_SIZE}
            explorerPosition={explorerPosition}
            treasurePosition={treasurePosition}
            mapRotation={mapRotation}
            obstaclePositions={OBSTACLE_POSITIONS}
          />
        </div>

        <Controls onMove={handleMove} disabled={isModalOpen || isGameOver} />

      </div>
      
      {isModalOpen && modalMessage && (
        <Modal 
            message={modalMessage} 
            onClose={handleCloseModal}
            onExit={onExit}
            stars={isGameOver ? starsEarned : null} 
        />
      )}
      
    </div>
  );
};

export default CustomCompassChallenge3;