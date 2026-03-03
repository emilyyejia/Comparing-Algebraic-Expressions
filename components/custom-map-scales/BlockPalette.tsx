import React from 'react';
import DraggableBlock from './DraggableBlock';
import { BLOCK_DEFINITIONS } from '../../levels/custom-map-scales/mapScalesConstants';

interface BlockPaletteProps {
  scale: number;
  baseUnitSize: number;
  availableSizes: number[];
}

const BlockPalette: React.FC<BlockPaletteProps> = ({ scale, baseUnitSize, availableSizes }) => {
  const sizes = availableSizes; 

  return (
    <div className="p-4 bg-slate-100 border-2 border-slate-200 rounded-lg">
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