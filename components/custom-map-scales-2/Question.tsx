
import React, { useState } from 'react';

interface QuestionProps {
  question: string;
  onAnswerSubmit: (answer: string) => void;
}

const Question: React.FC<QuestionProps> = ({ question, onAnswerSubmit }) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer) {
      onAnswerSubmit(answer);
    }
  };

  return (
    <div className="p-6 bg-slate-50 border-2 border-slate-200 rounded-lg">
      <h3 className="text-xl font-semibold text-slate-700 mb-4">{question}</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center border-2 bg-white border-slate-300 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500 transition">
           <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="How far?"
            className="p-2 w-32 bg-transparent focus:outline-none text-slate-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            aria-label="Enter your numeric answer"
            required
          />
          <span className="pr-3 font-semibold text-slate-500">m</span>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors w-full sm:w-auto disabled:bg-slate-400 disabled:cursor-not-allowed"
          disabled={!answer}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Question;
