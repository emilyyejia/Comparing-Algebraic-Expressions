import React from 'react';
import StarRating from './StarRating';

interface CompletionModalProps {
  totalDistance: number;
  onPlayAgain: () => void;
  onExit?: () => void;
  inputErrorCount: number;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ totalDistance, onPlayAgain, onExit, inputErrorCount }) => {
  const distanceKm = Math.round((totalDistance / 1000) * 100) / 100;

  // 3 stars = 0-1 errors
  // 2 stars = 2-3 errors
  // 1 star = > 3 errors
  let stars: number;
  if (inputErrorCount <= 1) {
    stars = 3;
  } else if (inputErrorCount <= 3) {
    stars = 2;
  } else {
    stars = 1;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center transform transition-all animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Challenge complete!
        </h1>

        <p className="text-lg text-slate-600 mb-6">
          Lina walks <strong className="text-blue-600">{totalDistance} m</strong>, or <strong className="text-blue-600">{distanceKm} km</strong>, per day.
        </p>
        
        <div className="mb-8 min-h-20 flex flex-col justify-center items-center">
            <StarRating rating={stars} />
            {stars < 3 && (
                <p className="text-sm text-slate-500 mt-2">
                    Calculate distances correctly on the first try to earn more stars.
                </p>
            )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
             <button
                onClick={onPlayAgain}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Replay challenge"
                >
                Replay
            </button>
            <button
                onClick={onExit}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label="Back to map"
                >
                Back to Map
            </button>
        </div>

      </div>
    </div>
  );
};

export default CompletionModal;