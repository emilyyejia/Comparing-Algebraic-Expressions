

import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps, QuizQuestion } from '../types';
import { generateQuiz } from '../services/geminiService';
import Spinner from '../components/Spinner';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

const QuizLevel: React.FC<LevelComponentProps> = ({ topic, onComplete, questions: questionsProp, partialProgress, onSavePartialProgress }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => partialProgress?.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => partialProgress?.currentQuestionIndex || 0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(() => partialProgress?.score || 0);
  const [isLoading, setIsLoading] = useState(() => !questions.length);
  const isCompletedRef = useRef(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

  useEffect(() => {
    if (questions.length > 0) return;

    const loadQuestions = async () => {
      setIsLoading(true);
      if (questionsProp && questionsProp.length > 0) {
        setQuestions(questionsProp);
      } else {
        const quizQuestions = await generateQuiz(topic);
        setQuestions(quizQuestions);
      }
      setIsLoading(false);
    };
    loadQuestions();
  }, [topic, questionsProp, questions.length]);
  
  // Save state on unmount
  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress && questions.length > 0 && currentQuestionIndex < questions.length) {
        onSavePartialProgress({
          questions,
          currentQuestionIndex,
          score,
        });
      }
    };
  }, [onSavePartialProgress, questions, currentQuestionIndex, score]);

  const currentQuestion = questions[currentQuestionIndex];
  const isMultiChoice = currentQuestion?.type === 'multi';

  const handleAnswerSelect = (option: string) => {
    if (isMultiChoice) {
      setSelectedAnswers(prev => 
        prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
      );
    } else {
      setSelectedAnswers([option]);
    }
  };

  const handleAnswerSubmit = () => {
    if (selectedAnswers.length === 0) return;

    const correctAnswers = new Set(currentQuestion.correctAnswers);
    const selected = new Set(selectedAnswers);
    
    const correct = selected.size === correctAnswers.size && [...selected].every(answer => correctAnswers.has(answer));

    setIsCorrect(correct);
    if (correct) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      setIsCorrect(null);
      setSelectedAnswers([]);
      setCurrentQuestionIndex(i => i + 1);
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Spinner />
        <p className="mt-4 text-lg">Generating your {topic} quiz...</p>
      </div>
    );
  }

  if (questions.length === 0 || questions[0].question.startsWith("Could not load")) {
      return <div className="text-center text-red-400">{questions[0]?.question || "An unknown error occurred."}</div>
  }
  
  if (currentQuestionIndex >= questions.length) {
    const percentage = questions.length > 0 ? score / questions.length : 0;
    let stars = 0;
    if (percentage === 1) { // All correct
        stars = 3;
    } else if (percentage >= 0.6) { // 60% or more
        stars = 2;
    } else if (score > 0) { // At least one correct
        stars = 1;
    }

    const handleComplete = (stars: number) => {
        isCompletedRef.current = true;
        onComplete(stars);
    };

    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h2 className="text-4xl font-bold text-sky-400 mb-4">Quiz Complete!</h2>
        <p className="text-xl mb-6">You scored {score} out of {questions.length}.</p>
        <button
          onClick={() => handleComplete(stars)}
          className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform duration-200 hover:scale-105"
        >
          Complete Level
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
        title={`${topic} Quiz Instructions`}
      >
        <p>Answer the multiple-choice questions about {topic}.</p>
        <p>Some questions may have a single correct answer, while others may require you to select multiple correct answers.</p>
        <p>Your score will be calculated at the end. Good luck!</p>
      </InstructionModal>

      <div className="w-full max-w-2xl">
        <p className="text-gray-400 mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">{currentQuestion.question}</h2>
        {isMultiChoice && <p className="text-center text-sky-300 mb-4">(Select all that apply)</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            let buttonClass = 'bg-gray-700 hover:bg-indigo-500';
            const isSelected = selectedAnswers.includes(option);
            const isCorrectAnswer = currentQuestion.correctAnswers.includes(option);

            if (isCorrect !== null) { // After submission
              if (isCorrectAnswer) {
                buttonClass = 'bg-emerald-500'; // always show correct answers
              } else if (isSelected) {
                buttonClass = 'bg-red-500'; // show my incorrect selections
              } else {
                buttonClass = 'bg-gray-600 opacity-50'; // other incorrect options
              }
            } else if (isSelected) { // Before submission
                buttonClass = 'bg-indigo-600 ring-2 ring-sky-400';
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={isCorrect !== null}
                className={`p-4 rounded-lg text-left text-lg transition-all duration-300 ${buttonClass}`}
              >
                {option}
              </button>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <button
            onClick={handleAnswerSubmit}
            disabled={selectedAnswers.length === 0 || isCorrect !== null}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-200 disabled:transform-none hover:scale-105"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizLevel;
