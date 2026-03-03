import React from 'react';

interface ArrowCounterProps {
  count: number;
}

const ArrowCounter: React.FC<ArrowCounterProps> = ({ count }) => {
  return (
    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 text-center">
      <h2 className="text-xl font-bold text-slate-700 mb-1">Total Arrows Used</h2>
      <p className="text-5xl font-bold text-blue-600" aria-live="polite">{count}</p>
    </div>
  );
};

export default ArrowCounter;
