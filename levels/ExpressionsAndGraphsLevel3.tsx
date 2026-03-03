
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

  const DIM = 450; const PAD = 50;
  const toPx = (x: number, y: number, xRange: [number, number], yRange: [number, number]) => ({
    cx: PAD + ((x - xRange[0]) / (xRange[1] - xRange[0])) * (DIM - 2 * PAD),
    cy: PAD + ((yRange[1] - y) / (yRange[1] - yRange[0])) * (DIM - 2 * PAD),
  });

  useEffect(() => {
    onProgressUpdate?.(phase === 1 ? qIndex + 1 : 3 + qIndex + 1, 6);
  }, [phase, qIndex, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
      const idx = partialProgress.jumpToIndex;
      if (idx <= 3) {
        setPhase(1);
        setQIndex(idx - 1);
      } else {
        setPhase(2);
        setQIndex(idx - 4);
      }
      setFeedback(null);
    }
  }, [partialProgress?.jumpToIndex]);

  const phase1Qs = [
    { text: "1. For the same value of x, which graph is above?", options: ["y = 3x - 2", "y = 3x + 4"], correct: 1, hint: "Compare the y-values for the two lines at a fixed x." },
    { text: "2. Which expression has the greater value for all x?", options: ["y = 3x + 4", "y = 3x - 2"], correct: 0, hint: "Greater values are higher on the y-axis." },
    { text: "3. These lines ___ intersect.", options: ["Always", "Never"], correct: 1, hint: "They are parallel!" }
  ];

  const phase2Qs = [
    { text: "1. Which statement is true based on the graphs?", options: ["They intersect", "y = x²-2 is greater", "Equal at x=0", "y = x²+3 is greater"], correct: 3, hint: "Choose one x-value. Then compare the y-values for the two lines." },
    { text: "2. Compare values at x=2. Which statement is correct?", options: ["x²-2 > x²+3", "x²+3 > x²-2", "Equal", "Cannot determine"], correct: 1, hint: "At x=2, y=x²+3 is at 7, while y=x²-2 is at 2." },
    { text: "3. y = x² + 3 is greater than y = x² - 2.", options: ["Sometimes", "Never", "Always"], correct: 2, hint: "The difference is always 5." }
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
      <div className="w-full flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-sky-400 uppercase">Level 3: Compare Graphs</h1>
        <div className="flex gap-2">
           <div className={`w-8 h-2 rounded-full ${phase >= 1 ? 'bg-sky-500' : 'bg-slate-800'}`} />
           <div className={`w-8 h-2 rounded-full ${phase >= 2 ? 'bg-sky-500' : 'bg-slate-800'}`} />
        </div>
      </div>

      <div className="w-full grid lg:grid-cols-[1fr_350px] gap-8 items-start">
        <div className="bg-white rounded-3xl p-8 border-4 border-slate-800 flex flex-col items-center">
          {phase === 1 ? (
            <svg width={DIM} height={DIM} viewBox={`0 0 ${DIM} ${DIM}`} className="overflow-visible">
              <line x1={PAD} y1={DIM/2} x2={DIM-PAD} y2={DIM/2} stroke="#334155" strokeWidth="2" />
              <line x1={DIM/2} y1={PAD} x2={DIM/2} y2={DIM-PAD} stroke="#334155" strokeWidth="2" />
              {/* Grid Lines */}
              {Array.from({length: 11}).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={PAD + i*(DIM-2*PAD)/10} y1={PAD} x2={PAD + i*(DIM-2*PAD)/10} y2={DIM-PAD} stroke="#f1f5f9" strokeWidth="1" />
                  <line x1={PAD} y1={PAD + i*(DIM-2*PAD)/10} x2={DIM-PAD} y2={PAD + i*(DIM-2*PAD)/10} stroke="#f1f5f9" strokeWidth="1" />
                </React.Fragment>
              ))}
              <line x1={toPx(-2,-2,[-4,4],[-10,20]).cx} y1={toPx(-2,-2,[-4,4],[-10,20]).cy} x2={toPx(4,16,[-4,4],[-10,20]).cx} y2={toPx(4,16,[-4,4],[-10,20]).cy} stroke="#3b82f6" strokeWidth="4" />
              <line x1={toPx(-2,-8,[-4,4],[-10,20]).cx} y1={toPx(-2,-8,[-4,4],[-10,20]).cy} x2={toPx(4,10,[-4,4],[-10,20]).cx} y2={toPx(4,10,[-4,4],[-10,20]).cy} stroke="#f43f5e" strokeWidth="4" />
              <text x={PAD+25} y={PAD+40} className="fill-blue-600 font-bold text-sm italic">y=3x+4</text>
              <text x={DIM-PAD-100} y={DIM-PAD-40} className="fill-rose-600 font-bold text-sm italic">y=3x-2</text>
            </svg>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[ {l: 'y=x²-2', p: 'M 20 10 Q 110 180 200 10', t: 'Graph 1', c: '#ef4444'}, {l: 'y=x²+3', p: 'M 20 10 Q 110 80 200 10', t: 'Graph 2', c: '#3b82f6'} ].map((g,i) => (
                <div key={i} className="text-center">
                  <span className="text-slate-800 font-bold text-xs">{g.t}</span>
                  <svg width={220} height={220} viewBox="0 0 220 220" className="border shadow-sm rounded-lg overflow-visible">
                    {Array.from({length: 11}).map((_, j) => (
                        <React.Fragment key={j}>
                            <line x1={j*22} y1={0} x2={j*22} y2={220} stroke="#f1f5f9" />
                            <line x1={0} y1={j*22} x2={220} y2={j*22} stroke="#f1f5f9" />
                        </React.Fragment>
                    ))}
                    <line x1={0} y1={110} x2={220} y2={110} stroke="#334155" /><line x1={110} y1={0} x2={110} y2={220} stroke="#334155" />
                    <text x={210} y={120} className="fill-slate-600 text-[12px] font-bold">x</text><text x={120} y={15} className="fill-slate-600 text-[12px] font-bold">y</text>
                    <path d={g.p} fill="none" stroke={g.c} strokeWidth="4" />
                    <text x={20} y={30} className="fill-slate-800 font-bold text-sm italic">{g.l}</text>
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
      <button onClick={onExit} className="fixed bottom-4 left-4 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-sm shadow-lg transition-all">Back to Map</button>
    </div>
  );
};

export default ExpressionsAndGraphsLevel3;
