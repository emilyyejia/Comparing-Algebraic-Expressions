
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
        text: "The variable represents an unknown value. It's the letter in the expression.", 
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
      setFeedback({ text: "Not quite. To 'substitute' means to replace the variable with the given value.", type: 'error' });
    }
  };

  const correctResult = useMemo(() => params.a * params.v + params.b, [params]);

  const handleEvaluate = () => {
    if (parseInt(inputValue) === correctResult) {
      setFeedback({ text: `Excellent! ${params.a}(${params.v}) + ${params.b} = ${params.a * params.v} + ${params.b} = ${correctResult}`, type: 'success' });
      setIsEvaluationCorrect(true);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback({ text: `Try again! Multiply ${params.a} by ${params.v} first, then add ${params.b}.`, type: 'error' });
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
           <h2 className="text-2xl font-bold text-slate-300 mb-4">Find the value of <span className="text-sky-300 italic">{params.a}{params.varName} + {params.b}</span> when <span className="text-sky-300 italic">{params.varName} = {params.v}</span>.</h2>
           <div className="h-1 bg-slate-800/50 w-full"></div>
        </div>

        {/* Step 1: Identify */}
        <div className="animate-fade-in">
           <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
             <span className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-sm">1</span>
             Identify the variable.
           </h3>
           <p className="text-slate-400 mb-6 ml-14">Click the variable in this expression.</p>
           
           <div className="flex items-center justify-center gap-2 mb-8 select-none p-10 bg-slate-900 rounded-3xl border border-slate-800 ml-14">
              <span onClick={() => handleVariableClick(params.a.toString())} className="text-8xl font-black text-amber-400 hover:scale-110 transition-transform cursor-pointer">{params.a}</span>
              <span onClick={() => handleVariableClick(params.varName)} className="text-8xl font-black text-sky-400 hover:scale-110 transition-transform cursor-pointer">{params.varName}</span>
              <span className="text-8xl font-black text-slate-500 px-4">+</span>
              <span onClick={() => handleVariableClick(params.b.toString())} className="text-8xl font-black text-emerald-400 hover:scale-110 transition-transform cursor-pointer">{params.b}</span>
           </div>
        </div>

        {/* Step 2: Substitute */}
        {step >= 2 && (
          <div className="animate-fade-in-up border-t border-slate-800 pt-12">
            <h3 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
              <span className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-sm">2</span>
              Substitute the variable.
            </h3>
            <p className="text-slate-400 mb-8 ml-14">What does it mean to substitute <span className="text-sky-400 font-bold italic">{params.varName} = {params.v}</span> into <span className="text-sky-400 font-bold italic">{params.a}{params.varName} + {params.b}</span>?</p>
            <div className="grid gap-4 ml-14">
              {mcqOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleMcqSubmit(opt.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${selectedMcq === opt.id ? (opt.id === 'B' ? 'bg-emerald-500/20 border-emerald-500' : 'bg-rose-500/20 border-rose-500') : 'bg-slate-800 border-slate-700 hover:border-slate-500'}`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 ${selectedMcq === opt.id ? 'bg-white text-slate-900 border-white' : 'bg-slate-700 text-slate-400'}`}>{opt.id}</span>
                  <span className="font-medium">{opt.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Evaluate */}
        {step >= 3 && (
          <div className="animate-fade-in-up border-t border-slate-800 pt-12 text-center">
            <h3 className="text-2xl font-bold mb-4 text-white text-left flex items-center gap-3">
              <span className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-sm">3</span>
              Calculate the result.
            </h3>
            <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-inner mb-8 mt-6 ml-14">
              <div className="flex items-center justify-center gap-4 text-6xl font-mono">
                <span className="text-amber-400 font-black">{params.a}({params.v})</span>
                <span className="text-slate-600">+</span>
                <span className="text-emerald-400 font-black">{params.b}</span>
                <span className="text-slate-600">=</span>
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (isEvaluationCorrect ? handleFinishLevel() : handleEvaluate())}
                  placeholder="?"
                  disabled={isEvaluationCorrect}
                  className={`w-28 bg-slate-950 border-b-4 ${isEvaluationCorrect ? 'border-emerald-500 text-emerald-400' : 'border-sky-500 text-sky-400'} text-center focus:outline-none transition-colors`}
                />
              </div>
              <button 
                onClick={isEvaluationCorrect ? handleFinishLevel : handleEvaluate} 
                className={`mt-10 ${isEvaluationCorrect ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-sky-600 hover:bg-sky-500'} px-16 py-4 rounded-2xl font-black text-xl shadow-xl transition-all uppercase tracking-widest flex items-center justify-center gap-3 mx-auto`}
              >
                {isEvaluationCorrect ? (
                  <>
                    <span>Finish Level</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                ) : 'Evaluate'}
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <div className={`mt-8 ml-14 p-4 rounded-xl text-center font-bold border-2 ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : (feedback.type === 'error' ? 'bg-rose-500/10 border-rose-500 text-rose-400' : 'bg-amber-500/10 border-amber-500 text-amber-400')}`}>
            {feedback.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplaceVariableLevel1;
