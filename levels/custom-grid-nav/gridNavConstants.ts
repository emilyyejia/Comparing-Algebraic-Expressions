import type { Landmark } from './gridNavTypes';

export const GRID_ROWS = 6;
export const GRID_COLS = 6;

// The full pool of landmarks
export const ALL_LANDMARKS: Omit<Landmark, 'position'>[] = [
  { id: 'train-station', symbol: '🚆', label: 'Train station', color: 'text-purple-600' },
  { id: 'library', symbol: '📚', label: 'Library', color: 'text-blue-600' },
  { id: 'pool', symbol: '🏊', label: 'Pool', color: 'text-cyan-500' },
  { id: 'shop', symbol: '🛒', label: 'Shop', color: 'text-pink-600' },
];