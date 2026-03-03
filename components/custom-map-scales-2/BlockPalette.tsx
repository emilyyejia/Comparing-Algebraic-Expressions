
import React from 'react';
import DraggableBlock from './DraggableBlock';
import { BLOCK_DEFINITIONS } from '../../levels/custom-map-scales-2/mapScalesConstants2';

interface BlockPaletteProps {
  level: number;
  scale: number;
  baseUnitSize: number;
  showHint: boolean;
  onInteraction: () => void;
}

const BlockPalette: React.FC<BlockPaletteProps> = ({ level, scale, baseUnitSize, showHint, onInteraction }) => {
  // All levels now use the default 100m and 200m blocks.
  const sizes = BLOCK_DEFINITIONS.horizontal; 

  return (
    <div 
      onMouseDown={onInteraction}
      className={`p-4 bg-slate-100 border-2 border-slate-200 rounded-lg transition-all duration-300 ${showHint ? 'pulsing-glow' : ''}`}
    >
      <div className="flex flex-col items-center justify-start gap-6">
        {sizes.map((size) => (
          <div key={size} className="flex flex-col items-center gap-4 w-full">
            <DraggableBlock size={size} orientation="horizontal" scale={scale} baseUnitSize={baseUnitSize} />
            <DraggableBlock size={size} orientation="vertical" scale={scale} baseUnitSize={baseUnitSize} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockPalette;
