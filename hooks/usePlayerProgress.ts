
import { useState, useCallback, useMemo } from 'react';
import type { Lesson, PlayerProgress } from '../types';

export type PartialProgress = {
  [levelId: string]: any;
};

interface UsePlayerProgressReturn {
  progress: PlayerProgress;
  partialProgress: PartialProgress;
  manuallyUnlockedLevels: string[];
  completeLevel: (levelId: string, stars: number) => void;
  savePartialProgress: (levelId: string, state: any | null) => void;
  unlockLevel: (levelId: string) => void;
  unlockAll: () => void;
  resetProgress: () => void;
  selectedAvatar: string | null;
  setSelectedAvatar: (avatar: string) => void;
}

export const usePlayerProgress = (lessons: Lesson[]): UsePlayerProgressReturn => {
  const allLevels = useMemo(() => lessons.flatMap(lesson => lesson.levels), [lessons]);

  const getInitialProgress = useCallback(() => {
    const initialProgress: PlayerProgress = {};
    allLevels.forEach((level) => {
      initialProgress[level.id] = 0;
    });
    return initialProgress;
  }, [allLevels]);

  const [progress, setProgress] = useState<PlayerProgress>(getInitialProgress);
  const [partialProgress, setPartialProgress] = useState<PartialProgress>({});
  const [manuallyUnlockedLevels, setManuallyUnlockedLevels] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const savePartialProgress = useCallback((levelId: string, state: any | null) => {
    setPartialProgress(prev => {
      const newProgress = { ...prev };
      if (state === null) {
        delete newProgress[levelId];
      } else {
        newProgress[levelId] = state;
      }
      return newProgress;
    });
  }, []);

  const completeLevel = useCallback((levelId: string, stars: number) => {
    setProgress(prevProgress => {
      const currentStars = prevProgress[levelId] || 0;
      const newStars = Math.max(currentStars, stars);
      
      if (newStars === currentStars) {
        return prevProgress;
      }

      return {
        ...prevProgress,
        [levelId]: newStars,
      };
    });
    savePartialProgress(levelId, null);
  }, [savePartialProgress]);

  const unlockLevel = useCallback((levelId: string) => {
    setManuallyUnlockedLevels(prev => [...new Set([...prev, levelId])]);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(getInitialProgress());
    setPartialProgress({});
    setManuallyUnlockedLevels([]);
    setSelectedAvatar(null);
  }, [getInitialProgress]);

  const unlockAll = useCallback(() => {
    setProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      allLevels.forEach(level => {
        newProgress[level.id] = 3;
      });
      return newProgress;
    });
  }, [allLevels]);

  return { 
    progress, 
    partialProgress, 
    manuallyUnlockedLevels, 
    completeLevel, 
    savePartialProgress, 
    unlockLevel, 
    unlockAll, 
    resetProgress, 
    selectedAvatar, 
    setSelectedAvatar 
  };
};
