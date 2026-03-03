import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  return (
    <div 
      className="flex items-center justify-end gap-1.5"
      role="group"
      aria-label={`Progress: ${completed} of ${total} mystery points found.`}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < completed;
        return (
          <div
            key={index}
            className={`w-4 h-4 rounded-full transition-colors duration-300 ${
              isCompleted 
                ? 'bg-blue-500 border-2 border-blue-600' 
                : 'bg-slate-200 border-2 border-slate-300'
            }`}
            aria-hidden="true"
          ></div>
        );
      })}
    </div>
  );
};

export default ProgressBar;