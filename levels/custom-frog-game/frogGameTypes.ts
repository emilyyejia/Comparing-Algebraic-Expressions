
export interface Position {
  row: number;
  col: number;
}

export enum CharacterType {
  FROG = 'FROG',
  WORM = 'WORM',
  NONE = 'NONE'
}

export enum Direction {
  NORTH = 'N',
  SOUTH = 'S',
  EAST = 'E',
  WEST = 'W',
}
