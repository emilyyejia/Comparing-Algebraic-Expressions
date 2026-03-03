export interface Landmark {
  id: string;
  symbol: string;
  label: string;
  position: {
    // 1-based, can be fractional for in-between placement
    row: number;
    col: number;
  };
  color: string; // Tailwind CSS text color class
}

export type BlockOrientation = 'horizontal' | 'vertical';

export interface DraggableItem {
  id: string; // e.g., 'h-100'
  size: number; // 50, 100, 200
  orientation: BlockOrientation;
}

export interface PlacedBlock {
  id: number;
  type: string; // e.g., 'h-100'
  size: number;
  position: {
    // Top-left corner of the block on the grid
    row: number; // 1-based from bottom
    col: number; // 1-based from left
  };
  orientation: BlockOrientation;
  isCorrect: boolean;
}

export interface LevelSolution {
  landmark1: Landmark;
  landmark2: Landmark;
  distance: number; // in grid units
  orientation: BlockOrientation;
  // The line on which blocks must be placed
  line: number; // row index or col index
  // The start and end of the valid placement area on that line
  start: number;
  end: number;
}

export interface LevelData {
  level: number;
  landmarks: Landmark[];
  scale: number;
  solution: LevelSolution;
}
