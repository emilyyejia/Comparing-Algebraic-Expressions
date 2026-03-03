import React from 'react';

interface ModalProps {
  message: string;
  onClose: () => void; // Replay or Start/Continue
  onExit?: () => void; // Optional, for "Back to map"
  onNext?: () => void; // Optional, for "Next" button on success
  stars?: number | null;
  replayButtonText?: string;
}

export const Modal: React.FC<ModalProps> = ({ message, onClose, onExit, onNext, stars, replayButtonText = "Replay" }) => {
  const isGameOverModal = stars !== null && stars !== undefined;
  
  // Single button for instructional/level transition modals
  const singleButtonText = message.startsWith("Whoosh!") ? "Continue" : "Start";

  const motivationalHint = "Reach the treasure in fewer moves to get more stars.";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full text-slate-700">
        <p className="text-lg mb-4 text-center">{message}</p>
        
        {isGameOverModal && ( 
          <>
            <div className="flex justify-center my-4" aria-label={`Rating: ${stars} out of 3 stars`}>
              {Array.from({ length: 3 }).map((_, i) => {
                const isEarned = i < (stars || 0);
                return (
                  <span 
                    key={i} 
                    className={`text-4xl mx-1 ${isEarned ? 'text-yellow-400' : 'text-slate-400'}`}
                    role="img" 
                    aria-hidden="true" 
                  >
                    {isEarned ? '★' : '☆'}
                  </span>
                );
              })}
            </div>
            {stars < 3 && (
              <p className="text-sm text-slate-600 mt-2 mb-4 text-center">
                {motivationalHint}
              </p>
            )}
          </>
        )}

        {isGameOverModal ? (
          onNext && stars && stars >= 2 ? (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={onNext}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                aria-label="Next"
              >
                Next
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={onClose}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label={replayButtonText}
              >
                {replayButtonText}
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  aria-label="Back to map"
                >
                  Back to Map
                </button>
              )}
            </div>
          )
        ) : (
          <button
            onClick={onClose}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={singleButtonText}
          >
            {singleButtonText}
          </button>
        )}
      </div>
    </div>
  );
};