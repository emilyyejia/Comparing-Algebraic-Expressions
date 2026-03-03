import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../../types';
import Pointer from '../components/custom/Compass';
import LevelIndicator from '../components/custom/LevelIndicator';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

type DirectionName = 'North' | 'East' | 'South' | 'West';

// For static definitions in the LEVELS array
interface LevelDefinition {
  id: number;
  instructionTitleTemplate: string; 
  detailedInstructionTemplate: string; 
  successThreshold: number;
  visualTiltDegrees?: number;
  hasRandomInitialOrientation?: boolean;
  randomizationType?: 'hide2ofESW_target1hidden' | 'hideESW_target1ofESW';
  targetAngle?: number; // Pre-defined for non-randomized, or base for randomized
  targetDirectionName?: DirectionName; // Pre-defined for non-randomized
  hiddenDirectionLabels?: Array<DirectionName>; // Pre-defined for non-randomized
}

// For the activeLevel state, after processing placeholders and randomization
interface ProcessedLevel {
    id: number;
    instructionTitle: React.ReactNode;
    detailedInstruction: React.ReactNode;
    successThreshold: number;
    visualTiltDegrees: number;
    hasRandomInitialOrientation: boolean;
    targetAngle: number; 
    targetDirectionName: DirectionName;
    hiddenDirectionLabels: Array<DirectionName>;
}


const DIRECTIONS_CONFIG: Record<DirectionName, { angle: number }> = {
  'North': { angle: 0 },
  'East': { angle: 90 },
  'South': { angle: 180 },
  'West': { angle: 270 },
};
const RANDOMIZABLE_DIRECTIONS: DirectionName[] = ['East', 'South', 'West'];

const DIRECTION_ABBREVIATIONS: Record<DirectionName, string> = {
  'North': 'N',
  'East': 'E',
  'South': 'S',
  'West': 'W',
};

// FIX: Replace `JSX.Element` with `React.ReactElement` to resolve "Cannot find namespace 'JSX'" error.
const formatDirectionForInstructionJSX = (directionName: DirectionName): React.ReactElement => {
  return (
    <strong className="font-bold">
      {directionName} ({DIRECTION_ABBREVIATIONS[directionName]})
    </strong>
  );
};

function processTemplateToJsxMultiple(template: string, replacements: Record<string, React.ReactNode>): React.ReactNode {
    let segments: React.ReactNode[] = [template];

    for (const placeholder in replacements) {
        const replacement = replacements[placeholder];
        let newSegments: React.ReactNode[] = [];
        segments.forEach(segment => {
            if (typeof segment === 'string') {
                const parts = segment.split(placeholder);
                parts.forEach((part, index) => {
                    if (part) newSegments.push(part); 
                    if (index < parts.length - 1) {
                        newSegments.push(replacement); 
                    }
                });
            } else {
                newSegments.push(segment); 
            }
        });
        segments = newSegments;
    }
    return <>{segments.map((s, i) => <React.Fragment key={i}>{s}</React.Fragment>)}</>;
}


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

const generateRandomizedLevelProps = (baseLevel: LevelDefinition): Pick<ProcessedLevel, 'targetAngle' | 'targetDirectionName' | 'hiddenDirectionLabels'> & { hiddenCountText?: string } => {
  let targetDirectionName: DirectionName;
  let hiddenDirectionLabels: DirectionName[] = [];
  let hiddenCountText = "";

  if (baseLevel.randomizationType === 'hide2ofESW_target1hidden') {
    const shuffledDirections = [...RANDOMIZABLE_DIRECTIONS].sort(() => 0.5 - Math.random());
    const directionsToHide = shuffledDirections.slice(0, 2) as DirectionName[];
    targetDirectionName = directionsToHide[Math.floor(Math.random() * directionsToHide.length)];
    hiddenDirectionLabels = directionsToHide;
    hiddenCountText = "Two";
  } else if (baseLevel.randomizationType === 'hideESW_target1ofESW') {
    hiddenDirectionLabels = [...RANDOMIZABLE_DIRECTIONS]; 
    targetDirectionName = RANDOMIZABLE_DIRECTIONS[Math.floor(Math.random() * RANDOMIZABLE_DIRECTIONS.length)];
    hiddenCountText = "Three";
  } else {
    targetDirectionName = baseLevel.targetDirectionName ?? 'North';
    hiddenDirectionLabels = baseLevel.hiddenDirectionLabels ?? [];
  }

  const targetAngle = DIRECTIONS_CONFIG[targetDirectionName].angle;

  return {
    targetAngle,
    targetDirectionName,
    hiddenDirectionLabels,
    hiddenCountText,
  };
};

const INSTRUCTION_TEMPLATE_STANDARD = "Turn the arrow to {targetDirection}.";

// Define all level configurations
const level1: LevelDefinition = { id: 1, targetAngle: 90, targetDirectionName: "East", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection} at 90 degrees. The '{targetDirection}' label is not shown.", hiddenDirectionLabels: ['East'], successThreshold: 2 };
const level2: LevelDefinition = { id: 2, targetAngle: 270, targetDirectionName: "West", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection} at 270 degrees. The '{targetDirection}' label is hidden.", hiddenDirectionLabels: ['West'], successThreshold: 1 };
const level3: LevelDefinition = { id: 3, targetAngle: 180, targetDirectionName: "South", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection} at 180 degrees. The '{targetDirection}' label is hidden.", hiddenDirectionLabels: ['South'], successThreshold: 2 };

const level6: LevelDefinition = { id: 6, instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection}. {northMention} is visible. {hiddenCount} other directions are hidden.", successThreshold: 2, visualTiltDegrees: 0, hasRandomInitialOrientation: false, randomizationType: 'hide2ofESW_target1hidden' };
const level7: LevelDefinition = { id: 7, instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection}. {northMention} is visible. {hiddenCount} other directions are hidden.", successThreshold: 2, visualTiltDegrees: 0, hasRandomInitialOrientation: false, randomizationType: 'hide2ofESW_target1hidden' };
const level8: LevelDefinition = { id: 8, instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection}. {northMention} is visible. {hiddenCount} other directions are hidden.", successThreshold: 2, visualTiltDegrees: 0, hasRandomInitialOrientation: false, randomizationType: 'hide2ofESW_target1hidden' };

const level4: LevelDefinition = { id: 4, instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection}. Only the '{northMention}' label is shown.", successThreshold: 2, visualTiltDegrees: 0, hasRandomInitialOrientation: false, randomizationType: 'hideESW_target1ofESW' };
const level5: LevelDefinition = { id: 5, instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection}. Only the '{northMention}' label is shown.", successThreshold: 2, visualTiltDegrees: 0, hasRandomInitialOrientation: false, randomizationType: 'hideESW_target1ofESW' };
const level12: LevelDefinition = { id: 12, instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection}. Only the '{northMention}' label is shown.", successThreshold: 2, visualTiltDegrees: 0, hasRandomInitialOrientation: false, randomizationType: 'hideESW_target1ofESW' };

const level9: LevelDefinition = { id: 9, targetAngle: 180, targetDirectionName: "South", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection} at 180 degrees. It is tilted, and the '{targetDirection}' label is hidden.", hiddenDirectionLabels: ['South'], successThreshold: 2, visualTiltDegrees: 20 };

const level10: LevelDefinition = { id: 10, targetAngle: 90, targetDirectionName: "East", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection} at 90 degrees from {northMention}. It has a random initial orientation. The '{targetDirection}' label is hidden.", hiddenDirectionLabels: ['East'], successThreshold: 3, visualTiltDegrees: 0, hasRandomInitialOrientation: true };
const level11: LevelDefinition = { id: 11, targetAngle: 270, targetDirectionName: "West", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection} at 270° from {northMention}. It is randomly oriented. The '{targetDirection}' label is hidden.", hiddenDirectionLabels: ['West'], successThreshold: 3, visualTiltDegrees: 0, hasRandomInitialOrientation: true };

const level13: LevelDefinition = { id: 13, targetAngle: 180, targetDirectionName: "South", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection} at 180° from {northMention}. It has a random initial orientation. The '{eastMention}' and '{targetDirection}' labels are hidden.", hiddenDirectionLabels: ['East', 'South'], successThreshold: 3, visualTiltDegrees: 0, hasRandomInitialOrientation: true };
const level14: LevelDefinition = { id: 14, targetAngle: 270, targetDirectionName: "West", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "Find {targetDirection} at 270° from {northMention}. It has a random initial orientation. The '{eastMention}' and '{targetDirection}' labels are hidden.", hiddenDirectionLabels: ['East', 'West'], successThreshold: 3, visualTiltDegrees: 0, hasRandomInitialOrientation: true };
const level15: LevelDefinition = { id: 15, targetAngle: 180, targetDirectionName: "South", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "It is randomly rotated. Find {targetDirection} (180° from {northMention}). The '{targetDirection}' and '{westMention}' labels are hidden.", hiddenDirectionLabels: ['South', 'West'], successThreshold: 3, visualTiltDegrees: 0, hasRandomInitialOrientation: true };

const level16: LevelDefinition = { id: 16, targetAngle: 90, targetDirectionName: "East", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "It is randomly rotated. Find {targetDirection} (90° clockwise from {northMention}). All direction labels except {northMention} are hidden.", hiddenDirectionLabels: ['East', 'South', 'West'], successThreshold: 3, visualTiltDegrees: 0, hasRandomInitialOrientation: true };
const level17: LevelDefinition = { id: 17, targetAngle: 270, targetDirectionName: "West", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "It is randomly rotated. Find {targetDirection} (270° from {northMention} or 90° counter-clockwise from {northMention}). All direction labels except {northMention} are hidden.", hiddenDirectionLabels: ['East', 'South', 'West'], successThreshold: 3, visualTiltDegrees: 0, hasRandomInitialOrientation: true };
const level18: LevelDefinition = { id: 18, targetAngle: 180, targetDirectionName: "South", instructionTitleTemplate: INSTRUCTION_TEMPLATE_STANDARD, detailedInstructionTemplate: "It is randomly rotated. Find {targetDirection} (180° from {northMention}). All direction labels except {northMention} are hidden.", hiddenDirectionLabels: ['East', 'South', 'West'], successThreshold: 3, visualTiltDegrees: 0, hasRandomInitialOrientation: true };

// New LEVELS array with 12 levels (2 per challenge type)
const LEVELS: LevelDefinition[] = [
  // Type 1: Upright, 1 hidden
  level1, 
  level3,
  // Type 2: Upright, 2 hidden (randomized)
  level6, 
  level7, 
  // Type 3: Upright, 3 hidden (randomized)
  level4, 
  level5, 
  // Type 4: Tilted, 1 hidden
  level9, // Visually tilted
  level10, // Random initial orientation
  // Type 5: Tilted (Random Orient), 2 hidden
  level13,
  level14,
  // Type 6: Tilted (Random Orient), 3 hidden
  level16,
  level17,
];

const CustomCompassChallenge: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress, progress, levelId }) => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(() => partialProgress?.currentLevelIndex || 0);
  const [levelCompleted, setLevelCompleted] = useState<boolean>(false);
  const [activeLevel, setActiveLevel] = useState<ProcessedLevel | null>(null);

  const [startTime, setStartTime] = useState<number | null>(() => partialProgress?.startTime || null);
  const [starsAwarded, setStarsAwarded] = useState<number>(() => partialProgress?.starsAwarded || 0);
  const [finalTimeDisplay, setFinalTimeDisplay] = useState<number | null>(() => partialProgress?.finalTimeDisplay || null);
  const [showIntroduction, setShowIntroduction] = useState<boolean>(() => !partialProgress);
  const isCompletedRef = useRef(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  // Save state on unmount
  useEffect(() => {
    return () => {
      const isGameFinished = currentLevelIndex === LEVELS.length - 1 && levelCompleted;
      if (!isCompletedRef.current && onSavePartialProgress && !isGameFinished && !showIntroduction) {
        onSavePartialProgress({
          currentLevelIndex,
          startTime,
          starsAwarded,
          finalTimeDisplay,
        });
      }
    };
  }, [onSavePartialProgress, currentLevelIndex, startTime, starsAwarded, finalTimeDisplay, levelCompleted, showIntroduction]);

  // Effect for loading level data
  useEffect(() => {
    const baseLevelData = LEVELS[currentLevelIndex];
    if (!baseLevelData) {
        console.error("Error: Could not find level data for index", currentLevelIndex);
        if (currentLevelIndex >= LEVELS.length && LEVELS.length > 0) {
        }
        return;
    }
    
    let dynamicProps = {};
    let hiddenCountTextValue = "";

    if (baseLevelData.randomizationType) {
      const randomData = generateRandomizedLevelProps(baseLevelData);
      dynamicProps = randomData; 
      hiddenCountTextValue = randomData.hiddenCountText || "";
    }
    
    const resolvedTargetDirectionName = (dynamicProps as any).targetDirectionName || baseLevelData.targetDirectionName!;
    const resolvedTargetAngle = (dynamicProps as any).targetAngle ?? baseLevelData.targetAngle!;
    const resolvedHiddenDirectionLabels = (dynamicProps as any).hiddenDirectionLabels || baseLevelData.hiddenDirectionLabels || [];

    const replacements: Record<string, React.ReactNode> = {
        "{targetDirection}": formatDirectionForInstructionJSX(resolvedTargetDirectionName),
        "{northMention}": formatDirectionForInstructionJSX("North"),
        "{eastMention}": formatDirectionForInstructionJSX("East"),
        "{southMention}": formatDirectionForInstructionJSX("South"),
        "{westMention}": formatDirectionForInstructionJSX("West"),
        "{hiddenCount}": hiddenCountTextValue,
    };

    const processedLevelData: ProcessedLevel = {
      id: baseLevelData.id,
      instructionTitle: processTemplateToJsxMultiple(baseLevelData.instructionTitleTemplate, replacements),
      detailedInstruction: processTemplateToJsxMultiple(baseLevelData.detailedInstructionTemplate, replacements),
      successThreshold: baseLevelData.successThreshold,
      visualTiltDegrees: baseLevelData.visualTiltDegrees || 0,
      hasRandomInitialOrientation: baseLevelData.hasRandomInitialOrientation || false,
      targetAngle: resolvedTargetAngle,
      targetDirectionName: resolvedTargetDirectionName,
      hiddenDirectionLabels: resolvedHiddenDirectionLabels,
    };
    
    setActiveLevel(processedLevelData);
    setLevelCompleted(false); 
  }, [currentLevelIndex]); 

  // Effect for managing startTime
  useEffect(() => {
    if (!showIntroduction && currentLevelIndex === 0 && startTime === null) {
      setStartTime(Date.now());
    }
  }, [showIntroduction, currentLevelIndex, startTime]);


  const handleSuccess = useCallback(() => {
    setLevelCompleted(true);
    const isLastLevel = currentLevelIndex === LEVELS.length - 1;

    if (isLastLevel && startTime !== null && finalTimeDisplay === null) {
      const endTime = Date.now();
      const timeTakenSeconds = (endTime - startTime) / 1000;
      setFinalTimeDisplay(timeTakenSeconds);

      let stars = 1;
      if (timeTakenSeconds <= 60) { // 3 Stars
        stars = 3;
      } else if (timeTakenSeconds <= 90) { // 2 Stars
        stars = 2;
      }
      setStarsAwarded(stars);
      // Save progress as soon as the challenge is complete
      isCompletedRef.current = true;
      onComplete(stars);
    }
  }, [currentLevelIndex, startTime, finalTimeDisplay, onComplete]);

  const handleNextLevel = useCallback(() => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(prevIndex => prevIndex + 1);
    }
  }, [currentLevelIndex]);
  
  const handleNextLevelClick = () => {
    onExit?.();
  };

  const handleReplay = () => {
    onSavePartialProgress?.(null);
    setCurrentLevelIndex(0); 
    setStartTime(null); 
    setShowIntroduction(true);  
    setStarsAwarded(0);
    setFinalTimeDisplay(null);
  };

  const handleStartChallenge = () => {
    setShowIntroduction(false);
  };
  
  const allLevelsReallyComplete = levelCompleted && currentLevelIndex === LEVELS.length - 1;
  const hintText: string = ""; 

  // Effect to automatically advance to the next level
  useEffect(() => {
    if (levelCompleted && !allLevelsReallyComplete) {
      const timer = setTimeout(() => {
        handleNextLevel();
      }, 1500); // Wait 1.5 seconds on the "Correct!" screen

      return () => clearTimeout(timer); // Cleanup on unmount or re-render
    }
  }, [levelCompleted, allLevelsReallyComplete, handleNextLevel]);

  return (
    <div className="min-h-full h-full bg-[#132B53] flex flex-col items-center justify-center p-4 text-center select-none antialiased relative">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} disabled={showIntroduction} />
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        title="Compass Challenge Instructions"
      >
        <p>Turn the arrow. Click and drag it with your mouse, or use the left and right keys on your keyboard.</p>
      </InstructionModal>
      
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        <LevelIndicator level={currentLevelIndex + 1} totalLevels={LEVELS.length} />
      </div>
      
      <div className={`flex-grow flex flex-col justify-center items-center w-full transition-all duration-300 ease-in-out ${showIntroduction && activeLevel ? 'blur-sm pointer-events-none' : ''}`}>
        {!activeLevel && !showIntroduction && (
          <p className="text-white text-2xl">Loading level...</p>
        )}

        {activeLevel && !allLevelsReallyComplete && (
          <>
            <header className="mb-6 md:mb-8">
              <h1 className="text-3xl md:text-4xl font-semibold text-white tracking-tight">
                {activeLevel.instructionTitle}
              </h1>
              {!levelCompleted && hintText && (
                 <p className="text-sm md:text-base text-white/70 mt-2">{hintText.endsWith('.') ? hintText : hintText + '.'}</p>
              )}
            </header>

            <Pointer
              key={`${activeLevel.id}-${activeLevel.targetAngle}-${activeLevel.hiddenDirectionLabels.join('')}-${activeLevel.hasRandomInitialOrientation}`}
              levelId={activeLevel.id}
              targetAngle={activeLevel.targetAngle} 
              targetDirectionName={activeLevel.targetDirectionName}
              successThreshold={activeLevel.successThreshold}
              hiddenDirectionLabels={activeLevel.hiddenDirectionLabels}
              onSuccess={handleSuccess}
              isLevelCompleted={levelCompleted}
              instructionText={activeLevel.detailedInstruction}
              visualTiltDegrees={activeLevel.visualTiltDegrees}
              hasRandomInitialOrientation={activeLevel.hasRandomInitialOrientation}
            />
          </>
        )}
      </div> 
      
      {showIntroduction && activeLevel && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[100] p-4"
            role="dialog" 
            aria-modal="true"
            aria-describedby="intro-message-modal"
        >
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl max-w-lg w-full text-center">
            <p id="intro-message-modal" className="text-lg md:text-xl mb-8 leading-relaxed text-gray-800">
              Turn the arrow. Click and drag it with your mouse, or use the left and right keys on your keyboard.
            </p>
            <button
              onClick={handleStartChallenge}
              className="px-10 py-3 bg-[#4e7296] hover:brightness-95 text-white font-semibold text-lg rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#4e7296] focus:ring-opacity-75"
              aria-label="Start the challenge"
            >
              Start
            </button>
          </div>
        </div>
      )}

      {allLevelsReallyComplete && (
         <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] p-4 antialiased">
           <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
             <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
               Challenge complete!
             </h2>
             <div className="flex justify-center my-5 md:my-8">
               {[1, 2, 3].map((starIndex) => (
                 <StarIcon key={starIndex} filled={starIndex <= starsAwarded} className="w-12 h-12 md:w-16 md:h-16 mx-1.5 md:mx-2"/>
               ))}
             </div>
             {finalTimeDisplay !== null && (
                 <p className="text-lg md:text-xl text-gray-800 mb-1">
                   Your time: <span className="font-semibold">{finalTimeDisplay.toFixed(1)}</span> seconds
                 </p>
             )}
             {starsAwarded < 3 && (
                <p className="text-sm md:text-base text-gray-700/70 mt-3 md:mt-4 px-2">
                    Complete the challenge as fast as you can to get more stars.
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
                        const canProceed = starsAwarded >= 2 || bestStars >= 2;
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
    </div>
  );
};

export default CustomCompassChallenge;