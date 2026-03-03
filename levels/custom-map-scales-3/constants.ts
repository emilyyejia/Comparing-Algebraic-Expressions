import type { Landmark } from './types';

export const GRID_ROWS = 6;
export const GRID_COLS = 6;

// The full pool of landmarks
export const ALL_LANDMARKS: Omit<Landmark, 'position'>[] = [
  { id: 'linas-house', symbol: '🏠', label: "Lina's house", color: 'text-pink-600' },
  { id: 'school', symbol: '🏫', label: 'School', color: 'text-orange-600' },
  { id: 'park', symbol: '🌳', label: 'Park', color: 'text-green-600' },
  { id: 'pool', symbol: '🏊', label: 'Pool', color: 'text-cyan-500' },
  { id: 'shop', symbol: '🛒', label: 'Shop', color: 'text-purple-600' },
  { id: 'library', symbol: '📚', label: 'Library', color: 'text-blue-600' },
];
