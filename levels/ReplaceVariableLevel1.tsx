
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { LevelComponentProps } from '../types';
import CompletionModal from '../components/CompletionModal';

type Step = 1 | 2 | 3;

interface LevelParams {
  a: number;
  b: number;
  v: number;
  varName: string;
}

const generateParams = (): LevelParams => {
  // Removed 'x' to avoid confusion with multiplication symbol
  const vars = ['y', 'n', 'z', 'a', 'k', 'p'];
  return {
    a: Math.floor(Math.random() * 4) + 2, // 2-5
    b: Math.floor(Math.random() * 9) + 1, // 1-9
    v: Math.floor(Math.random() * 4) + 2, // 2-5
    varName: vars[Math.floor(Math.random() * vars.length)]
  };
};

const ReplaceVariableLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, partialProgress, onSavePartialProgress, onProgressUpdate }) => {
  const [params, setParams] = useState<LevelParams>(() => partialProgress?.params || generateParams());
  const [step, setStep] = useState<Step>(() => partialProgress?.step || 1);
  const [feedback, setFeedback] = useState<{ text: string; type: 'hint' | 'success' | 'error' } | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedMcq, setSelectedMcq] = useState<string | null>(null);
  const [isEvaluationCorrect, setIsEvaluationCorrect] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [errorCount, setErrorCount] = useState(() => partialProgress?.errorCount || 0);
  
  const isCompletedRef = useRef(false);

  useEffect(() => {
    onProgressUpdate?.(step, 3);
  }, [step, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
      setStep(partialProgress.jumpToIndex as Step);
    }
  }, [partialProgress?.jumpToIndex]);

  // Ensure the user sees the modal at the top of the screen when the level finishes
  useEffect(() => {
    if (showCompletion) {
      const container = document.getElementById('level-content-container');
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [showCompletion]);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ step, errorCount, params });
      }
    };
  }, [onSavePartialProgress, step, errorCount, params]);

  const handleVariableClick = (char: string) => {
    if (char === params.varName) {
      setFeedback({ text: `Correct! '${params.varName}' is the variable.`, type: 'success' });
      setTimeout(() => {
        setStep(2);
        setFeedback(null);
      }, 1000);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback({ 
        text: "Try again! The variable is the letter in the expression.", 
        type: 'hint' 
      });
    }
  };

  const handleMcqSubmit = (choice: string) => {
    setSelectedMcq(choice);
    if (choice === 'B') {
      setFeedback({ text: "Perfect! You're swapping the letter for the number.", type: 'success' });
      setTimeout(() => {
        setStep(3);
        setFeedback(null);
      }, 1000);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback({ text: "Try again!", type: 'error' });
    }
  };

  const correctResult = useMemo(() => params.a * params.v + params.b, [params]);

  const handleEvaluate = () => {
    if (parseInt(inputValue) === correctResult) {
      setFeedback({ text: `Excellent! ${params.a}(${params.v}) + ${params.b} = ${params.a * params.v} + ${params.b} = ${correctResult}`, type: 'success' });
      setIsEvaluationCorrect(true);
      setTimeout(() => {
        handleFinishLevel();
      }, 1500);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback({ text: "Try again!", type: 'error' });
    }
  };

  const handleFinishLevel = () => {
    // 3 Stars: 0 to 1 total errors.
    // 2 Stars: 2 total errors.
    // 1 Star: More than 2 errors.
    const stars = errorCount <= 1 ? 3 : errorCount === 2 ? 2 : 1;
    isCompletedRef.current = true;
    onComplete(stars);
    setShowCompletion(true);
  };

  const handleReplay = () => {
    setParams(generateParams());
    setStep(1);
    setFeedback(null);
    setInputValue('');
    setSelectedMcq(null);
    setIsEvaluationCorrect(false);
    setShowCompletion(false);
    setErrorCount(0);
    isCompletedRef.current = false;
  };

  if (showCompletion) {
    const stars = errorCount <= 1 ? 3 : errorCount === 2 ? 2 : 1;
    const tip = "Answer correctly on your first try to earn more stars!";
    return (
      <CompletionModal 
        stars={stars} 
        onReplay={stars < 3 ? handleReplay : undefined} 
        onNext={stars >= 2 ? onNext : undefined}
        hint={stars < 3 ? tip : undefined}
        // Removing onBackToMap button as requested for all star tiers
        onBackToMap={undefined}
      />
    );
  }

  const mcqOptions = [
    { id: 'A', text: `Solve for ${params.varName} by making ${params.a}${params.varName} + ${params.b} = 0.` },
    { id: 'B', text: `Put the number ${params.v} in the place of the letter ${params.varName}.` },
    { id: 'C', text: `Add ${params.v} to the end of the expression (${params.a}${params.varName} + ${params.b} + ${params.v}).` },
    { id: 'D', text: `Change the number ${params.a} into a ${params.v}.` }
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-4 text-white bg-slate-950 font-sans max-w-4xl mx-auto pb-24 animate-fade-in">
      <div className="w-full space-y-12 max-w-2xl mt-8">
        {/* Header Section */}
        <div className="text-center mb-12">
           <h2 className="text-2xl font-bold text-slate-300 mb-4">Find the value of <span className="text-sky-300">{params.a}{params.varName} + {params.b}</span> when <span className="text-sky-300">{params.varName} = {params.v}</span>.</h2>
           <div className="h-1 bg-slate-800/50 w-full"></div>
        </div>

        {/* Step 1: Identify */}
        <div className="animate-fade-in">
           <h3 className="text-2xl font-bold mb-4 text-white">
             Step 1. Identify the variable in the expression, and click it.
           </h3>
           <p className="text-2xl mb-6 text-white">Click the variable in this expression.</p>
           
           <div className="flex items-center justify-center gap-2 mb-8 select-none p-10 bg-slate-900 rounded-3xl border border-slate-800">
              <span onClick={() => handleVariableClick(params.a.toString())} className="text-8xl font-black text-amber-400 hover:scale-110 transition-transform cursor-pointer">{params.a}</span>
              <span onClick={() => handleVariableClick(params.varName)} className="text-8xl font-black text-sky-400 hover:scale-110 transition-transform cursor-pointer">{params.varName}</span>
              <span className="text-8xl font-black text-slate-500 px-4">+</span>
              <span onClick={() => handleVariableClick(params.b.toString())} className="text-8xl font-black text-emerald-400 hover:scale-110 transition-transform cursor-pointer">{params.b}</span>
           </div>
        </div>

        {/* Step 2: Substitute */}
        {step >= 2 && (
          <div className="animate-fade-in-up border-t border-slate-800 pt-12">
            <h3 className="text-2xl font-bold mb-4 text-white">
              Step 2. Substitute the variable.
            </h3>
            <p className="text-2xl mb-8 text-white">What does it mean to substitute <span className="text-sky-400 font-bold">{params.varName} = {params.v}</span> into <span className="text-sky-400 font-bold">{params.a}{params.varName} + {params.b}</span>?</p>
            <div className="grid gap-4">
              {mcqOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMcqSubmit(opt.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${selectedMcq === opt.id ? (opt.id === 'B' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-rose-500/20 border-rose-500') : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                >
                  <span className="font-medium">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Evaluate */}
        {step >= 3 && (
          <div className="animate-fade-in-up border-t border-slate-800 pt-12 text-center">
            <h3 className="text-2xl font-bold mb-4 text-white text-left">
              Step 3. Solve to get the final answer.
            </h3>
            <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-inner mb-8 mt-6">
              <div className="flex items-center justify-center gap-4 text-6xl font-mono">
                <span className="text-amber-400 font-black">{params.a}({params.v})</span>
                <span className="text-slate-600">+</span>
                <span className="text-emerald-400 font-black">{params.b}</span>
                <span className="text-slate-600">=</span>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isEvaluationCorrect && handleEvaluate()}
                  placeholder="?"
                  disabled={isEvaluationCorrect}
                  className={`w-28 bg-slate-950 border-b-4 ${isEvaluationCorrect ? 'border-emerald-500 text-emerald-400' : 'border-sky-500 text-sky-400'} text-center focus:outline-none transition-colors`}
                />
              </div>
              {!isEvaluationCorrect && (
                <button 
                  onClick={handleEvaluate} 
                  className="mt-10 bg-sky-600 hover:bg-sky-500 px-16 py-4 rounded-2xl font-black text-xl shadow-xl transition-all uppercase tracking-widest flex items-center justify-center gap-3 mx-auto"
                >
                  Check
                </button>
              )}
            </div>
          </div>
        )}

        {feedback && (
          <div className="mt-8 text-center font-bold text-yellow-400 text-xl">
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplaceVariableLevel1;
