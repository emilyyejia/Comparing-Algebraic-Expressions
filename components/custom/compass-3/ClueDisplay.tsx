import React from 'react';

interface ClueDisplayProps {
  clueText: string;
}

const ClueDisplay: React.FC<ClueDisplayProps> = ({ clueText }) => (
  <div className="relative p-6 bg-yellow-50 border-4 border-amber-800/50 rounded-lg shadow-lg max-w-lg mx-auto mb-8">
    <div 
      className="absolute -top-2 -left-2 w-4 h-4 bg-amber-800 rounded-full" 
      aria-hidden="true"
    />
    <div 
      className="absolute -top-2 -right-2 w-4 h-4 bg-amber-800 rounded-full" 
      aria-hidden="true"
    />
    <div 
      className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-800 rounded-full" 
      aria-hidden="true"
    />
    <div 
      className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-800 rounded-full" 
      aria-hidden="true"
    />
    <p className="text-amber-900 text-xl md:text-2xl font-serif italic text-center">
      “{clueText}”
    </p>
  </div>
);

export default ClueDisplay;
