

import React, { useState, useEffect, useCallback } from 'react';
import type { LevelComponentProps, StoryChunk } from '../types';
import { generateStoryChunk } from '../services/geminiService';
import Spinner from '../components/Spinner';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

const StoryLevel: React.FC<LevelComponentProps> = ({ topic, onComplete }) => {
  const [story, setStory] = useState<StoryChunk | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  const fetchNextPart = useCallback(async (choice?: string) => {
    setIsLoading(true);
    const context = [...history, choice].filter(Boolean).join(' ');
    const newChunk = await generateStoryChunk(topic, context);
    setStory(newChunk);
    if(newChunk.text) {
        setHistory(h => [...h, newChunk.text]);
    }
    setIsLoading(false);
  }, [topic, history]);

  useEffect(() => {
    fetchNextPart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoice = (choice: string) => {
    setHistory(h => [...h, `I chose to ${choice}.`]);
    fetchNextPart(choice);
  };
  
  if (isLoading && !story) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Spinner />
        <p className="mt-4 text-lg">Weaving a story about {topic}...</p>
      </div>
    );
  }
  
  if (!story) {
    return <div className="text-center text-red-400">The story could not be loaded.</div>
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} />
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        title="Interactive Story Instructions"
      >
        <p>Read the paragraph of the story about {topic}.</p>
        <p>At the end of each part, you will be given two choices. Select the choice you think will lead to the best outcome.</p>
        <p>Your choices will shape the direction of the story. See where your adventure takes you!</p>
      </InstructionModal>

      <div className="w-full max-w-3xl">
        <div className="bg-gray-900/50 p-6 rounded-lg mb-6 min-h-[150px]">
           {isLoading ? (
             <div className="flex items-center justify-center h-full">
                <Spinner />
             </div>
           ) : (
            <p className="text-lg leading-relaxed whitespace-pre-wrap animate-fade-in">{story.text}</p>
           )}
        </div>
        
        { !isLoading && (
            <div className="animate-fade-in">
            {story.choices && story.choices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {story.choices.map((choice, index) => (
                    <button
                    key={index}
                    onClick={() => handleChoice(choice)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-5 rounded-lg transition-transform duration-200 hover:scale-105"
                    >
                    {choice}
                    </button>
                ))}
                </div>
            ) : (
                <div className="text-center">
                <p className="text-2xl font-bold text-sky-400 mb-4">The End</p>
                <button
                    onClick={() => onComplete(3)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform duration-200 hover:scale-105"
                >
                    Complete Level
                </button>
                </div>
            )}
            </div>
        )}
      </div>
    </div>
  );
};

export default StoryLevel;
