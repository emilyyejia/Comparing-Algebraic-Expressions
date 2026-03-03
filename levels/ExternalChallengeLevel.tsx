import React, { useState, useEffect, useCallback } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

interface ExternalChallengeLevelProps extends LevelComponentProps {
  url: string;
  isGated?: boolean;
}

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-10 h-10 md:w-12 md:h-12 mx-1" }) => (
  <svg
    className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-400'}`}
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? "0" : "1.5"}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
    />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);

const ExternalChallengeLevel: React.FC<ExternalChallengeLevelProps> = ({ onComplete, onExit, url, topic, isGated, progress, levelId }) => {
  const [completionState, setCompletionState] = useState<'pending' | 'failed'>('pending');
  const [iframeKey, setIframeKey] = useState(Date.now());
  const [finalStars, setFinalStars] = useState<number | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  useEffect(() => {
    if (!isGated) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const challengeOrigin = new URL(url).origin;
        if (event.origin !== challengeOrigin) {
          return;
        }

        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        
        // FIX: Accept both `event: 'challengeResult'` and `type: 'challengeResult'`
        // to handle inconsistent payloads from different external challenges.
        const isChallengeResult = data && (data.event === 'challengeResult' || data.type === 'challengeResult');

        if (isChallengeResult && typeof data.stars === 'number' && data.stars >= 0) {
          onComplete(data.stars); // Record progress regardless of pass/fail
          if (data.stars >= 2) {
            setFinalStars(data.stars);
            setCompletionState('pending'); // Reset failure state on success
          } else {
            setCompletionState('failed');
          }
        }
      } catch (error) {
        console.error("Error handling message from iframe:", error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isGated, url, onComplete]);

  const handleRetry = useCallback(() => {
    setCompletionState('pending');
    setFinalStars(null);
    setIframeKey(Date.now());
  }, []);

  const handleNextLevelClick = () => {
    onExit?.();
  };
  
  if (finalStars !== null) {
    const bestStars = (progress && levelId && progress[levelId]) || 0;
    const canProceed = finalStars >= 2 || bestStars >= 2;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] p-4 antialiased">
        <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
            Challenge complete!
            </h2>
            <div className="flex justify-center my-5 md:my-8">
            {[1, 2, 3].map((starIndex) => (
                <StarIcon key={starIndex} filled={starIndex <= finalStars} className="w-12 h-12 md:w-16 md:h-16 mx-1.5 md:mx-2"/>
            ))}
            </div>
            
            <div className="mt-6 md:mt-8 flex justify-center items-start gap-4">
                <button
                    onClick={handleRetry}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    aria-label="Replay the challenge"
                >
                    Replay
                </button>
                <div className="flex flex-col items-center gap-2">
                    <button
                        onClick={handleNextLevelClick}
                        disabled={!canProceed}
                        className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        aria-label="Go to the next level"
                    >
                        Next level
                    </button>
                    {!canProceed && (
                        <p className="text-sm text-slate-600">Get more stars to unlock.</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (isGated && completionState === 'failed') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <XCircleIcon className="w-20 h-20 text-red-400 mb-4" />
        <h2 className="text-4xl font-bold text-red-400 mb-4">Try Again</h2>
        <p className="text-xl mb-6 max-w-md">You need to earn at least 2 stars to unlock the next level. Give it another shot!</p>
        <button
          onClick={handleRetry}
          className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-200 hover:scale-105"
        >
          Retry Challenge
        </button>
      </div>
    );
  }


  return (
    <div className="w-full h-full relative">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} />
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        title={`${topic} Challenge Instructions`}
      >
        <p>This is an external challenge. Interact with the content inside the frame to complete it.</p>
        <p>Follow the instructions provided within the challenge itself.</p>
        <p>Your results will be automatically sent back to the learning path when you are finished.</p>
      </InstructionModal>
      <iframe
        key={iframeKey}
        src={url}
        title={topic}
        className="w-full h-full border-2 border-sky-500/50 rounded-lg"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </div>
  );
};

export default ExternalChallengeLevel;