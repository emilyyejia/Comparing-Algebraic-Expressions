export interface Landmark {
  id: string;
  symbol: string;
  label: string;
  position: {
    // 0-based integer, bottom-left origin. e.g. {col: 0, row: 0} is the bottom-left corner.
    row: number;
    col: number;
  };
  color: string; // Tailwind CSS text color class
}

export interface ScheduleItem {
  time: string;
  fromId: string;
  toId: string;
}

export type Direction = 'N' | 'S' | 'E' | 'W';

export interface PlacedArrow {
  id: string; // e.g., "3,4-N"
  from: { col: number, row: number };
  direction: Direction;
  status: 'correct' | 'incorrect';
  tripIndex: number;
}


export interface LevelData {
  level: number;
  landmarks: Landmark[];
  scale: number;
  schedule: ScheduleItem[];
}
