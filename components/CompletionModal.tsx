
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
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const CompletionModal: React.FC<CompletionModalProps> = ({ stars, onReplay, onBackToMap, onNext, hint }) => {
  const isGoodEffort = stars === 1;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-sky-500/30 rounded-[2.5rem] p-10 max-w-md w-full text-center shadow-[0_0_50px_rgba(56,189,248,0.2)]">
        <h2 className={`text-4xl font-black mb-6 ${isGoodEffort ? 'text-amber-400' : 'text-sky-400'}`}>
          {isGoodEffort ? 'Good effort!' : 'Challenge complete!'}
        </h2>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <StarIcon key={i} filled={i <= stars} />
          ))}
        </div>

        {stars < 3 && hint && (
          <p className="text-sm text-slate-400 mb-6 italic">
            {hint}
          </p>
        )}

        {isGoodEffort && (
          <p className="text-emerald-400 font-bold mb-8 uppercase tracking-widest text-sm">
            Get 2 stars to unlock the next level
          </p>
        )}

        <div className="flex flex-col gap-4 mt-8">
          {onNext && (
            <button
              onClick={onNext}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest"
            >
              Next Level
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
          {onBackToMap && (
            <button
              onClick={onBackToMap}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-black py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest"
            >
              Back to Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
