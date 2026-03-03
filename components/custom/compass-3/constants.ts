import type { ClueDefinition } from './types';

export const TOTAL_CLUES = 5;

// All clues for the treasure hunt
export const CLUE_DEFINITIONS: ClueDefinition[] = [
  {
    id: 1,
    clueText: "The old pirate's map says the treasure is buried towards the rising sun.",
    targetDirectionName: 'East',
    hiddenDirectionLabels: ['East'],
    successThreshold: 3,
  },
  {
    id: 2,
    clueText: 'To avoid the kraken, sail directly away from the North Star.',
    targetDirectionName: 'South',
    hiddenDirectionLabels: ['South', 'West'],
    successThreshold: 2,
  },
  {
    id: 3,
    clueText: 'The treasure lies 90° counter-clockwise from the South.',
    targetDirectionName: 'East',
    hiddenDirectionLabels: ['East', 'South', 'West'],
    successThreshold: 2,
  },
  {
    id: 4,
    clueText: 'Your compass is spinning! Find West with only North as a guide.',
    targetDirectionName: 'West',
    hiddenDirectionLabels: ['East', 'South', 'West'],
    hasRandomInitialOrientation: true,
    successThreshold: 3,
  },
  {
    id: 5,
    clueText: 'The final clue points 180° from the rising sun. Where is the treasure?',
    targetDirectionName: 'West',
    hiddenDirectionLabels: ['North', 'East', 'South', 'West'],
    hasRandomInitialOrientation: true,
    successThreshold: 4,
  },
];
