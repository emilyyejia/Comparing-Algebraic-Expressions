import React from 'react';

const DIRECTIONS = ['north', 'east', 'south', 'west'];
const DISTANCES = [50, 100, 150, 200, 250, 300];

interface MovementControllerProps {
  direction: string;
  onDirectionChange: (direction: string) => void;
  distance: number;
  onDistanceChange: (distance: number) => void;
  onMove: () => void;
  isMoving: boolean;
}

const MovementController: React.FC<MovementControllerProps> = ({
  direction,
  onDirectionChange,
  distance,
  onDistanceChange,
  onMove,
  isMoving,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMove();
  };

  const selectStyles = "font-semibold border-2 border-slate-300 rounded-md p-2 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition";

  return (
    <form onSubmit={handleSubmit} className="mt-4 w-full flex items-center justify-center gap-2 text-slate-700 text-lg">
      <span>Move Leon</span>
      <select
        value={direction}
        onChange={(e) => onDirectionChange(e.target.value)}
        className={selectStyles}
        aria-label="Direction to move"
      >
        {DIRECTIONS.map(d => (
          <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
        ))}
      </select>
      <select
        value={distance}
        onChange={(e) => onDistanceChange(Number(e.target.value))}
        className={selectStyles}
        aria-label="Distance to move"
      >
        {DISTANCES.map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <span>metres.</span>
      <button
        type="submit"
        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors ml-2 disabled:bg-slate-400 disabled:cursor-not-allowed"
        disabled={isMoving}
      >
        Go
      </button>
    </form>
  );
};

export default MovementController;