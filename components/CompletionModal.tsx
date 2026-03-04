
import React from 'react';

interface CompletionModalProps {
  stars: number;
  onReplay?: () => void;
  onBackToMap?: () => void;
  onNext?: () => void;
  hint?: string;
}

const StarIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`w-16 h-16 ${filled ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]' : 'text-slate-700'}`}
    viewBox="0 0 20 20"
    fill="currentColor"
    stroke={filled ? 'none' : 'currentColor'}
    strokeWidth={filled ? 0 : 1}
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CompletionModal: React.FC<CompletionModalProps> = ({ stars, onReplay, onBackToMap, onNext, hint }) => {
  const title = stars === 1 ? 'Good Effort!' : 'Level Complete!';
  const showNextButton = stars >= 2;
  const isFinalLevel = !onNext && onBackToMap;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-sky-500/30 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(56,189,248,0.2)]">
        <h2 className="text-4xl font-black mb-6 text-sky-400">
          {title}
        </h2>

        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <StarIcon key={i} filled={i <= stars} />
          ))}
        </div>

        {stars === 1 && (
          <p className="text-amber-400 font-bold mb-4 text-base">
            You need 2 stars to unlock the next level.
          </p>
        )}

        {stars < 3 && (
          <p className="text-slate-300 mb-6 text-base">
            Answer correctly on the first try to earn more stars!
          </p>
        )}

        <div className="flex flex-col gap-4 mt-8">
          {showNextButton && !isFinalLevel && onNext && (
            <button
              onClick={onNext}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest"
            >
              Next Level
            </button>
          )}
          {showNextButton && isFinalLevel && onBackToMap && (
            <button
              onClick={onBackToMap}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest"
            >
              Back to Map
            </button>
          )}
          {onReplay && (
            <button
              onClick={onReplay}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest"
            >
              Replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
