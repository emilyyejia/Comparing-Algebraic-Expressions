

import React, { useState, useRef, useEffect } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

interface VideoLevelProps extends LevelComponentProps {
  url: string;
}

const StarIcon: React.FC<{ filled: boolean; className?: string }> = ({ filled, className = "w-10 h-10 md:w-12 md:h-12 mx-1" }) => (
    <svg
      className={`${className} ${filled ? 'text-yellow-400' : 'text-gray-400'}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? "0" : "1.5"}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
      />
    </svg>
);


const VideoLevel: React.FC<VideoLevelProps> = ({ onComplete, onExit, url, topic, partialProgress, onSavePartialProgress }) => {
  const [completionStatus, setCompletionStatus] = useState<'pending' | 'success' | 'incomplete'>('pending');
  const videoRef = useRef<HTMLVideoElement>(null);
  const isCompletedRef = useRef(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  // On mount: check for saved progress and seek video
  useEffect(() => {
    const video = videoRef.current;
    if (video && partialProgress?.currentTime) {
      const seekTime = Math.max(0, partialProgress.currentTime - 3); // Rewind 3 seconds

      const handleSeek = () => {
        if (video.readyState >= 1) { // HAVE_METADATA or more
            video.currentTime = seekTime;
        }
      };

      if (video.readyState >= 1) {
        handleSeek();
      } else {
        video.addEventListener('loadedmetadata', handleSeek, { once: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount. partialProgress is stable for this component instance.

  // On unmount: save current progress
  useEffect(() => {
    const video = videoRef.current;
    return () => {
      if (video && !isCompletedRef.current && onSavePartialProgress) {
        if (video.currentTime > 1 && !video.ended) {
          onSavePartialProgress({ currentTime: video.currentTime });
        } else {
          // If video ended or user leaves at the very beginning, clear progress.
          onSavePartialProgress(null);
        }
      }
    };
  }, [onSavePartialProgress]);

  const handleVideoEnd = () => {
    const video = videoRef.current;
    if (!video) return;

    let totalWatchedTime = 0;
    const playedRanges = video.played;

    for (let i = 0; i < playedRanges.length; i++) {
        totalWatchedTime += playedRanges.end(i) - playedRanges.start(i);
    }

    const videoDuration = video.duration;
    // Check for NaN or 0 duration to avoid division by zero
    const watchPercentage = videoDuration > 0 ? totalWatchedTime / videoDuration : 0;
    
    if (watchPercentage >= 0.95) {
      isCompletedRef.current = true; // Mark as completed
      onSavePartialProgress?.(null); // Clear any partial progress
      onComplete(1);
      setCompletionStatus('success');
    } else {
      setCompletionStatus('incomplete');
    }
  };

  const handleReplay = () => {
    setCompletionStatus('pending');
    isCompletedRef.current = false; // Reset completion status on replay
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  const handleBackToMap = () => {
    setCompletionStatus('pending');
    onExit?.();
  };


  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} />
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        title="Video Lesson Instructions"
      >
        <p>Watch the video about {topic}.</p>
        <p>You must watch at least 95% of the video to complete this bonus mission.</p>
        <p>If you leave, your progress will be saved so you can resume later.</p>
      </InstructionModal>
      <div className="w-full max-w-4xl aspect-video relative">
        <video
          ref={videoRef}
          src={url}
          title={topic}
          className="w-full h-full border-2 border-sky-500/50 rounded-lg bg-black"
          controls
          autoPlay
          onEnded={handleVideoEnd}
        />
      </div>
      
      {completionStatus === 'success' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] p-4 antialiased animate-fade-in">
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
              Bonus mission complete!
            </h2>
            <div className="flex justify-center my-5 md:my-8">
              <StarIcon filled={true} className="w-12 h-12 md:w-16 md:h-16 mx-1.5 md:mx-2"/>
            </div>
            
            <div className="mt-6 md:mt-8 flex justify-center items-start gap-4">
                <button
                    onClick={handleReplay}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    aria-label="Replay the video"
                >
                    Replay
                </button>
                <button
                    onClick={handleBackToMap}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75"
                    aria-label="Back to Map"
                >
                    Back to Map
                </button>
            </div>
          </div>
        </div>
      )}

      {completionStatus === 'incomplete' && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-[100] p-4 antialiased animate-fade-in">
          <div className="bg-white p-6 md:p-10 rounded-xl shadow-2xl text-center max-w-md w-full">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Watch the full video to complete this mission!
            </h2>
            
            <div className="mt-8 flex justify-center items-start gap-4">
                <button
                    onClick={handleReplay}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
                    aria-label="Replay the video"
                >
                    Replay
                </button>
                <button
                    onClick={handleBackToMap}
                    className="px-8 py-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75"
                    aria-label="Back to Map"
                >
                    Back to Map
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoLevel;
