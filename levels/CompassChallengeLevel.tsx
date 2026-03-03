import React, { useState, useEffect, useCallback } from 'react';
import type { LevelComponentProps } from '../types';
import { getCompassChallengeResponse } from '../services/geminiService';
import Spinner from '../components/Spinner';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
);


const CompassChallengeLevel: React.FC<LevelComponentProps> = ({ onComplete, topic }) => {
    const [history, setHistory] = useState<string[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [gameState, setGameState] = useState<'CONTINUE' | 'WIN' | 'LOSE'>('CONTINUE');
    const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

    const fetchNextStep = useCallback(async (currentHistory: string[]) => {
        setIsLoading(true);
        const response = await getCompassChallengeResponse(currentHistory);
        setHistory(prev => [...prev, `AI: ${response.text}`]);
        setGameState(response.status);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        // Fetch initial scenario
        fetchNextStep([]);
    }, [fetchNextStep]);

    const handleReset = () => {
        setHistory([]);
        setUserInput('');
        setGameState('CONTINUE');
        fetchNextStep([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newHistory = [...history, `USER: ${userInput.trim()}`];
        setHistory(newHistory);
        setUserInput('');
        fetchNextStep(newHistory);
    };

    if (isLoading && history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Spinner />
                <p className="mt-4 text-lg">Preparing your compass challenge...</p>
            </div>
        );
    }
    
    if (gameState === 'WIN') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
                <CheckCircleIcon className="w-20 h-20 text-emerald-400 mb-4" />
                <h2 className="text-4xl font-bold text-emerald-400 mb-4">Treasure Found!</h2>
                {/* FIX: Replace .at(-1) with bracket notation for broader compatibility. */}
                <p className="text-xl mb-6 max-w-md">{history[history.length - 1]?.replace('AI: ', '')}</p>
                <button
                    onClick={() => onComplete(3)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform duration-200 hover:scale-105"
                >
                    Complete Level
                </button>
            </div>
        );
    }
    
    if (gameState === 'LOSE') {
         return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
                <XCircleIcon className="w-20 h-20 text-red-400 mb-4" />
                <h2 className="text-4xl font-bold text-red-400 mb-4">Dead End!</h2>
                {/* FIX: Replace .at(-1) with bracket notation for broader compatibility. */}
                <p className="text-xl mb-6 max-w-md">{history[history.length - 1]?.replace('AI: ', '')}</p>
                <button
                    onClick={handleReset}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-200 hover:scale-105"
                >
                    Try Again
                </button>
            </div>
        );
    }


    return (
        <div className="flex flex-col items-center justify-center h-full p-4">
            <InstructionButton onClick={() => setIsInstructionModalOpen(true)} />
            <InstructionModal
                isOpen={isInstructionModalOpen}
                onClose={() => setIsInstructionModalOpen(false)}
                title="Compass Adventure Instructions"
            >
                <p>You are on a text-based adventure to find a hidden treasure!</p>
                <p>Read the AI's description of your surroundings.</p>
                <p>Enter a direction (like "North", "East", "South", or "West") to move.</p>
                <p>Find the treasure by following the correct path. Be careful, two wrong moves and you're lost!</p>
            </InstructionModal>

            <div className="w-full max-w-2xl">
                <h2 className="text-3xl font-bold text-sky-300 mb-4 text-center">{topic}</h2>
                <div className="bg-gray-800/70 p-6 rounded-lg mb-6 min-h-[200px] max-h-[40vh] overflow-y-auto flex flex-col gap-4">
                    {history.map((line, index) => (
                        <p key={index} className={`whitespace-pre-wrap ${line.startsWith('USER:') ? 'text-sky-300 italic text-right' : 'text-gray-200'}`}>
                           {line.replace(/^(AI: |USER: )/, '')}
                        </p>
                    ))}
                    {isLoading && <div className="self-center"><Spinner/></div>}
                </div>

                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Enter a direction (e.g., Go North)..."
                        disabled={isLoading}
                        className="flex-grow bg-gray-700 text-white placeholder-gray-400 p-3 rounded-lg border-2 border-transparent focus:border-sky-500 focus:outline-none focus:ring-0 transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                        className="bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-transform duration-200 disabled:transform-none hover:scale-105"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompassChallengeLevel;