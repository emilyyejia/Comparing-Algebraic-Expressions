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

export interface MysteryPoint {
  id: string;
  position: {
    row: number;
    col: number;
  };
  revealedSymbol: string;
  revealedLabel: string;
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

export interface LevelData {
  level: number;
  landmarks: Landmark[];
  scale: number;
  mysteryPoints: MysteryPoint[];
  player: Player;
}