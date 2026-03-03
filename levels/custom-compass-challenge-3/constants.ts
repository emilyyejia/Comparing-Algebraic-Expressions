import { Position } from './types';

export const GRID_SIZE: number = 6;
export const INITIAL_EXPLORER_POS: Position = { x: 1, y: 1 };
// TREASURE_POS is removed as it's now dynamic
export const MOVES_FOR_LEVEL_2_TRIGGER: number = 6;

export const EXPLORER_ICON: string = '🚶'; // Person Walking
export const TREASURE_ICON: string = '💎'; // Gem Stone
export const COMPASS_N_ICON: string = 'N';
export const OBSTACLE_ICON: string = '🌲'; // Evergreen Tree

export const OBSTACLE_POSITIONS: Position[] = [
  // Original obstacles
  { x: 2, y: 2 },
  { x: 4, y: 3 },
  { x: 3, y: 5 },
  { x: 5, y: 4 },
  // New obstacles to force more turns
  { x: 4, y: 1 }, // Blocks easy East path along row 1
  { x: 1, y: 4 }, // Blocks easy South path along col 1
  { x: 3, y: 6 }, // Forces turn if approaching treasure from West via row 6
  { x: 6, y: 3 }, // Forces turn if approaching treasure from North via col 6
];
