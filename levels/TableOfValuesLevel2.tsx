
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { LevelComponentProps } from '../types';
import CompletionModal from '../components/CompletionModal';

const X_VALUES = [-3, -2, -1, 0, 1, 2, 3];

const TableOfValuesLevel2: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, onProgressUpdate, partialProgress }) => {
  const [multiplier, setMultiplier] = useState(2);
  const [constant, setConstant] = useState(3);
  const [currentRowIndex, setCurrentRowIndex] = useState(1);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [errorStatus, setErrorStatus] = useState<Record<string, boolean>>({});
  const [correctStatus, setCorrectStatus] = useState<Record<string, boolean>>({});
  const [errorCount, setErrorCount] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isTableComplete, setIsTableComplete] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const isCompletedRef = useRef(false);

  // Initialize randomized parameters
  const randomizeParameters = () => {
    const newA = Math.random() > 0.5 ? 3 : 2;
    const newB = Math.floor(Math.random() * 5) + 1; // 1 to 5
    setMultiplier(newA);
    setConstant(newB);

    // Pre-fill the first row (index 0)
    const firstX = X_VALUES[0];
    setInputs({
      '0-y1': String(firstX * newA),
      '0-y2': String(firstX + newB)
    });
    setCorrectStatus({
      '0-y1': true,
      '0-y2': true
    });
  };

  // Run randomization on mount
  useEffect(() => {
    randomizeParameters();
  }, []);

  // Handle jump from progress dots
  useEffect(() => {
    if (partialProgress?.jumpToIndex !== undefined) {
      const targetIdx = partialProgress.jumpToIndex - 1;
      if (targetIdx >= 0 && targetIdx < X_VALUES.length) {
        setCurrentRowIndex(targetIdx);
      }
    }
  }, [partialProgress?.jumpToIndex]);

  // Generate table data based on current multiplier and constant
  const tableData = useMemo(() => {
    return X_VALUES.map(x => ({
      x,
      y1: x * multiplier,
      y2: x + constant
    }));
  }, [multiplier, constant]);

  useEffect(() => { 
    const total = X_VALUES.length + 2; // 7 rows + 2 questions
    const current = isTableComplete ? X_VALUES.length + currentQuestion + 1 : currentRowIndex + 1;
    onProgressUpdate?.(current, total); 
  }, [currentRowIndex, isTableComplete, currentQuestion, onProgressUpdate]);

  const calculateStars = (errors: number) => {
    if (errors <= 2) return 3;
    if (errors <= 4) return 2;
    return 1;
  };

  const handleCheck = (idx: number) => {
    const target = tableData[idx];
    const val1 = inputs[`${idx}-y1`]?.trim();
    const val2 = inputs[`${idx}-y2`]?.trim();
    
    const err1 = val1 !== String(target.y1);
    const err2 = val2 !== String(target.y2);
    
    if (err1 || err2) {
      setErrorCount(prev => prev + 1);
      setFeedback("Try again! Check your calculation.");
    } else {
      setFeedback(null);
    }

    setErrorStatus(p => ({ 
      ...p, 
      [`${idx}-y1`]: err1, 
      [`${idx}-y2`]: err2 
    }));

    setCorrectStatus(p => ({
      ...p,
      [`${idx}-y1`]: !err1,
      [`${idx}-y2`]: !err2
    }));
    
    if (!err1 && !err2) {
      if (idx === X_VALUES.length - 1) {
        setIsTableComplete(true);
        setFeedback(null);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
      } else {
        setCurrentRowIndex(idx + 1);
      }
    }
  };

  const handleAnswerQuestion = (answer: string) => {
    setSelectedAnswer(answer);
    
    // Find intersection point
    let intersectionX = null;
    for (let i = 0; i < tableData.length; i++) {
      if (tableData[i].y1 === tableData[i].y2) {
        intersectionX = tableData[i].x;
        break;
      }
    }
    
    // Question 1: For which value(s) of x are the two expressions equal?
    let correctAnswer1 = 'D';
    if (intersectionX === 1) correctAnswer1 = 'A';
    else if (intersectionX === 3) correctAnswer1 = 'B';
    else if (intersectionX === 0) correctAnswer1 = 'C';
    
    // Question 2: When is y = multiplier*x greater than y = x + constant?
    let correctAnswer2 = 'D';
    if (intersectionX !== null) {
      correctAnswer2 = 'C'; // Greater when x > intersection
    }
    
    const correctAnswers = [correctAnswer1, correctAnswer2];
    
    if (answer === correctAnswers[currentQuestion]) {
      setFeedback(null);
      if (currentQuestion < 1) {
        setTimeout(() => {
          setCurrentQuestion(1);
          setSelectedAnswer(null);
        }, 500);
      } else {
        setTimeout(() => {
          const finalStars = calculateStars(errorCount);
          isCompletedRef.current = true;
          onComplete(finalStars);
          setShowCompletion(true);
        }, 500);
      }
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback("Try again! Check the table.");
    }
  };

  const handleReplay = () => {
    setCurrentRowIndex(1);
    setErrorStatus({});
    setCorrectStatus({});
    setErrorCount(0);
    setFeedback(null);
    setShowCompletion(false);
    setIsTableComplete(false);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    isCompletedRef.current = false;
    randomizeParameters();
  };

  if (showCompletion) {
    const finalStars = calculateStars(errorCount);
    return (
      <CompletionModal 
        stars={finalStars} 
        onReplay={finalStars < 3 ? handleReplay : undefined} 
        onBackToMap={undefined}
        onNext={finalStars >= 2 ? onNext : undefined}
        hint={finalStars < 3 ? "Answer correctly on your first try to earn more stars!" : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col items-center min-h-full p-4 bg-slate-950 font-sans max-w-4xl mx-auto pb-24 text-xl animate-fade-in">
      <div className="w-full space-y-12 max-w-2xl mt-8">
        <div className="text-center mb-12">
           <h2 className="text-2xl font-bold text-slate-300 mb-4 leading-relaxed">
             For each <span className="text-sky-300">x</span>‑value, find the <span className="text-sky-300">y</span>‑value in both equations.
           </h2>
           <div className="h-1 bg-slate-800/50 w-full"></div>
        </div>
        
        <div className="w-full bg-slate-900 rounded-3xl p-10 border border-slate-800 shadow-2xl">
          <table className="w-full border-separate border-spacing-2">
            <thead>
              <tr className="text-center text-lg font-bold tracking-wide text-slate-300">
                <th className="p-6 bg-slate-800 rounded-xl text-sky-300 w-24">x</th>
                <th className="p-6 bg-slate-800 rounded-xl text-fuchsia-400">y = {multiplier}x</th>
                <th className="p-6 bg-slate-800 rounded-xl text-emerald-400">y = x + {constant}</th>
                <th className="w-24"></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => {
                const isLocked = idx > currentRowIndex;
                const isPreFilled = idx === 0;
                
                const cell1Correct = correctStatus[`${idx}-y1`];
                const cell1Error = errorStatus[`${idx}-y1`];
                const cell2Correct = correctStatus[`${idx}-y2`];
                const cell2Error = errorStatus[`${idx}-y2`];

                return (
                  <tr key={idx} className={`${isLocked ? 'opacity-20' : ''} transition-opacity duration-300`}>
                    <td className="p-4 text-center bg-slate-800/40 rounded-xl font-mono text-2xl font-bold text-slate-300">{row.x}</td>
                    
                    <td className={`p-2 rounded-xl border-2 transition-all ${
                      cell1Error ? 'border-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 
                      cell1Correct ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 
                      'border-slate-700'
                    }`}>
                      <input 
                        disabled={isLocked || isPreFilled || cell1Correct} 
                        type="text" 
                        value={inputs[`${idx}-y1`] || ''} 
                        onChange={e => {
                          setInputs({...inputs, [`${idx}-y1`]: e.target.value});
                          setErrorStatus({...errorStatus, [`${idx}-y1`]: false});
                        }} 
                        className={`w-full bg-transparent text-center text-2xl font-mono outline-none transition-colors ${cell1Correct ? 'text-emerald-400' : 'text-white'}`} 
                        placeholder={isLocked ? "" : "?"} 
                      />
                    </td>

                    <td className={`p-2 rounded-xl border-2 transition-all ${
                      cell2Error ? 'border-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 
                      cell2Correct ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 
                      'border-slate-700'
                    }`}>
                      <input 
                        disabled={isLocked || isPreFilled || cell2Correct} 
                        type="text" 
                        value={inputs[`${idx}-y2`] || ''} 
                        onChange={e => {
                          setInputs({...inputs, [`${idx}-y2`]: e.target.value});
                          setErrorStatus({...errorStatus, [`${idx}-y2`]: false});
                        }} 
                        className={`w-full bg-transparent text-center text-2xl font-mono outline-none transition-colors ${cell2Correct ? 'text-emerald-400' : 'text-white'}`} 
                        placeholder={isLocked ? "" : "?"} 
                      />
                    </td>

                    <td className="flex items-center justify-center min-h-[64px]">
                      {idx === currentRowIndex && !isPreFilled && (
                        <button 
                          onClick={() => handleCheck(idx)} 
                          className="bg-sky-600 hover:bg-sky-500 active:scale-95 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest text-white transition-all shadow-lg"
                        >
                          Check
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {feedback && !isTableComplete && (
            <div className="mt-6 text-center font-bold text-yellow-400 text-xl">
              {feedback}
            </div>
          )}
        </div>

        {/* Task 7: Questions after table completion */}
        {isTableComplete && (
          <div className="w-full bg-slate-900 rounded-3xl p-10 border border-slate-800 shadow-2xl animate-fade-in">
            <h3 className="text-2xl font-bold text-white mb-8">
              {currentQuestion === 0 
                ? "Using the table of values, for which value(s) of x are the two expressions equal?"
                : `Using the table of values, when is y = ${multiplier}x greater than y = x + ${constant}?`}
            </h3>
            
            <div className="grid gap-4">
              {currentQuestion === 0 ? (
                <>
                  <button
                    onClick={() => handleAnswerQuestion('A')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${
                      selectedAnswer === 'A' 
                        ? 'bg-sky-600 border-sky-400 text-white' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">x = 1</span>
                  </button>
                  <button
                    onClick={() => handleAnswerQuestion('B')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${
                      selectedAnswer === 'B' 
                        ? 'bg-sky-600 border-sky-400 text-white' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">x = 3</span>
                  </button>
                  <button
                    onClick={() => handleAnswerQuestion('C')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${
                      selectedAnswer === 'C' 
                        ? 'bg-sky-600 border-sky-400 text-white' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">x = 0</span>
                  </button>
                  <button
                    onClick={() => handleAnswerQuestion('D')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${
                      selectedAnswer === 'D' 
                        ? 'bg-sky-600 border-sky-400 text-white' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">There is no value of x</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAnswerQuestion('A')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${
                      selectedAnswer === 'A' 
                        ? 'bg-sky-600 border-sky-400 text-white' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">When x &lt; 2</span>
                  </button>
                  <button
                    onClick={() => handleAnswerQuestion('B')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${
                      selectedAnswer === 'B' 
                        ? 'bg-sky-600 border-sky-400 text-white' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">When x = 2</span>
                  </button>
                  <button
                    onClick={() => handleAnswerQuestion('C')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${
                      selectedAnswer === 'C' 
                        ? 'bg-sky-600 border-sky-400 text-white' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">When x &gt; 2</span>
                  </button>
                  <button
                    onClick={() => handleAnswerQuestion('D')}
                    className={`p-5 rounded-2xl border-2 text-left transition-all text-lg ${
                      selectedAnswer === 'D' 
                        ? 'bg-sky-600 border-sky-400 text-white' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <span className="font-medium">Never</span>
                  </button>
                </>
              )}
            </div>
            
            {feedback && (
              <div className="mt-6 text-center font-bold text-yellow-400 text-xl">
                {feedback}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableOfValuesLevel2;
