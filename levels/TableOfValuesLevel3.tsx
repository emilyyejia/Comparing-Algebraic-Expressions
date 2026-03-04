
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { LevelComponentProps } from '../types';
import CompletionModal from '../components/CompletionModal';

interface MathSet {
  expr1: { m: number; b: number; label: string };
  expr2: { m: number; b: number; label: string };
  intersectionX: number;
  rateDiff: number;
}

const MATH_SETS: MathSet[] = [
  {
    expr1: { m: 3, b: -2, label: "y = 3x - 2" },
    expr2: { m: 1, b: 4, label: "y = x + 4" },
    intersectionX: 3,
    rateDiff: 2,
  },
  {
    expr1: { m: 2, b: 1, label: "y = 2x + 1" },
    expr2: { m: 1, b: 3, label: "y = x + 3" },
    intersectionX: 2,
    rateDiff: 1,
  },
  {
    expr1: { m: 3, b: -5, label: "y = 3x - 5" },
    expr2: { m: 1, b: 1, label: "y = x + 1" },
    intersectionX: 3,
    rateDiff: 2,
  },
];

const X_RANGE = [-1, 0, 1, 2, 3, 4];

const TableOfValuesLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, onProgressUpdate, partialProgress, onNext }) => {
  const [currentSetIndex, setCurrentSetIndex] = useState(() => Math.floor(Math.random() * MATH_SETS.length));
  const [isTableComplete, setIsTableComplete] = useState(false);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [qIndex, setQIndex] = useState(0);
  const [errorStatus, setErrorStatus] = useState<Record<string, boolean>>({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);

  const currentSet = MATH_SETS[currentSetIndex];

  const tableData = useMemo(() => {
    return X_RANGE.map(x => ({
      x,
      y1: currentSet.expr1.m * x + currentSet.expr1.b,
      y2: currentSet.expr2.m * x + currentSet.expr2.b,
    }));
  }, [currentSet]);

  const qs = useMemo(() => [
    { 
      text: `When does ${currentSet.expr1.label} give a larger y-value than ${currentSet.expr2.label}?`, 
      options: [`x < ${currentSet.intersectionX}`, `x = ${currentSet.intersectionX}`, `x > ${currentSet.intersectionX}`], 
      correct: 2, 
      hint: "Check the table for where the purple values become larger than the green ones." 
    },
    { 
      text: `Which expression has the greater y-value for all values of x shown where x < ${currentSet.intersectionX}?`, 
      options: [currentSet.expr1.label, currentSet.expr2.label, "Neither"], 
      correct: 1, 
      hint: `Look at the rows where x is smaller than ${currentSet.intersectionX}. Which column has higher numbers?` 
    }
  ], [currentSet]);

  useEffect(() => { 
    const current = isTableComplete ? 2 + qIndex : 1;
    onProgressUpdate?.(current, 3); 
  }, [isTableComplete, qIndex, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
      const idx = partialProgress.jumpToIndex;
      if (idx === 1) {
        setIsTableComplete(false);
        setQIndex(0);
      } else {
        setIsTableComplete(true);
        setQIndex(Math.min(idx - 2, 2));
      }
      setFeedback(null);
    }
  }, [partialProgress?.jumpToIndex]);

  const checkTable = () => {
    let allOk = true;
    const newErrors: Record<string, boolean> = {};
    tableData.forEach((row, idx) => {
      const ok1 = inputs[`${idx}-y1`]?.trim() === String(row.y1);
      const ok2 = inputs[`${idx}-y2`]?.trim() === String(row.y2);
      if (!ok1) { newErrors[`${idx}-y1`] = true; allOk = false; }
      if (!ok2) { newErrors[`${idx}-y2`] = true; allOk = false; }
    });
    setErrorStatus(newErrors);
    
    if (allOk) { 
      setIsTableComplete(true); 
      setFeedback("Table correct!");
      setFeedbackType('success');
      setTimeout(() => setFeedback(null), 2000);
    }
    else {
      setMistakeCount(prev => prev + 1);
      setFeedback("Try again! Check your calculation.");
      setFeedbackType('error');
    }
  };

  const handleAns = (idx: number) => {
    if (idx === qs[qIndex].correct) {
      setFeedback("Excellent!");
      setFeedbackType('success');
      setTimeout(() => {
        setFeedback(null);
        if (qIndex < qs.length - 1) setQIndex(qIndex + 1);
        else {
          const finalStars = mistakeCount <= 1 ? 3 : (mistakeCount === 2 ? 2 : 1);
          onComplete(finalStars);
          setShowCompletion(true);
        }
      }, 1000);
    } else {
      setMistakeCount(prev => prev + 1);
      setFeedback(qs[qIndex].hint || "Try again!");
      setFeedbackType('error');
    }
  };

  const handleReplay = () => {
    setCurrentSetIndex(prev => {
      let next = Math.floor(Math.random() * MATH_SETS.length);
      while (next === prev && MATH_SETS.length > 1) {
        next = Math.floor(Math.random() * MATH_SETS.length);
      }
      return next;
    });
    setIsTableComplete(false);
    setInputs({});
    setQIndex(0);
    setErrorStatus({});
    setShowCompletion(false);
    setFeedback(null);
    setMistakeCount(0);
  };

  if (showCompletion) {
    const finalStars = mistakeCount <= 1 ? 3 : (mistakeCount === 2 ? 2 : 1);
    return (
      <CompletionModal 
        stars={finalStars} 
        onReplay={finalStars < 3 ? handleReplay : undefined} 
        onBackToMap={onExit} 
        onNext={undefined}
        hint={finalStars < 3 ? "Answer correctly on your first try to earn more stars!" : undefined} 
      />
    );
  }

  return (
    <div className="flex flex-col items-center min-h-full p-4 bg-slate-950 font-sans max-w-6xl mx-auto pb-24 text-xl animate-fade-in">
      <div className="w-full space-y-12 max-w-5xl mt-8">
        <div className="text-center mb-12">
           <h2 className="text-2xl font-bold text-slate-300 mb-4 leading-relaxed transition-all duration-500 min-h-[4rem]">
             {!isTableComplete 
               ? <>Compare the two expressions by substituting the <span className="text-sky-300">x</span> values to find the values of <span className="text-sky-300">y</span>.</>
               : <>Now use your table to analyze how these two expressions behave.</>
             }
           </h2>
           <div className="h-1 bg-slate-800/50 w-full"></div>
        </div>
        
        <div className="w-full grid lg:grid-cols-[1fr_400px] gap-10 items-start">
          <div className={`bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl transition-all duration-700 ${isTableComplete ? 'opacity-60 scale-95 origin-left' : ''}`}>
            <table className="w-full border-separate border-spacing-2">
              <thead>
                <tr className="text-center text-lg font-bold">
                  <th className="p-6 bg-slate-800 rounded-xl text-sky-300 w-24">x</th>
                  <th className="p-6 bg-slate-800 rounded-xl text-fuchsia-400">{currentSet.expr1.label}</th>
                  <th className="p-6 bg-slate-800 rounded-xl text-emerald-400">{currentSet.expr2.label}</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-4 text-center bg-slate-800/40 rounded-xl font-mono text-2xl font-bold text-slate-300">{row.x}</td>
                    <td className={`p-2 rounded-xl border-2 transition-all ${
                      errorStatus[`${idx}-y1`] ? 'border-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 
                      isTableComplete ? 'border-fuchsia-500/50 bg-fuchsia-500/5' :
                      'border-slate-700'
                    }`}>
                      <input 
                        disabled={isTableComplete} 
                        value={inputs[`${idx}-y1`]||''} 
                        onChange={e=>setInputs({...inputs,[`${idx}-y1`]:e.target.value})} 
                        className={`w-full bg-transparent text-center font-mono text-2xl outline-none transition-colors ${isTableComplete ? 'text-fuchsia-400' : 'text-white'}`} 
                        placeholder="?" 
                      />
                    </td>
                    <td className={`p-2 rounded-xl border-2 transition-all ${
                      errorStatus[`${idx}-y2`] ? 'border-red-500 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 
                      isTableComplete ? 'border-fuchsia-500/50 bg-fuchsia-500/5' :
                      'border-slate-700'
                    }`}>
                      <input 
                        disabled={isTableComplete} 
                        value={inputs[`${idx}-y2`]||''} 
                        onChange={e=>setInputs({...inputs,[`${idx}-y2`]:e.target.value})} 
                        className={`w-full bg-transparent text-center font-mono text-2xl outline-none transition-colors ${isTableComplete ? 'text-fuchsia-400' : 'text-white'}`} 
                        placeholder="?" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isTableComplete && (
              <button 
                onClick={checkTable} 
                className="w-full mt-8 bg-sky-600 hover:bg-sky-500 py-4 rounded-2xl font-bold text-white transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm"
              >
                Check
              </button>
            )}
            {!isTableComplete && feedback && feedbackType === 'error' && (
              <div className="mt-4 text-center font-bold text-xl text-amber-400">
                {feedback}
              </div>
            )}
          </div>

          {isTableComplete && (
            <div className={`bg-slate-900 p-10 rounded-3xl border-4 ${feedbackType === 'success' ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-sky-500/30'} shadow-2xl space-y-8 animate-fade-in-up flex flex-col`}>
              <div className="flex items-center justify-between">
                <p className="text-sky-400 font-bold uppercase text-xs tracking-widest">Question {qIndex + 1}</p>
                <div className="flex gap-1">
                  {qs.map((_, i) => (
                    <div key={i} className={`h-1.5 w-6 rounded-full transition-all duration-500 ${i <= qIndex ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]' : 'bg-slate-800'}`} />
                  ))}
                </div>
              </div>
              <h3 className="text-2xl font-bold leading-tight text-white">{qs[qIndex].text}</h3>
              <div className="space-y-4">
                {qs[qIndex].options.map((o, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleAns(i)} 
                    className="w-full text-left p-5 bg-slate-800 border-2 border-slate-700 rounded-2xl hover:border-sky-500 hover:bg-slate-700 transition-all font-medium text-white group"
                  >
                    <span className="inline-block w-8 h-8 rounded-full bg-slate-700 text-slate-400 group-hover:bg-sky-500 group-hover:text-white text-center leading-8 mr-4 transition-colors font-mono">{String.fromCharCode(65 + i)}</span>
                    {o}
                  </button>
                ))}
              </div>
              
              {feedback && (
                <div className={`mt-4 text-center font-bold text-xl ${feedbackType === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {feedback}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableOfValuesLevel3;
