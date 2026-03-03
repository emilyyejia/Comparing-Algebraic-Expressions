import { Position } from './frogGameTypes';

export const GRID_SIZE: number = 6;
export const INITIAL_FROG_POSITION: Position = { row: 0, col: 0 };
export const INITIAL_WORM_POSITION: Position = { row: GRID_SIZE - 1, col: GRID_SIZE - 1 };

export const CELL_SIZE_TW: string = "w-14 h-14 sm:w-16 sm:h-16"; // Tailwind classes for cell size
export const CHARACTER_EMOJI_SIZE_TW: string = "text-3xl sm:text-4xl"; // Tailwind classes for character emoji size
export const FLY_EMOJI_SIZE_TW: string = "text-2xl sm:text-3xl"; // Tailwind classes for fly emoji

export const DYNAMIC_FLY_DURATION_MS: number = 3000; // How long a dynamic fly stays (3 seconds)
export const DYNAMIC_FLY_RESPAWN_DELAY_MS: number = 200; // Delay before trying to spawn next dynamic fly (0.2 seconds)