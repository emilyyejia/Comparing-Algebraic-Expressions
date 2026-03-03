import React, { useRef, useEffect, useState } from 'react';
import type { Landmark, PlacedArrow, ScheduleItem } from '../types';

interface ScheduleProps {
  schedule: ScheduleItem[];
  landmarks: Landmark[];
  currentTaskIndex: number;
  isCurrentTaskComplete: boolean;
  placedArrows: PlacedArrow[];
  scale: number;
  isAllTasksComplete: boolean;
  distanceInputs: Record<number, string>;
  onDistanceChange: (tripIndex: number, value: string) => void;
  onSubmitDistance: (tripIndex: number) => void;
  distanceInputStatus: Record<number, 'incorrect' | 'correct' | undefined>;
  flashingInput: number | null;
  totalDistanceInput: string;
  onTotalDistanceChange: (value: string) => void;
  onSubmitTotalDistance: () => void;
  totalDistanceStatus: 'incorrect' | 'correct' | undefined;
  flashingTotalInput: boolean;
}

const Schedule: React.FC<ScheduleProps> = ({
  schedule,
  landmarks,
  currentTaskIndex,
  isCurrentTaskComplete,
  placedArrows,
  scale,
  isAllTasksComplete,
  distanceInputs,
  onDistanceChange,
  onSubmitDistance,
  distanceInputStatus,
  flashingInput,
  totalDistanceInput,
  onTotalDistanceChange,
  onSubmitTotalDistance,
  totalDistanceStatus,
  flashingTotalInput,
}) => {
  const [isFirstItemTooltipVisible, setIsFirstItemTooltipVisible] = useState(false);

  const getLandmarkLabel = (id: string): string => {
    const landmark = landmarks.find(l => l.id === id);
    if (!landmark) return id;
    if (landmark.id === 'linas-house') return 'home';
    if (['school', 'park', 'pool'].includes(landmark.id)) {
        return landmark.label.toLowerCase();
    }
    return landmark.label;
  };

  const calculateDistance = (tripIndex: number) => {
    const correctArrowsForTrip = placedArrows.filter(
      arrow => arrow.tripIndex === tripIndex && arrow.status === 'correct'
    );
    return correctArrowsForTrip.length * scale;
  };
  
  const activeInputRef = useRef<HTMLInputElement>(null);
  const totalInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAllTasksComplete && totalDistanceStatus !== 'correct') {
      totalInputRef.current?.focus();
    } else if (activeInputRef.current) {
      activeInputRef.current.focus();
    }
  }, [currentTaskIndex, isCurrentTaskComplete, isAllTasksComplete, totalDistanceStatus]);

  return (
    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
      <h2 className="text-2xl font-bold text-slate-700 text-center mb-4 border-b-2 border-slate-300 pb-2">Lina’s Daily Schedule</h2>
      
      <div className="flex justify-between items-center text-sm font-bold text-slate-500 px-2 pb-2 mb-1 border-b border-slate-200">
          <span className="flex-grow">Trip</span>
          <span className="w-40 text-right">Distance Walked (m)</span>
      </div>

      <ul className="space-y-1 mt-1">
        {schedule.map((item, index) => {
          const distance = calculateDistance(index);
          const isCurrentTrip = index === currentTaskIndex;
          const isAwaitingInput = isCurrentTrip && isCurrentTaskComplete && !isAllTasksComplete;
          
          const status = distanceInputStatus[index];
          const isFlashing = flashingInput === index;

          const isPastTrip = index < currentTaskIndex;
          const showFinalValue = isPastTrip || isAllTasksComplete;
          
          const isFirstTrip = index === 0;
          const isTooltipApplicable = isFirstTrip && !isAwaitingInput && !showFinalValue;
          const showTooltip = isTooltipApplicable && isFirstItemTooltipVisible;

          let inputStateClasses = '';
          if (isAwaitingInput || (isCurrentTrip && status === 'correct')) {
              if (status === 'correct') {
                  inputStateClasses = 'bg-green-100 border-green-500 text-green-800 cursor-default';
              } else if (status === 'incorrect') {
                  inputStateClasses = 'bg-white text-slate-700 border-red-500 focus:ring-2 focus:ring-red-300';
              } else {
                  inputStateClasses = 'bg-white text-slate-700 border-blue-500 focus:ring-2 focus:ring-blue-300 input-pulse';
              }
          } else {
              inputStateClasses = 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500 pointer-events-none';
          }

          return (
            <li
              key={index}
              className={`flex justify-between items-center p-2 rounded-md transition-all duration-300 text-sm ${
                isCurrentTrip && !isAllTasksComplete ? 'bg-blue-100 scale-105 shadow-sm' : ''
              }`}
            >
              <span className="text-slate-600 font-medium flex-grow pr-2">
                {item.time} - Walk from <strong className="text-slate-800">{getLandmarkLabel(item.fromId)}</strong> to <strong className="text-slate-800">{getLandmarkLabel(item.toId)}</strong>
              </span>
              <div 
                className="relative font-bold w-40 shrink-0 flex items-center" 
                style={{ minHeight: '44px' }}
                onMouseEnter={() => { if(isTooltipApplicable) setIsFirstItemTooltipVisible(true); }}
                onMouseLeave={() => { if(isTooltipApplicable) setIsFirstItemTooltipVisible(false); }}
                onClick={() => { if(isTooltipApplicable) setIsFirstItemTooltipVisible(prev => !prev); }}
                onFocus={() => { if(isTooltipApplicable) setIsFirstItemTooltipVisible(true); }}
                onBlur={() => { if(isTooltipApplicable) setIsFirstItemTooltipVisible(false); }}
                tabIndex={isTooltipApplicable ? 0 : undefined}
                aria-describedby={showTooltip ? `tooltip-${index}`: undefined}
              >
                {showTooltip && (
                  <div 
                    id={`tooltip-${index}`}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-lg z-10" 
                    role="tooltip"
                  >
                    Unlock by placing arrows
                    <svg className="absolute text-slate-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
                        <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                    </svg>
                  </div>
                )}
                <div className="flex-grow" /> {/* Pushes content to the right */}

                <div className="w-20">
                  {showFinalValue ? (
                     <span className="text-slate-700 block text-right pr-2 py-1">{distance}</span>
                  ) : (
                      <input
                          ref={isAwaitingInput ? activeInputRef : null}
                          type="number"
                          value={status === 'correct' ? distance : (distanceInputs[index] || '')}
                          onChange={(e) => onDistanceChange(index, e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') onSubmitDistance(index); }}
                          onWheel={(e) => (e.target as HTMLInputElement).blur()}
                          disabled={!isAwaitingInput || status === 'correct'}
                          className={`w-full text-right pr-2 py-1 rounded-md border-2 transition-all duration-200 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                          ${inputStateClasses}
                          ${isFlashing ? 'input-flash-incorrect' : ''}`}
                          aria-label={`Distance for trip from ${getLandmarkLabel(item.fromId)} to ${getLandmarkLabel(item.toId)}`}
                          tabIndex={isAwaitingInput && status !== 'correct' ? 0 : -1}
                      />
                  )}
                </div>

                <div className="w-16 ml-2 h-full flex items-center justify-center">
                    {isAwaitingInput && status !== 'correct' && (
                        <button
                            onClick={() => onSubmitDistance(index)}
                            disabled={!distanceInputs[index]}
                            className="w-full bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                            aria-label={`Check distance for trip from ${getLandmarkLabel(item.fromId)} to ${getLandmarkLabel(item.toId)}`}
                        >
                            Check
                        </button>
                    )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-between items-start mt-4 pt-3 border-t-2 border-slate-300 px-2">
          <strong className="text-slate-800 text-base flex-grow">Total</strong>
          <div className="font-bold w-40 shrink-0 flex">
             <div className="flex-grow" />
             <div className="flex flex-col items-end">
                {totalDistanceStatus === 'correct' ? (
                  <span className="w-20 text-right pr-2 py-1 block text-slate-700">{totalDistanceInput}</span>
                ) : (
                  <input
                      ref={totalInputRef}
                      type="number"
                      value={totalDistanceInput}
                      onChange={(e) => onTotalDistanceChange(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') onSubmitTotalDistance(); }}
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      disabled={!isAllTasksComplete}
                      placeholder="..."
                      className={`w-20 text-right pr-2 py-1 rounded-md border-2 transition-all duration-200 font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                      ${isAllTasksComplete
                          ? `bg-white text-slate-700 ${
                              totalDistanceStatus === 'incorrect'
                              ? 'border-red-500 focus:ring-2 focus:ring-red-300'
                              : 'border-blue-500 focus:ring-2 focus:ring-blue-300 input-pulse'
                            }`
                          : 'bg-slate-100 border-slate-200 cursor-not-allowed text-slate-500'
                      }
                      ${flashingTotalInput ? 'input-flash-incorrect' : ''}`}
                      aria-label="Total distance for all trips"
                  />
                )}
                {isAllTasksComplete && totalDistanceStatus !== 'correct' && (
                  <div className="w-20 mt-2">
                      <button
                          onClick={onSubmitTotalDistance}
                          disabled={!totalDistanceInput}
                          className="w-full bg-blue-600 text-white font-bold py-1 px-3 rounded-md text-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                          aria-label="Check total distance"
                      >
                          Check
                      </button>
                  </div>
                )}
             </div>
             <div className="w-16 ml-2" />
          </div>
      </div>
    </div>
  );
};

export default Schedule;
