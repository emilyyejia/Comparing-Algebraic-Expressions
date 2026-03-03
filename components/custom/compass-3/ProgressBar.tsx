import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
}

const TreasureIcon: React.FC<{ filled: boolean }> = ({ filled }) => (
  <svg
    className={`w-8 h-8 transition-colors duration-500 ${filled ? 'text-yellow-400' : 'text-gray-400'}`}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10 4C8.9 4 8 4.9 8 6v1H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-3V6c0-1.1-.9-2-2-2h-4zm0 2h4v1h-4V6zM5 9h14v10H5V9zm5 2v4h4v-4h-4z" />
  </svg>
);

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  return (
    <div
      className="absolute top-4 right-4 md:top-6 md:right-6 z-50 flex items-center space-x-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Progress: ${current} of ${total} clues solved`}
    >
      {Array.from({ length: total }).map((_, index) => (
        <TreasureIcon key={index} filled={index < current} />
      ))}
    </div>
  );
};

export default ProgressBar;
