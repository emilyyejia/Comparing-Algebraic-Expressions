import React from 'react';

interface ProgressBarProps {
  completed: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ completed, total }) => {
  return (
    <div 
      className="absolute top-6 right-6 flex items-center space-x-2" 
      aria-label={`Progress: ${completed} of ${total} moves completed.`}
      role="status"
    >
      {Array.from({ length: total }).map((_, index) => {
        const isCompleted = index < completed;
        return (
          <div
            key={index}
            className={`w-4 h-4 rounded-full transition-colors duration-300 ${isCompleted ? 'bg-blue-500' : 'bg-slate-300'}`}
            title={`Move ${index + 1}: ${isCompleted ? 'Completed' : 'Pending'}`}
          ></div>
        );
      })}
    </div>
  );
};

export default ProgressBar;
