
import React, { useState, useRef, useEffect, useCallback } from 'react';

const INTERACTIVE_AREA_SIZE_CLASSES = "w-72 h-72 md:w-96 md:h-96"; // Tailwind classes for size
const ARROW_WIDTH = 20; // px
const ARROW_VISUAL_HEIGHT_RATIO = 0.30; // Arrow length as a ratio of diameter

type DirectionName = 'North' | 'East' | 'South' | 'West';

const ARROW_ICON_SVG_VIEWBOX_HEIGHT = 100; 

const ArrowIcon: React.FC = () => (
  <svg
    width="100%"
    height="100%"
    viewBox={`0 0 24 ${ARROW_ICON_SVG_VIEWBOX_HEIGHT}`} 
    preserveAspectRatio="xMidYMax meet" 
    xmlns="http://www.w3.org/2000/svg"
    className="pointer-events-none"
  >
    <rect x="10" y="12" width="4" height="88" fill="currentColor" rx="2"/> 
    <polygon points="12,0 5,15 19,15" fill="currentColor" /> 
  </svg>
);

interface PointerProps {
  levelId: number;
  targetAngle: number;
  targetDirectionName: DirectionName; 
  successThreshold: number; 
  hiddenDirectionLabels?: Array<DirectionName>;
  onSuccess: () => void;
  isLevelCompleted: boolean;
  instructionText: React.ReactNode; 
  visualTiltDegrees?: number;
  hasRandomInitialOrientation?: boolean;
}

const Pointer: React.FC<PointerProps> = ({ 
  levelId,
  targetAngle, 
  targetDirectionName, 
  successThreshold, 
  hiddenDirectionLabels = [], 
  onSuccess, 
  isLevelCompleted, 
  instructionText,
  visualTiltDegrees = 0,
  hasRandomInitialOrientation = false,
}) => {
  const [rotation, setRotation] = useState<number>(0); 
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const interactiveAreaRef = useRef<HTMLDivElement>(null);
  const interactiveAreaCenterRef = useRef<{ x: number; y: number } | null>(null);
  const [interactiveAreaDiameter, setInteractiveAreaDiameter] = useState<number>(288); 
  const [showHoldHint, setShowHoldHint] = useState(false);
  const keyPressTimestampsRef = useRef<number[]>([]);

  const [bodyActualRotation] = useState<number>(() => {
    if (hasRandomInitialOrientation) {
       return Math.random() * 360;
    }
    return visualTiltDegrees; 
  });

  const isLevelCompletedRef = useRef(isLevelCompleted);
  useEffect(() => {
    isLevelCompletedRef.current = isLevelCompleted;
  }, [isLevelCompleted]);

  useEffect(() => {
    const updateSize = () => {
      if (interactiveAreaRef.current) {
        setInteractiveAreaDiameter(interactiveAreaRef.current.offsetWidth);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const arrowVisualHeight = interactiveAreaDiameter * ARROW_VISUAL_HEIGHT_RATIO;
  
  const isCorrectAngle = rotation >= (targetAngle - successThreshold) && rotation <= (targetAngle + successThreshold);

  useEffect(() => {
    if (isCorrectAngle && !isLevelCompleted) {
      onSuccess();
    }
  }, [isCorrectAngle, isLevelCompleted, onSuccess]);


  const handleDragStart = useCallback((event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isLevelCompletedRef.current || !interactiveAreaRef.current) return;

    if (event.type === 'mousedown') {
      (event as React.MouseEvent<HTMLDivElement>).preventDefault();
    }

    const rect = interactiveAreaRef.current.getBoundingClientRect();
    interactiveAreaCenterRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setIsDragging(true);
  }, []); // isLevelCompletedRef is not needed as dependency

  const handleRelease = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMove = useCallback((event: MouseEvent | TouchEvent) => {
    if (!isDragging || !interactiveAreaCenterRef.current || isLevelCompletedRef.current) return;

    if (event.type === 'touchmove' && event.cancelable) {
      event.preventDefault();
    }

    let clientX: number, clientY: number;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      if (event.touches.length === 0) return;
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    const { x: centerX, y: centerY } = interactiveAreaCenterRef.current;
    const dx = clientX - centerX;
    const dy = clientY - centerY;

    const angleRad = Math.atan2(dy, dx);
    const angleDeg = angleRad * (180 / Math.PI);
    const rotationFromScreenUp = angleDeg + 90;
    let newRotation = rotationFromScreenUp - bodyActualRotation; 
    
    newRotation = (newRotation % 360 + 360) % 360; 

    setRotation(newRotation);
  }, [isDragging, bodyActualRotation]); // isLevelCompletedRef not needed as dependency

  useEffect(() => {
    if (isDragging && !isLevelCompletedRef.current) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleRelease);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleRelease);
      window.addEventListener('touchcancel', handleRelease);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleRelease);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleRelease);
      window.removeEventListener('touchcancel', handleRelease);
    };
  }, [isDragging, handleMove, handleRelease]); // isLevelCompletedRef not needed as dependency

  // Global keyboard listener for arrow rotation and hint logic
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (isLevelCompletedRef.current) return;

      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'BUTTON')) {
        return;
      }
      
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
        return;
      }

      event.preventDefault(); // Prevent page scroll for arrow keys

      // --- Hint logic for using keyboard controls ---
      if (showHoldHint) {
        // If hint is showing, hide it on key hold.
        if (event.repeat) {
          setShowHoldHint(false);
        }
      } else {
        // If hint is NOT showing...
        if (event.repeat) {
          // User is holding, so clear the tap detector to prevent the hint from showing.
          keyPressTimestampsRef.current = [];
        } else {
          // This is a distinct key press, track it for tapping.
          const now = Date.now();
          const recentTimestamps = keyPressTimestampsRef.current.filter(ts => now - ts < 1500);
          recentTimestamps.push(now);
          keyPressTimestampsRef.current = recentTimestamps;

          if (recentTimestamps.length >= 4) {
            setShowHoldHint(true);
            keyPressTimestampsRef.current = []; // Reset detector so it can trigger again later.
          }
        }
      }
      // --- End hint logic ---
        
      // --- Rotation logic ---
      const step = event.shiftKey ? 1 : 15;
      if (event.key === 'ArrowLeft') {
        setRotation(prevRotation => (prevRotation - step + 360) % 360);
      } else if (event.key === 'ArrowRight') {
        setRotation(prevRotation => (prevRotation + step + 360) % 360);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [showHoldHint]);


  const allPoints: Array<{id: DirectionName, display: string, position: string, className: string}> = [
    { id: 'North', display: 'N', position: 'top-6 left-1/2 -translate-x-1/2', className: 'text-xl md:text-2xl text-red-600 font-semibold' },
    { id: 'East', display: 'E', position: 'right-6 top-1/2 -translate-y-1/2', className: 'text-lg md:text-xl text-gray-800 font-semibold' },
    { id: 'South', display: 'S', position: 'bottom-6 left-1/2 -translate-x-1/2', className: 'text-lg md:text-xl text-gray-800 font-semibold' },
    { id: 'West', display: 'W', position: 'left-6 top-1/2 -translate-y-1/2', className: 'text-lg md:text-xl text-gray-800 font-semibold' },
  ];

  const visibleDirections = allPoints.filter(dir => !hiddenDirectionLabels?.includes(dir.id));

  const calculateProgressFeedback = useCallback((currentRotation: number): { percent: number; color: string } => {
    if (isLevelCompletedRef.current) return { percent: 100, color: 'bg-green-500' };

    const diff = Math.abs(currentRotation - targetAngle);
    const shortestAngleDiff = Math.min(diff, 360 - diff); 

    const percent = Math.max(0, (1 - shortestAngleDiff / 180) * 100);

    let colorClass = 'bg-red-500'; // Fail color
    if (shortestAngleDiff <= successThreshold) {
      colorClass = 'bg-green-500'; // Success color
    } else if (shortestAngleDiff <= 90) { // from successThreshold up to 90 degrees away
      colorClass = 'bg-yellow-500'; // Warning color
    }

    return { percent, color: colorClass };
  }, [targetAngle, successThreshold]); // isLevelCompletedRef not needed as dependency

  const { percent: progressPercent, color: progressBarColor } = calculateProgressFeedback(rotation);
  
  return (
    <div className="flex flex-col items-center">
      <div
        ref={interactiveAreaRef}
        className={`${INTERACTIVE_AREA_SIZE_CLASSES} rounded-full border-4 bg-blue-100/90 backdrop-blur-sm relative flex justify-center items-center shadow-2xl transition-all duration-300 ${isCorrectAngle ? 'border-green-500' : 'border-blue-500'}`}
        aria-roledescription="interactive area"
        style={{ transform: `rotate(${bodyActualRotation}deg)` }} 
      >
        <div className="absolute w-[calc(100%-24px)] h-[calc(100%-24px)] rounded-full border-2 border-blue-500/70" aria-hidden="true"></div>
        <div className="absolute w-[calc(100%-32px)] h-[calc(100%-32px)] rounded-full border border-blue-500/50" aria-hidden="true"></div>

        {visibleDirections.map(dir => (
          <div
            key={dir.id}
            className={`absolute ${dir.position} ${dir.className} z-10`}
            aria-hidden="true"
            style={{
              transformOrigin: 'center center',
              transform: `${dir.position.includes('translate-x-1/2') ? 'translateX(-50%)' : ''} ${dir.position.includes('translate-y-1/2') ? 'translateY(-50%)' : ''}`
            }}
          >
            {dir.display}
          </div>
        ))}

        <div
          className={`absolute ${isCorrectAngle ? 'text-green-500' : 'text-red-500'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} transition-colors duration-200`}
          style={{
            width: `${ARROW_WIDTH}px`,
            height: `${arrowVisualHeight}px`,
            left: '50%',
            bottom: '50%', 
            transformOrigin: 'center bottom', 
            transform: `translateX(-50%) rotate(${rotation}deg)`, 
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          role="slider"
          aria-valuenow={Math.round(rotation)}
          aria-valuemin={0}
          aria-valuemax={359}
          aria-label="Arrow"
          aria-describedby="instruction"
        >
          <ArrowIcon />
        </div>
        
        <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full absolute z-20 transition-colors duration-200 ${isCorrectAngle ? 'bg-green-500' : 'bg-blue-500'}`} aria-hidden="true"></div>
      </div>

      <div id="instruction" className="sr-only">
         {instructionText}
      </div>

      <div
        className="mt-6 w-64 md:w-80 h-6 md:h-7 bg-gray-300/70 rounded-full shadow-inner overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(progressPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress towards ${targetDirectionName}`}
      >
        <div
          className={`h-full rounded-full ${progressBarColor} transition-all duration-300 ease-out`}
          style={{ width: `${progressPercent}%` }}
        >
        </div>
      </div>

      <div className="mt-4 h-[68px] md:h-[76px] flex items-center justify-center" aria-live="polite">
        {isLevelCompleted ? (
          <p className="text-2xl md:text-3xl font-semibold text-gray-800 bg-green-400/90 px-6 py-3 rounded-xl shadow-lg transition-all duration-300 ease-in-out animate-pulse">
            Correct!
          </p>
        ) : showHoldHint ? (
          <p className="text-md md:text-lg font-semibold text-sky-800 bg-sky-200/90 px-4 py-2 rounded-lg shadow-md animate-fade-in">
            <strong>Hint!</strong> Don't just tap, press and hold ◄ or ► to glide!
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default Pointer;
