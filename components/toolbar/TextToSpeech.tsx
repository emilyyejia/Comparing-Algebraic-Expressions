import React, { useState, useEffect, useRef } from 'react';
import { useToolbar } from '../../hooks/useToolbarState';

interface TextToSpeechProps {
    contentRef: React.RefObject<HTMLElement>;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({ contentRef }) => {
    const { toggleTool } = useToolbar();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

    const handlePlay = () => {
        if (!contentRef.current) return;
        if (speechSynthesis.speaking && isPaused) {
            speechSynthesis.resume();
            setIsPlaying(true);
            setIsPaused(false);
            return;
        }

        const text = contentRef.current.innerText;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = playbackRate;
        utterance.onend = () => {
            setIsPlaying(false);
            setIsPaused(false);
        };
        utteranceRef.current = utterance;
        speechSynthesis.cancel(); // Clear any previous speech
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
        setIsPaused(false);
    };

    const handlePause = () => {
        speechSynthesis.pause();
        setIsPlaying(false);
        setIsPaused(true);
    };

    const handleStop = () => {
        speechSynthesis.cancel();
        setIsPlaying(false);
        setIsPaused(false);
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        if (utteranceRef.current) {
            // If speech is ongoing, we need to stop and restart to change speed.
            const wasPlaying = isPlaying;
            speechSynthesis.cancel();
            if(wasPlaying){
                handlePlay(); // Restart with new rate
            }
        }
    }, [playbackRate]);

    return (
        <div className="fixed top-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm text-white p-2 flex items-center justify-center gap-4 z-[160] animate-fade-in">
            {!isPlaying && !isPaused ? (
                <button onClick={handlePlay} className="p-2 rounded-full hover:bg-gray-700" aria-label="Play"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.841Z" /></svg></button>
            ) : (
                <button onClick={handlePause} className="p-2 rounded-full hover:bg-gray-700" aria-label="Pause"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.75 3a.75.75 0 0 0-.75.75v12.5a.75.75 0 0 0 1.5 0V3.75A.75.75 0 0 0 5.75 3Zm8.5 0a.75.75 0 0 0-.75.75v12.5a.75.75 0 0 0 1.5 0V3.75a.75.75 0 0 0-.75-.75Z" /></svg></button>
            )}
             {isPaused && (
                <button onClick={handlePlay} className="p-2 rounded-full hover:bg-gray-700" aria-label="Resume"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.841Z" /></svg></button>
            )}
            <button onClick={handleStop} disabled={!isPlaying && !isPaused} className="p-2 rounded-full hover:bg-gray-700 disabled:opacity-50" aria-label="Stop"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3h-9.5Z" /></svg></button>
            
            <div className="relative">
                <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-3 py-1 rounded-md hover:bg-gray-700 text-sm font-semibold"
                    aria-label={`Playback speed: ${playbackRate === 1 ? 'Normal' : `${playbackRate}x`}`}
                >
                    {playbackRate === 1 ? 'Speed' : `${playbackRate}x`}
                </button>
                {showSpeedMenu && (
                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-700 rounded-md shadow-lg py-1 z-[170]">
                        {rates.map(rate => (
                            <button 
                                key={rate} 
                                onClick={() => { setPlaybackRate(rate); setShowSpeedMenu(false); }}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 ${playbackRate === rate ? 'font-bold text-sky-400' : ''}`}
                            >
                                {rate === 1 ? 'Normal' : `${rate}x`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button onClick={() => toggleTool('listen')} className="absolute right-4 p-2 rounded-full hover:bg-gray-700" aria-label="Close text to speech">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" /></svg>
            </button>
        </div>
    );
};

export default TextToSpeech;