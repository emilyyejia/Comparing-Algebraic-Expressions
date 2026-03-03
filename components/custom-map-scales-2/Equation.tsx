import React, { useEffect, useRef, useState } from 'react';

interface EquationProps {
  level: number;
  count: number;
  scale: number;
  correctTotal: number;
  isMeasurementComplete: boolean;
  isLevelComplete: boolean;
  onAnswerSubmit: (e: React.FormEvent) => void;
  answer: string;
  setAnswer: (value: string) => void;
  equationError: boolean;
  scaleAnswer: string;
  setScaleAnswer: (value: string) => void;
  scaleError: boolean;
  countAnswer: string;
  setCountAnswer: (value: string) => void;
  countError: boolean;
  isScaleHintVisible: boolean;
  onScaleHintToggle: (update: React.SetStateAction<boolean>) => void;
}

const Box: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center justify-center w-12 h-12 border-2 border-slate-400 rounded-md text-slate-800 font-bold text-xl bg-slate-100 transition-all ${className}`}>
    {children}
  </span>
);

const Equation: React.FC<EquationProps> = ({
  level,
  count,
  scale,
  correctTotal,
  isMeasurementComplete,
  isLevelComplete,
  onAnswerSubmit,
  answer,
  setAnswer,
  equationError,
  scaleAnswer,
  setScaleAnswer,
  scaleError,
  countAnswer,
  setCountAnswer,
  countError,
  isScaleHintVisible,
  onScaleHintToggle,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const scaleInputRef = useRef<HTMLInputElement>(null);
  const countInputRef = useRef<HTMLInputElement>(null);
  const [showCountHint, setShowCountHint] = useState(false);

  useEffect(() => {
    if (isMeasurementComplete && !isLevelComplete) {
      if (level >= 4) {
        countInputRef.current?.focus();
      } else if (level >= 2) {
        scaleInputRef.current?.focus();
      } else {
        inputRef.current?.focus();
      }
    }
  }, [isMeasurementComplete, isLevelComplete, level]);

  useEffect(() => {
    if (!isScaleHintVisible) return;
    const handleClickOutside = () => {
      onScaleHintToggle(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isScaleHintVisible, onScaleHintToggle]);

  useEffect(() => {
    setShowCountHint(false);
  }, [level]);

  useEffect(() => {
    if (!showCountHint) return;

    const handleClickOutside = () => {
      setShowCountHint(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCountHint]);


  const handleScaleHintClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onScaleHintToggle(prev => !prev);
  };

  const handleCountHintClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCountHint(prev => !prev);
  };

  const renderCount = () => {
    if (level < 4) {
      return <Box>{count}</Box>;
    }
    
    if (isLevelComplete) {
      return <Box>{count}</Box>;
    }

    if (isMeasurementComplete) {
      const errorClass = countError ? 'animate-shake border-red-500' : 'border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200';
      return (
        <div className="relative">
           {/* Hint Icon for Level 4+ Count */}
          {level >= 4 && !isLevelComplete && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <div className="group relative">
                    <button
                        type="button"
                        onClick={handleCountHintClick}
                        className="flex items-center justify-center w-8 h-8 bg-yellow-300 rounded-full shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                        aria-expanded={showCountHint}
                        aria-controls="count-hint-text"
                    >
                        <span className="text-xl" aria-hidden="true">💡</span>
                        <span className="sr-only">Show hint for block count</span>
                    </button>
                    <div 
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        role="tooltip"
                    >
                        Click for hint
                    </div>
                </div>
                 {showCountHint && (
                    <div
                        id="count-hint-text"
                        className="mt-2 w-max px-3 py-1.5 bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-lg"
                        role="status"
                    >
                        How many blocks did you place?
                    </div>
                 )}
            </div>
          )}
          <div className="relative group inline-flex items-center justify-center w-12 h-12">
            <input
              ref={countInputRef}
              type="number"
              value={countAnswer}
              onChange={(e) => setCountAnswer(e.target.value)}
              placeholder="?"
              className={`w-full h-full text-center bg-white border-2 rounded-md text-slate-800 font-bold text-xl focus:outline-none transition-all ${errorClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              aria-label="Enter number of blocks"
              required
              disabled={isLevelComplete}
            />
          </div>
        </div>
      );
    }
    
    return (
        <div className="relative group">
            <span
                className="inline-flex items-center justify-center w-12 h-12 border-2 border-dashed border-slate-400 rounded-md text-slate-500 font-bold text-xl bg-slate-100"
                aria-disabled="true"
            >
                ?
            </span>
            <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                role="tooltip"
            >
                Unlock by placing blocks
            </div>
        </div>
    );
  };

  const renderScaleValue = () => {
    if (isLevelComplete) {
      return <span>{scale}</span>;
    }

    if (isMeasurementComplete) {
      const errorClass = scaleError ? 'animate-shake border-red-500' : 'border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200';
      return (
        <div className="relative">
          {/* Hint Icon for Scale (Level 2+) */}
          {level >= 2 && !isLevelComplete && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
                <div className="group relative">
                    <button
                        type="button"
                        onClick={handleScaleHintClick}
                        className="flex items-center justify-center w-8 h-8 bg-yellow-300 rounded-full shadow-md hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                        aria-expanded={isScaleHintVisible}
                        aria-controls="scale-hint-text"
                    >
                        <span className="text-xl" aria-hidden="true">💡</span>
                        <span className="sr-only">Get a hint</span>
                    </button>
                    <div 
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                        role="tooltip"
                    >
                        Click for hint
                    </div>
                </div>
                 {isScaleHintVisible && (
                    <div
                        id="scale-hint-text"
                        className="mt-2 w-max px-3 py-1.5 bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-lg"
                        role="status"
                    >
                        Type the number from the map scale
                    </div>
                 )}
            </div>
          )}
          
          <div className="relative group inline-flex items-center justify-center w-24 h-12">
            <input
              ref={scaleInputRef}
              type="number"
              value={scaleAnswer}
              onChange={(e) => setScaleAnswer(e.target.value)}
              placeholder="?"
              className={`w-full h-full text-center bg-white border-2 rounded-md text-slate-800 font-bold text-xl focus:outline-none transition-all ${errorClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              aria-label="Enter scale value"
              required
              disabled={isLevelComplete}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="relative group">
        <span
          className="inline-flex items-center justify-center w-24 h-12 border-2 border-dashed border-slate-400 rounded-md text-slate-500 font-bold text-xl bg-slate-100"
          aria-disabled="true"
        >
          ?
        </span>
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          role="tooltip"
        >
          Unlock by placing blocks
        </div>
      </div>
    );
  };

  const renderTotal = () => {
    if (isLevelComplete) {
      return <Box className="w-24 bg-green-100 border-green-500 text-green-800">{correctTotal}</Box>;
    }

    if (isMeasurementComplete) {
      const errorClass = equationError ? 'animate-shake border-red-500' : 'border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200';
      return (
        <div className="relative group inline-flex items-center justify-center w-24 h-12">
          <input
            ref={inputRef}
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="?"
            className={`w-full h-full text-center bg-white border-2 rounded-md text-slate-800 font-bold text-xl focus:outline-none transition-all ${errorClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            aria-label="Enter total distance"
            required
            disabled={isLevelComplete}
          />
        </div>
      );
    }

    return (
      <div className="relative group">
        <span
          className="inline-flex items-center justify-center w-24 h-12 border-2 border-dashed border-slate-400 rounded-md text-slate-500 font-bold text-xl bg-slate-100"
          aria-disabled="true"
        >
          ?
        </span>
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max whitespace-nowrap px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          role="tooltip"
        >
          Unlock by placing blocks
        </div>
      </div>
    );
  };

  return (
    <form
      onSubmit={onAnswerSubmit}
      className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 text-xl sm:text-2xl font-semibold text-slate-600 mt-16 mb-6"
      aria-live="polite"
    >
      {renderCount()}
      <span>×</span>
      {level >= 2 ? renderScaleValue() : <span>{scale}</span>}
      <span>m</span>
      <span>=</span>
      {renderTotal()}
      <span>m</span>
      {isMeasurementComplete && !isLevelComplete && (
        <div className="relative group ml-2">
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all"
          >
            Check
          </button>
        </div>
      )}
    </form>
  );
};

export default Equation;