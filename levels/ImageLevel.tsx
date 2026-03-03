import React, { useState, useEffect } from 'react';
import type { LevelComponentProps, QuizQuestion } from '../types';
import { generateImageForTopic, generateQuestionForTopic } from '../services/geminiService';
import Spinner from '../components/Spinner';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

const ImageLevel: React.FC<LevelComponentProps> = ({ topic, onComplete }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      const [imgUrl, q] = await Promise.all([
        generateImageForTopic(topic),
        generateQuestionForTopic(topic),
      ]);
      setImageUrl(imgUrl);
      setQuestion(q);
      setIsLoading(false);
    };
    fetchContent();
  }, [topic]);

  const handleAnswerSubmit = () => {
    if (!question || selectedAnswer === null) return;
    const correct = selectedAnswer === question.correctAnswers[0];
    setIsCorrect(correct);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Spinner />
        <p className="mt-4 text-lg">Creating an artistic challenge about {topic}...</p>
      </div>
    );
  }

  if (!imageUrl || !question) {
    return <div className="text-center text-red-400">Could not load the challenge.</div>;
  }
  
  if(isCorrect) {
     return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-4xl font-bold text-emerald-400 mb-4">Correct!</h2>
        <p className="text-xl mb-6">You've mastered the concept of {topic}.</p>
        <button
          onClick={() => onComplete(3)}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform duration-200 hover:scale-105"
        >
          Complete Level
        </button>
      </div>
    );
  }


  return (
    <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-8 p-4">
      <InstructionButton onClick={() => setIsInstructionModalOpen(true)} />
      <InstructionModal
        isOpen={isInstructionModalOpen}
        onClose={() => setIsInstructionModalOpen(false)}
        title="Image Challenge Instructions"
      >
        <p>Observe the image generated based on the topic: {topic}.</p>
        <p>Read the multiple-choice question related to the image and the topic.</p>
        <p>Select the answer you believe is correct and submit to see if you are right.</p>
      </InstructionModal>

      <div className="lg:w-1/2 w-full">
        <img src={imageUrl} alt={topic} className="rounded-xl shadow-2xl object-cover w-full h-full" />
      </div>
      <div className="lg:w-1/2 w-full flex flex-col justify-center">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">{question.question}</h2>
        <div className="grid grid-cols-1 gap-3">
          {question.options.map((option, index) => {
             let buttonClass = 'bg-gray-700 hover:bg-indigo-500';
             if (isCorrect === false && option === selectedAnswer) {
               buttonClass = 'bg-red-500';
             } else if (isCorrect === false) {
               buttonClass = 'bg-gray-600 opacity-50';
             } else if(selectedAnswer === option) {
                buttonClass = 'bg-indigo-600 ring-2 ring-sky-400'
             }
            return (
              <button
                key={index}
                onClick={() => setSelectedAnswer(option)}
                disabled={isCorrect !== null}
                className={`p-4 rounded-lg text-left text-lg transition-all duration-300 ${buttonClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>
         {isCorrect === false && (
            <p className="text-red-400 mt-4 text-center">Not quite, try again! The correct answer was: {question.correctAnswers[0]}</p>
        )}
        <div className="mt-6 text-center">
          <button
            onClick={handleAnswerSubmit}
            disabled={selectedAnswer === null || isCorrect !== null}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-200 disabled:transform-none hover:scale-105"
          >
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageLevel;
