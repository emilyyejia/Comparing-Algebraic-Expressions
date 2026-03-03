export type DirectionName = 'North' | 'East' | 'South' | 'West';

// Defines the raw data for a single step in the treasure hunt
export interface ClueDefinition {
  id: number;
  clueText: string; // The text shown to the user
  targetDirectionName: DirectionName;
  hiddenDirectionLabels?: DirectionName[];
  hasRandomInitialOrientation?: boolean;
  successThreshold?: number;
}
