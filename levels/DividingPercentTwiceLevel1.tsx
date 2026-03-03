
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

const DividingPercentTwiceLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [taskIndex, setTaskIndex] = useState(() => partialProgress?.taskIndex || 0);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const totalTasks = 4; // Placeholder count
  const isCompletedRef = useRef(false);

  // Save state on unmount
  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ taskIndex });
      }
    };
  }, [onSavePartialProgress, taskIndex]);

  const handleNext = () => {
    if (taskIndex < totalTasks - 1) {
      setTaskIndex(prev => prev + 1);
    } else {
      isCompletedRef.current = true;
      onComplete(3); // Complete with 3 stars
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 text-white relative font-sans">
      {/* Instruction UI */}
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title="Level Instructions"
      >
        <p>Instructions for this level go here.</p>
      </InstructionModal>

      {/* Progress Dots */}
      <div className="absolute top-4 right-4 flex gap-2">
        {Array.from({ length: totalTasks }).map((_, index) => (
          <div
            key={index}
            className={`w-4 h-4 rounded-full transition-colors duration-300 ${
              index <= taskIndex ? 'bg-emerald-500' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <h2 className="text-3xl md:text-4xl font-bold mb-8 text-sky-300 text-center animate-fade-in">Task {taskIndex + 1} placeholder</h2>

      {/* Navigation */}
      <div className="mt-8 flex gap-4">
         <button
          onClick={handleNext}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-12 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          {taskIndex < totalTasks - 1 ? 'Next' : 'Finish'}
        </button>
         <button
          onClick={onExit}
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-12 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          Back to Map
        </button>
      </div>
    </div>
  );
};

export default DividingPercentTwiceLevel1;
