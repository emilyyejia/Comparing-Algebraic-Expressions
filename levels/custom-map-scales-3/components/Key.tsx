import React from 'react';
import type { Landmark } from '../types';

interface KeyProps {
  landmarks: Landmark[];
}

const Key: React.FC<KeyProps> = ({ landmarks }) => {
  return (
    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-3">
      <h2 className="text-xl font-bold text-slate-700 text-center mb-3 border-b-2 border-slate-300 pb-2">Key</h2>
      <ul className="space-y-2">
        {landmarks.map((landmark) => (
          <li key={landmark.id} className="flex items-center space-x-3">
            <span className={`text-3xl w-8 text-center ${landmark.color}`}>
              {landmark.symbol}
            </span>
            <span className="text-slate-600 font-medium text-sm">{landmark.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Key;
