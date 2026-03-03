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

export interface Player {
  id: string;
  symbol: string;
  label: string;
  position: {
    row: number;
    col: number;
  };
}

export interface Move {
  distance: number; // in metres
  direction: 'north' | 'east' | 'south' | 'west';
}

export interface Instruction {
  text: string;
  moves: Move[];
  relativeToLandmark?: string; // e.g., 'shop'
}

export interface LevelData {
  level: number;
  landmarks: Landmark[];
  scale: number;
  player: Player;
  instructions: Instruction[];
}
