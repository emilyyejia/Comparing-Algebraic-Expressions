
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onRestart: () => void;
  title: string;
  children: React.ReactNode;
  buttonText?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onRestart, title, children, buttonText = "Restart Game" }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl text-center w-full max-w-md border border-gray-300">
        {title && (
          <h2 id="modal-title" className="text-3xl font-bold text-sky-600 mb-4">
            {title}
          </h2>
        )}
        {children && (
          <div className="text-gray-700 mb-6">
            {children}
          </div>
        )}
        <button
          onClick={onRestart}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all duration-200 ease-in-out text-lg focus:outline-none focus:ring-4 focus:ring-emerald-400 focus:ring-opacity-50 active:bg-emerald-700 transform active:scale-95"
          aria-label={buttonText}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default Modal;
