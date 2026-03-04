
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import CompletionModal from '../components/CompletionModal';

const ExponentLawsLevel2: React.FC<LevelComponentProps> = ({ onComplete, onExit, onProgressUpdate }) => {
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [step, setStep] = useState<'simplify' | 'compare'>('simplify');
  const [inputExp, setInputExp] = useState('');
  const [selectedComp, setSelectedComp] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'hint' | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  useEffect(() => { 
    if (onProgressUpdate) {
      onProgressUpdate(phase, 3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const checkSimp = () => {
    const val = inputExp.toLowerCase().replace(/\s/g, '');
    let ok = false;
    if (phase === 1 && val === 'x^6') ok = true;
    if (phase === 2 && val === 'a^6') ok = true;
    if (phase === 3 && val === '3x^6') ok = true;
    
    if (ok) { 
      setFeedbackType('success');
      setFeedback("Correct!"); 
      setStep('compare'); 
    } else {
      setFeedbackType('hint');
      if (phase === 1 || phase === 3) setFeedback("When multiplying powers with the same base, we add the exponents.");
      else if (phase === 2) setFeedback("When raising a power to another power, we multiply the exponents.");
      else setFeedback("Try again! e.g. x^2");
    }
  };

  const handleComp = (id: string) => {
    setSelectedComp(id);
    let ok = (phase === 1 && id === 'C') || (phase === 2 && id === 'A') || (phase === 3 && id === 'A');
    if (ok) {
      setFeedbackType('success');
      setFeedback("Correct!");
      if (phase < 3) { 
        setTimeout(() => {
          setPhase(p => p + 1 as any); 
          setStep('simplify'); 
          setInputExp(''); 
          setSelectedComp(null); 
          setFeedback(null); 
          setFeedbackType(null);
        }, 1000);
      }
      else {
          onComplete(3);
          setTimeout(() => setShowCompletion(true), 1000);
      }
    } else {
        setFeedbackType('hint');
        setFeedback("Check your simplified form again.");
    }
  };

  const handleReplay = () => {
    setPhase(1);
    setStep('simplify');
    setInputExp('');
    setSelectedComp(null);
    setFeedback(null);
    setFeedbackType(null);
    setShowCompletion(false);
  };

  if (showCompletion) return <CompletionModal stars={3} onReplay={handleReplay} onBackToMap={onExit!} />;

  return (
    <div className="flex flex-col items-center min-h-full p-8 bg-slate-950 text-xl">
      <div className="w-full bg-slate-900 rounded-3xl p-10 border border-slate-800 shadow-2xl space-y-12">
        <div className="flex justify-center gap-12 text-3xl font-mono">
          <div className="bg-slate-800 p-8 rounded-2xl border-2 border-sky-500/30 text-sky-300">{phase === 1 ? "x⁴ ⋅ x²" : phase === 2 ? "(a²)³" : "3x² ⋅ x⁴"}</div>
          <div className="flex items-center text-slate-600 font-bold">vs</div>
          <div className="bg-slate-800 p-8 rounded-2xl border-2 border-emerald-500/30 text-emerald-300">{phase === 1 ? "x⁶" : phase === 2 ? "a⁵" : "3x⁶"}</div>
        </div>
        {step === 'simplify' ? (
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-bold">1. Simplify the left expression.</h3>
            <input value={inputExp} onChange={e => setInputExp(e.target.value)} className="bg-slate-950 border-b-4 border-sky-500 w-48 text-center text-2xl outline-none" placeholder="x^?" />
            <button onClick={checkSimp} className="block mx-auto bg-sky-600 px-12 py-3 rounded-xl font-bold">Check</button>
          </div>
        ) : (
          <div className="text-center space-y-8 animate-fade-in">
            <h3 className="text-2xl font-bold">{phase === 3 ? "2. Equivalent?" : "2. Which is larger?"}</h3>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
               {[ {id:'A',t:phase === 3 ? 'Equivalent':'Left is larger'}, {id:'B',t:phase === 3 ? 'Not Equivalent':'Right is larger'}, {id:'C',t:'They are equal'}, {id:'D',t:'Cannot compare'} ].slice(0, phase === 3 ? 2 : 4).map(o => (
                 <button key={o.id} onClick={() => handleComp(o.id)} className={`p-4 rounded-xl border-2 font-bold ${selectedComp === o.id ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700 hover:border-slate-600'}`}>{o.t}</button>
               ))}
            </div>
          </div>
        )}
        {feedback && <p className={`text-center font-bold animate-bounce ${feedbackType === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>{feedback}</p>}
      </div>
    </div>
  );
};

export default ExponentLawsLevel2;
