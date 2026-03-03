import React from 'react';

interface TimerProps {
  timeInSeconds: number;
}

const Timer: React.FC<TimerProps> = ({ timeInSeconds }) => {
  const minutes = String(Math.floor(timeInSeconds / 60)).padStart(2, '0');
  const seconds = String(timeInSeconds % 60).padStart(2, '0');

  return (
    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 mb-4" role="timer" aria-live="off">
      <div className="flex items-center justify-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-3xl font-mono font-bold text-slate-800">
            {minutes}:{seconds}
        </p>
      </div>
    </div>
  );
};

export default Timer;
