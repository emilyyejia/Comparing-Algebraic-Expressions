import React from 'react';

interface ModalProps {
  onStart: () => void;
}

const Modal: React.FC<ModalProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center transform transition-all animate-fade-in">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          How far does Lina walk each day?
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Drag the arrows onto the map to trace her route.
        </p>
        <button
          onClick={onStart}
          className="bg-blue-600 text-white font-bold py-3 px-10 rounded-lg text-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 transform hover:scale-105"
          aria-label="Start the activity"
        >
          Start
        </button>
      </div>
    </div>
  );
};

export default Modal;
