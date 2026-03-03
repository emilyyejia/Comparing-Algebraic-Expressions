
import React from 'react';
import type { Landmark } from '../../levels/custom-map-scales-2/mapScalesTypes2';

interface KeyProps {
  landmarks: Landmark[];
}

const Key: React.FC<KeyProps> = ({ landmarks }) => {
  return (
    <div className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4">
      <h2 className="text-2xl font-bold text-slate-700 text-center mb-4 border-b-2 border-slate-300 pb-2">Key</h2>
      <ul className="space-y-4">
        {landmarks.map((landmark) => (
          <li key={landmark.id} className="flex items-center space-x-4">
            <span className={`text-4xl w-8 text-center ${landmark.color}`}>
              {landmark.symbol}
            </span>
            <span className="text-slate-600 font-medium">{landmark.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Key;
