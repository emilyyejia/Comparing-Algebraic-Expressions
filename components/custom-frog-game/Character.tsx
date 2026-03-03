
import React from 'react';
import { CharacterType } from '../../levels/custom-frog-game/frogGameTypes';
import { CHARACTER_EMOJI_SIZE_TW } from '../../levels/custom-frog-game/frogGameConstants';

interface CharacterProps {
  type: CharacterType;
}

const Character: React.FC<CharacterProps> = ({ type }) => {
  const getEmoji = () => {
    switch (type) {
      case CharacterType.FROG:
        return '🐸';
      case CharacterType.WORM:
        return '🐛';
      default:
        return null;
    }
  };

  if (type === CharacterType.NONE) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${CHARACTER_EMOJI_SIZE_TW} animate-pulse`}>
      {getEmoji()}
    </div>
  );
};

export default Character;
