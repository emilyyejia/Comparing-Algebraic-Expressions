
import React, { useRef, useEffect, useState } from 'react';
import type { Level, PlayerProgress } from '../types';
import { useToolbar } from '../hooks/useToolbarState';
import Toolbar from './toolbar/Toolbar';
import HelpModal from './toolbar/HelpModal';
import TextToSpeech from './toolbar/TextToSpeech';
import LineReader from './toolbar/LineReader';
import Notes from './toolbar/Notes';
import Calculator from './toolbar/Calculator';
import DocumentsModal from './toolbar/DocumentsModal';
import Highlighter from './toolbar/Highlighter';

interface LevelViewProps {
  level: Level;
  onBackToMap: () => void;
  onComplete: (stars: number) => void;
  onExit: () => void;
  partialProgress?: any;
  onSavePartialProgress?: (state: any | null) => void;
  progress?: PlayerProgress;
  lessonTitle?: string | null;
  onNext?: () => void;
}

const LevelView: React.FC<LevelViewProps> = ({ level, onBackToMap, onComplete, onExit, partialProgress, onSavePartialProgress, progress, lessonTitle, onNext }) => {
  const LevelComponent = level.component;
  const { 
    activeTool, 
    zoomLevel, 
    isHighContrast, 
    lineReaderPosition, 
    showLineReader
  } = useToolbar();
  const contentWrapperRef = useRef<HTMLDivElement>(null);
  
  const [progressInfo, setProgressInfo] = useState<{current: number, total: number} | null>(null);

  const handleDotClick = (index: number) => {
    if (onSavePartialProgress) {
        onSavePartialProgress({ ...partialProgress, jumpToIndex: index + 1 });
    }
  };

  const handleProgressUpdate = React.useCallback((curr: number, tot: number) => {
    setProgressInfo({ current: curr, total: tot });
  }, []);

  const handleSavePartialProgress = React.useCallback((state: any | null) => {
    if (onSavePartialProgress) {
      onSavePartialProgress(state);
    }
  }, [onSavePartialProgress]);

  return (
    <div className={`fixed inset-0 bg-slate-950 p-4 flex flex-col animate-fade-in ${isHighContrast ? 'high-contrast' : ''}`}>
      <div className="relative z-[101] flex-shrink-0 mb-4 flex items-start justify-between min-h-[64px]">
        <button
          onClick={onBackToMap}
          className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-xl transition-all duration-200 border-2 border-slate-700 uppercase text-xs tracking-widest"
        >
          &larr; Back to Map
        </button>

        {/* Centered Progress Dots */}
        {progressInfo && (
          <div className="absolute left-1/2 -translate-x-1/2 top-4 flex gap-2" aria-label={`Task ${progressInfo.current} of ${progressInfo.total}`}>
            {Array.from({ length: progressInfo.total }).map((_, i) => (
              <button 
                key={i} 
                onClick={() => handleDotClick(i)}
                title={`Go to task ${i + 1}`}
                className={`w-3 h-3 rounded-full transition-all duration-500 hover:scale-150 focus:outline-none cursor-pointer ${
                  i < progressInfo.current 
                    ? 'bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.6)]' 
                    : 'bg-slate-800 border border-slate-700'
                }`} 
              />
            ))}
          </div>
        )}

        <div className="flex flex-col items-end gap-2 text-right max-w-[40%]">
          {lessonTitle && (
              <h1 className="text-xl font-black text-sky-300 tracking-tight leading-tight">
                  {lessonTitle}: {level.name}
              </h1>
          )}
        </div>
      </div>

      <div id="level-content-container" ref={contentWrapperRef} className="flex-grow relative overflow-auto">
        <Highlighter contentRef={contentWrapperRef} />
        <div 
          className="transition-transform duration-200 h-full" 
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
        >
          <LevelComponent
            topic={level.topic}
            onComplete={onComplete}
            onExit={onExit}
            questions={level.questions}
            isGated={level.isGated}
            partialProgress={partialProgress}
            onSavePartialProgress={handleSavePartialProgress}
            progress={progress}
            levelId={level.id}
            onNext={onNext}
            onProgressUpdate={handleProgressUpdate}
          />
        </div>
      </div>

      <Toolbar />
      {activeTool === 'help' && <HelpModal />}
      {activeTool === 'listen' && <TextToSpeech contentRef={contentWrapperRef} />}
      {showLineReader && <LineReader initialPosition={lineReaderPosition} />}
      {activeTool === 'notes' && <Notes />}
      {activeTool === 'calculator' && <Calculator />}
      {activeTool === 'documents' && <DocumentsModal />}
    </div>
  );
};

export default LevelView;
