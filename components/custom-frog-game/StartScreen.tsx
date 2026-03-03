
import React from 'react';

interface StartScreenProps {
  onStartGame: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div
      id="start-screen-title"
      className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-xl shadow-2xl border border-gray-300 max-w-lg"
    >
      <p className="text-lg sm:text-xl text-gray-800 mb-8 leading-relaxed mt-6">
        Help the hungry frog build a path to the caterpillar. Catch the flies along the way!
      </p>
      <button
        onClick={onStartGame}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-all duration-200 ease-in-out text-xl sm:text-2xl focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-opacity-50 active:bg-blue-700 transform active:scale-95"
        aria-label="Start"
      >
        Start
      </button>
    </div>
  );
};

export default StartScreen;