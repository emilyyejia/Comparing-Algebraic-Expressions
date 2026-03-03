
import type { Landmark } from './mapScalesTypes2';

export const GRID_ROWS = 5;
export const GRID_COLS = 5;
export const TOTAL_LEVELS = 6;

// The full pool of landmarks
export const ALL_LANDMARKS: Omit<Landmark, 'position'>[] = [
  { id: 'library', symbol: '📚', label: 'Library', color: 'text-blue-600' },
  { id: 'school', symbol: '🏫', label: 'School', color: 'text-orange-600' },
  { id: 'park', symbol: '🌳', label: 'Park', color: 'text-green-600' },
  { id: 'shop', symbol: '🛒', label: 'Shop', color: 'text-pink-600' },
  { id: 'bus-stop', symbol: '🚌', label: 'Bus stop', color: 'text-gray-700' },
  { id: 'hospital', symbol: '🏥', label: 'Hospital', color: 'text-red-600' },
  { id: 'pool', symbol: '🏊', label: 'Pool', color: 'text-cyan-500' },
  { id: 'fruit-stand', symbol: '🍓', label: 'Fruit stand', color: 'text-yellow-500' },
];

export const MAP_SCALES = [100, 200];


// --- Block Interaction Constants ---
export const BLOCK_DEFINITIONS = {
  horizontal: [100, 200],
  vertical: [100, 200],
};
export const BASE_BLOCK_UNIT_SIZE_PX = 50;
