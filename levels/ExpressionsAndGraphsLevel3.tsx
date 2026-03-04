
import React, { useState, useEffect } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import CompletionModal from '../components/CompletionModal';

const ExpressionsAndGraphsLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, onProgressUpdate, partialProgress }) => {
  const [phase, setPhase] = useState<1 | 2>(() => partialProgress?.phase || 1);
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);

  const dim = 450; const pad = 50;
  const toPx = (x: number, y: number, xRange: [number, number], yRange: [number, number]) => ({
    cx: pad + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (dim - 2 * pad),
    cy: pad + ((yRange[1] - y) / (yRange[1] - yRange[0])) * (dim - 2 * pad),
  });

  useEffect(() => {
    onProgressUpdate?.(phase === 1 ? qIndex + 1 : 2 + qIndex + 1, 5);
  }, [phase, qIndex, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
      const idx = partialProgress.jumpToIndex;
      if (idx <= 2) {
        setPhase(1);
        setQIndex(idx - 1);
      } else {
        setPhase(2);
        setQIndex(idx - 3);
      }
      setFeedback(null);
    }
  }, [partialProgress?.jumpToIndex]);

  const phase1Qs = [
    { text: "1. For any given x‑value, which line has the greater y‑value?", options: ["y = 3x - 2", "y = 3x + 4"], correct: 1, hint: "Choose a point on the x-axis. Then, compare the y-values." },
    { text: "2. These lines ___ intersect.", options: ["Always", "Never"], correct: 1, hint: "They are parallel!" }
  ];

  const phase2Qs = [
    { text: "1. For any given x‑value, which graph has the greater y‑value?", options: ["y = x² - 2", "y = x² + 3"], correct: 1, hint: "Choose a point on the x-axis. Then, compare the y-values." },
    { text: "2. Compare values at x=2. Which statement is correct?", options: ["x²-2 > x²+3", "x²+3 > x²-2", "Equal", "Cannot determine"], correct: 1, hint: "Check the y‑values of both graphs at x = 2. Which is bigger?" },
    { text: "3. y = x² + 3 is greater than y = x² - 2.", options: ["Sometimes", "Never", "Always"], correct: 2, hint: "Check the y-values of both graphs at different x-values." }
  ];

  const handleAnswer = (idx: number) => {
    const qs = phase === 1 ? phase1Qs : phase2Qs;
    if (idx === qs[qIndex].correct) {
      setFeedback("Correct!");
      setFeedbackType('success');
      setTimeout(() => {
        setFeedback(null);
        if (qIndex < qs.length - 1) {
          setQIndex(qIndex + 1);
        } else if (phase === 1) {
          setPhase(2);
          setQIndex(0);
        } else {
          onComplete(3);
          setShowCompletion(true);
        }
      }, 1500);
    } else {
      setFeedback(qs[qIndex].hint || "Check the graphs again!");
      setFeedbackType('error');
      // Set to stay longer
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleReplay = () => {
    setPhase(1);
    setQIndex(0);
    setFeedback(null);
    setShowCompletion(false);
  };

  if (showCompletion) {
    return <CompletionModal stars={3} onReplay={handleReplay} onBackToMap={onExit!} />;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-full p-4 bg-slate-950 font-sans max-w-6xl mx-auto pb-24">
      <InstructionButton onClick={() => {}} />

      <div className="w-full grid lg:grid-cols-[1fr_350px] gap-8 items-start mt-8">
        <div className="bg-white rounded-3xl p-8 border-4 border-slate-800 flex flex-col items-center justify-center">
          {phase === 1 ? (
            <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
              <line x1={pad} y1={dim/2} x2={dim-pad} y2={dim/2} stroke="#334155" strokeWidth="2" />
              <line x1={dim/2} y1={pad} x2={dim/2} y2={dim-pad} stroke="#334155" strokeWidth="2" />
              {/* Grid Lines */}
              {Array.from({length: 11}).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={pad + i*(dim-2*pad)/10} y1={pad} x2={pad + i*(dim-2*pad)/10} y2={dim-pad} stroke="#f1f5f9" strokeWidth="1" />
                  <line x1={pad} y1={pad + i*(dim-2*pad)/10} x2={dim-pad} y2={pad + i*(dim-2*pad)/10} stroke="#f1f5f9" strokeWidth="1" />
                </React.Fragment>
              ))}
              <line x1={toPx(-2.2,-2.6,[-2.5,2.5],[-4,11]).cx} y1={toPx(-2.2,-2.6,[-2.5,2.5],[-4,11]).cy} x2={toPx(2.2,10.6,[-2.5,2.5],[-4,11]).cx} y2={toPx(2.2,10.6,[-2.5,2.5],[-4,11]).cy} stroke="#3b82f6" strokeWidth="4" />
              <line x1={toPx(-2.2,-8.6,[-2.5,2.5],[-4,11]).cx} y1={toPx(-2.2,-8.6,[-2.5,2.5],[-4,11]).cy} x2={toPx(2.2,4.6,[-2.5,2.5],[-4,11]).cx} y2={toPx(2.2,4.6,[-2.5,2.5],[-4,11]).cy} stroke="#f43f5e" strokeWidth="4" />
              <text x={toPx(-1.3,0.1,[-2.5,2.5],[-4,11]).cx - 40} y={toPx(-1.3,0.1,[-2.5,2.5],[-4,11]).cy} className="fill-blue-600 font-bold text-lg italic">y=3x+4</text>
              <text x={toPx(1.3,1.9,[-2.5,2.5],[-4,11]).cx + 15} y={toPx(1.3,1.9,[-2.5,2.5],[-4,11]).cy + 5} className="fill-rose-600 font-bold text-lg italic">y=3x-2</text>
            </svg>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {[ {l: 'y=x²-2', p: 'M 30 15 Q 150 250 270 15', t: 'Graph 1', c: '#ef4444'}, {l: 'y=x²+3', p: 'M 30 15 Q 150 120 270 15', t: 'Graph 2', c: '#3b82f6'} ].map((g,i) => (
                <div key={i} className="text-center">
                  <span className="text-slate-800 font-bold text-sm mb-2 block">{g.t}</span>
                  <svg width={300} height={300} viewBox="0 0 300 300" className="border-2 border-slate-300 shadow-md rounded-lg">
                    {Array.from({length: 11}).map((_, j) => (
                        <React.Fragment key={j}>
                            <line x1={j*30} y1={0} x2={j*30} y2={300} stroke="#e2e8f0" strokeWidth="1" />
                            <line x1={0} y1={j*30} x2={300} y2={j*30} stroke="#e2e8f0" strokeWidth="1" />
                        </React.Fragment>
                    ))}
                    <line x1={0} y1={150} x2={300} y2={150} stroke="#334155" strokeWidth="2" />
                    <line x1={150} y1={0} x2={150} y2={300} stroke="#334155" strokeWidth="2" />
                    <text x={285} y={165} className="fill-slate-700 text-[14px] font-bold">x</text>
                    <text x={160} y={20} className="fill-slate-700 text-[14px] font-bold">y</text>
                    <path d={g.p} fill="none" stroke={g.c} strokeWidth="5" />
                    <text x={30} y={40} className="fill-slate-800 font-bold text-base italic">{g.l}</text>
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className={`bg-slate-900 p-6 rounded-2xl border-4 ${feedbackType === 'success' ? 'border-emerald-500' : 'border-slate-800'}`}>
           <h3 className="text-sky-300 font-bold mb-8 text-2xl">{(phase === 1 ? phase1Qs : phase2Qs)[qIndex].text}</h3>
           {(phase === 1 ? phase1Qs : phase2Qs)[qIndex].options.map((o,i) => <button key={i} onClick={() => handleAnswer(i)} className="w-full text-left p-5 mb-3 bg-slate-800 border-2 rounded-xl hover:border-sky-500 transition-all font-medium">{o}</button>)}
        </div>
      </div>
      {feedback && <div className={`fixed bottom-24 ${feedbackType === 'success' ? 'bg-emerald-600' : 'bg-rose-600'} px-8 py-3 rounded-full text-white font-bold shadow-xl animate-fade-in`}>{feedback}</div>}
    </div>
  );
};

export default ExpressionsAndGraphsLevel3;
