
import React, { useState, useEffect } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import CompletionModal from '../components/CompletionModal';

type Comp = 'equivalent' | 'not-equivalent' | 'cannot-compare';

const TASKS = [
  { id: 'A', left: '(b³)²', right: 'b⁵', ans: 'not-equivalent' },
  { id: 'B', left: '2x(x)', right: '2x³', ans: 'not-equivalent' },
  { id: 'D', left: '(a⁴)⁰', right: 'a⁰', ans: 'equivalent' },
  { id: 'E', left: 'm⁴ ⋅ m²', right: 'n⁴ ⋅ n²', ans: 'cannot-compare' },
];

const ExponentLawsLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, onProgressUpdate }) => {
  const [ans, setAns] = useState<Record<string, Comp>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'hint' | null>(null);

  useEffect(() => {
    onProgressUpdate?.(1, 1);
  }, [onProgressUpdate]);

  const checkAll = () => {
    if (Object.keys(ans).length < TASKS.length) { 
      setFeedbackType('hint');
      setFeedback("Please answer all items."); 
      return; 
    }
    const ok = TASKS.every(t => ans[t.id] === t.ans);
    setSubmitted(true);
    if (ok) { 
      setFeedbackType('success');
      setFeedback("Great Job!"); 
      onComplete(3); 
      setTimeout(()=>setShowCompletion(true), 1500); 
    }
    else {
      setFeedbackType('hint');
      setFeedback("Check items outlined in red.");
    }
  };

  const handleReplay = () => {
    setAns({});
    setSubmitted(false);
    setShowCompletion(false);
    setFeedback(null);
    setFeedbackType(null);
  };

  if (showCompletion) return <CompletionModal stars={3} onReplay={handleReplay} onBackToMap={onExit!} />;

  return (
    <div className="flex flex-col items-center min-h-full p-8 text-white bg-slate-950 font-sans max-w-6xl mx-auto pb-24 text-xl">
      <h1 className="text-3xl font-bold text-sky-400 mb-8 uppercase tracking-widest">Comparison Mastery</h1>
      <div className="w-full bg-slate-900 rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl">
        <h2 className="text-2xl font-black mb-10 text-sky-200">#1. Determine whether each pair is equivalent, not equivalent, or cannot be compared.</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-800">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-950 text-slate-500 text-xs font-black uppercase tracking-widest border-b border-slate-800">
                <th className="p-6 text-left">Pairs</th>
                <th>Equivalent</th>
                <th>Not Equivalent</th>
                <th>Cannot Compare</th>
              </tr>
            </thead>
            <tbody>
              {TASKS.map(t => (
                <tr key={t.id} className="border-b border-slate-800/50 hover:bg-slate-800/10">
                  <td className="p-6 font-mono text-2xl"><span className="text-sky-300">{t.left}</span> <span className="mx-4 text-slate-600 font-sans text-sm">vs</span> <span className="text-emerald-300">{t.right}</span></td>
                  {(['equivalent', 'not-equivalent', 'cannot-compare'] as Comp[]).map(type => {
                    const isSel = ans[t.id] === type;
                    const isErr = submitted && isSel && t.ans !== type;
                    return (
                      <td key={type} className="p-4 text-center">
                        <button onClick={()=>{setAns({...ans,[t.id]:type});setSubmitted(false);}} className={`w-14 h-14 rounded-2xl border-4 transition-all ${isSel?(isErr?'bg-red-500/20 border-red-500 text-red-500':'bg-sky-500 border-sky-400 text-white'):'bg-slate-950 border-slate-800 text-slate-700'}`}>{isSel?'✓':''}</button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={checkAll} className="block mx-auto mt-12 bg-sky-600 hover:bg-sky-500 px-20 py-5 rounded-2xl font-black text-xl shadow-2xl uppercase tracking-widest transition-all">Check Results</button>
        {feedback && (
          <div className={`mt-8 text-center font-bold animate-bounce ${feedbackType === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {feedback}
          </div>
        )}
      </div>
      <button onClick={onExit} className="fixed bottom-4 left-4 bg-slate-800 px-6 py-2 rounded-lg font-bold">Back to Map</button>
    </div>
  );
};

export default ExponentLawsLevel3;
