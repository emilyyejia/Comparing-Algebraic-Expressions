import React from 'react';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-[150] p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "instruction-modal-title" : undefined}
      aria-label={!title ? "Instructions" : undefined}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          {title ? (
            <h2 id="instruction-modal-title" className="text-2xl font-bold text-sky-700">{title}</h2>
          ) : <div />}
          <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Close instructions"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
        </div>
        <div className="text-slate-600 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {children}
        </div>
        <div className="mt-6 text-right">
            <button
                onClick={onClose}
                className="bg-sky-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition-colors"
            >
                Got it!
            </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;
