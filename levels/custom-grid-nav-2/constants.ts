import type { Landmark } from './types';

export const GRID_ROWS = 7;
export const GRID_COLS = 7;
export const TOTAL_LEVELS = 1;

// The full pool of landmarks
export const ALL_LANDMARKS: Omit<Landmark, 'position'>[] = [
  { id: 'library', symbol: '📚', label: 'Library', color: 'text-blue-600' },
  { id: 'pool', symbol: '🏊', label: 'Pool', color: 'text-cyan-500' },
  { id: 'shop', symbol: '🛒', label: 'Shop', color: 'text-pink-600' },
  { id: 'park', symbol: '🌳', label: 'Park', color: 'text-green-600' },
  { id: 'bridge', symbol: '🌉', label: 'Bridge', color: 'text-gray-600' },
];
