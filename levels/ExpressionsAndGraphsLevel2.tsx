
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import CompletionModal from '../components/CompletionModal';

const PURPLE_PTS = [
  { x: -2, y: -4 },
  { x: -1, y: -2 },
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 4 },
  { x: 3, y: 6 },
  { x: 4, y: 8 }
];

const GREEN_PTS = [
  { x: -2, y: 1 },
  { x: -1, y: 2 },
  { x: 0, y: 3 },
  { x: 1, y: 4 },
  { x: 2, y: 5 },
  { x: 3, y: 6 },
  { x: 4, y: 7 }
];

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const ExpressionsAndGraphsLevel2: React.FC<LevelComponentProps> = ({ 
  onComplete, 
  onExit, 
  onNext,
  onProgressUpdate, 
  partialProgress 
}) => {
  const [phase, setPhase] = useState<'plotting' | 'analysis'>(() => partialProgress?.phase || 'plotting');
  const [placedPurple, setPlacedPurple] = useState<Set<number>>(new Set());
  const [placedGreen, setPlacedGreen] = useState<Set<number>>(new Set());
  
  // Selection state
  const [selectedPairIndex, setSelectedPairIndex] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<'p' | 'g' | null>(null);
  
  const [shuffledPurple] = useState(() => shuffle(PURPLE_PTS.map((p, i) => ({ p, i }))));
  const [shuffledGreen] = useState(() => shuffle(GREEN_PTS.map((p, i) => ({ p, i }))));
  
  const [qIndex, setQIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wrongDotId, setWrongDotId] = useState<{ id: number; g: 'p' | 'g' } | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  // Constants for Graph UI (Matching Level 1)
  const DIM = 550;
  const PAD = 50;
  
  const toPx = (x: number, y: number) => ({
    cx: PAD + ((x + 5) / 10) * (DIM - 2 * PAD),
    cy: PAD + ((10 - y) / 20) * (DIM - 2 * PAD)
  });

  useEffect(() => {
    // Progress mapping: Plotting is step 1, Q1 is step 2, Q2 is step 3
    const currentTask = phase === 'plotting' ? 1 : 2 + qIndex;
    onProgressUpdate?.(currentTask, 3);
  }, [phase, qIndex, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
      if (partialProgress.jumpToIndex === 1) {
        setPhase('plotting');
        setPlacedPurple(new Set());
        setPlacedGreen(new Set());
        setQIndex(0);
      } else {
        setPhase('analysis');
        setQIndex(partialProgress.jumpToIndex - 2);
      }
      setFeedback(null);
    }
  }, [partialProgress?.jumpToIndex]);

  const handlePairSelect = (index: number, group: 'p' | 'g') => {
    if (group === 'p' && placedPurple.has(index)) return;
    if (group === 'g' && placedGreen.has(index)) return;
    
    if (selectedPairIndex === index && selectedGroup === group) {
      setSelectedPairIndex(null);
      setSelectedGroup(null);
    } else {
      setSelectedPairIndex(index);
      setSelectedGroup(group);
    }
    setFeedback(null);
  };

  const handleDotClick = (pointIndex: number, group: 'p' | 'g') => {
    if (phase !== 'plotting' || selectedPairIndex === null || selectedGroup === null) return;

    const targetPoint = selectedGroup === 'p' ? PURPLE_PTS[selectedPairIndex] : GREEN_PTS[selectedPairIndex];
    const clickedPoint = group === 'p' ? PURPLE_PTS[pointIndex] : GREEN_PTS[pointIndex];

    if (targetPoint.x === clickedPoint.x && targetPoint.y === clickedPoint.y) {
      if (group === 'p') {
        setPlacedPurple(prev => {
          // FIX: Explicitly type the Set and add the element separately to avoid Set<unknown> inference issues with chained .add().
          const next = new Set<number>(prev);
          next.add(selectedPairIndex as number);
          checkPlottingComplete(next, placedGreen);
          return next;
        });
      } else {
        setPlacedGreen(prev => {
          // FIX: Explicitly type the Set and add the element separately to avoid Set<unknown> inference issues with chained .add().
          const next = new Set<number>(prev);
          next.add(selectedPairIndex as number);
          checkPlottingComplete(placedPurple, next);
          return next;
        });
      }
      setSelectedPairIndex(null);
      setSelectedGroup(null);
    } else {
      setErrorCount(prev => prev + 1);
      setWrongDotId({ id: pointIndex, g: group });
      setFeedback("That's not the right spot for this coordinate pair.");
      setTimeout(() => setWrongDotId(null), 1000);
    }
  };

  const checkPlottingComplete = (p: Set<number>, g: Set<number>) => {
    if (p.size === PURPLE_PTS.length && g.size === GREEN_PTS.length) {
      setFeedback("Great Job! Both lines are plotted.");
      setTimeout(() => {
        setPhase('analysis');
        setFeedback(null);
        setSelectedPairIndex(null);
        setSelectedGroup(null);
      }, 2000);
    }
  };

  const qs = [
    { 
      text: "At which value of x do the two expressions have the same y-value?", 
      options: ["x = 2", "x = 3", "x = 4"], 
      correct: 1,
      hint: "Find the intersection point where the lines cross."
    },
    { 
      text: "When is y = 2x larger than y = x + 3?", 
      options: ["x < 3", "x = 3", "x > 3"], 
      correct: 2,
      hint: "Look at the x-values where the purple line is above the green line."
    }
  ];

  const handleAns = (idx: number) => {
    if (idx === qs[qIndex].correct) {
      setFeedback("Correct!");
      setTimeout(() => {
        setFeedback(null);
        if (qIndex < qs.length - 1) setQIndex(qIndex + 1);
        else {
          const stars = errorCount <= 2 ? 3 : errorCount <= 5 ? 2 : 1;
          onComplete(stars);
          setShowCompletion(true);
        }
      }, 1500);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback(qs[qIndex].hint);
    }
  };

  const handleReplay = () => {
    setPhase('plotting');
    setPlacedPurple(new Set());
    setPlacedGreen(new Set());
    setQIndex(0);
    setFeedback(null);
    setErrorCount(0);
    setShowCompletion(false);
    setSelectedPairIndex(null);
    setSelectedGroup(null);
  };

  if (showCompletion) {
    const stars = errorCount <= 2 ? 3 : errorCount <= 5 ? 2 : 1;
    return (
      <CompletionModal 
        stars={stars} 
        onReplay={stars < 3 ? handleReplay : undefined} 
        onNext={stars >= 2 ? onNext : undefined}
        hint={stars < 3 ? "Complete the level with fewer mistakes to earn more stars!" : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col items-center min-h-full p-8 bg-slate-950 font-sans max-w-7xl mx-auto pb-24 text-xl">
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title={phase === 'plotting' ? "Plotting Two Lines" : "Analyzing Intersections"}
      >
        {phase === 'plotting' ? (
          <p>Plot two equations on the same grid: <span className="text-purple-400 font-bold italic">y = 2x</span> and <span className="text-emerald-400 font-bold italic">y = x + 3</span>. Select an ordered pair from the sidebar, then find its position on the grid.</p>
        ) : (
          <p>The two lines intersect at a specific point. Answer the questions based on where the lines cross and which one is higher at different values of x.</p>
        )}
      </InstructionModal>

      <div className="w-full text-center py-6 mb-8 border-b border-slate-800">
         <h2 className="text-2xl md:text-3xl font-medium text-slate-200">
           {phase === 'plotting' 
             ? <span>Plot the lines <span className="text-purple-400 italic">y = 2x</span> and <span className="text-emerald-400 italic">y = x + 3</span></span>
             : <span>Analyze the intersection of the two lines</span>}
         </h2>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-12 items-start justify-center">
        {/* Sidebar Controls Column */}
        <div className="flex flex-col w-full lg:w-[350px] gap-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl space-y-6">
            {phase === 'plotting' ? (
              <>
                <div>
                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">y = 2x</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {shuffledPurple.map((item) => {
                      const isPlaced = placedPurple.has(item.i);
                      const isSelected = selectedPairIndex === item.i && selectedGroup === 'p';
                      return (
                        <button
                          key={item.i}
                          onClick={() => handlePairSelect(item.i, 'p')}
                          disabled={isPlaced}
                          className={`p-2 rounded-xl border-2 font-mono text-sm transition-all duration-300 
                            ${isPlaced 
                              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 opacity-60' 
                              : isSelected 
                                ? 'bg-purple-600 border-purple-300 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-105 animate-pulse' 
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-purple-500 hover:bg-slate-700'
                            }`}
                        >
                          ({item.p.x}, {item.p.y})
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">y = x + 3</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {shuffledGreen.map((item) => {
                      const isPlaced = placedGreen.has(item.i);
                      const isSelected = selectedPairIndex === item.i && selectedGroup === 'g';
                      return (
                        <button
                          key={item.i}
                          onClick={() => handlePairSelect(item.i, 'g')}
                          disabled={isPlaced}
                          className={`p-2 rounded-xl border-2 font-mono text-sm transition-all duration-300 
                            ${isPlaced 
                              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 opacity-60' 
                              : isSelected 
                                ? 'bg-emerald-600 border-emerald-300 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105 animate-pulse' 
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-emerald-500 hover:bg-slate-700'
                            }`}
                        >
                          ({item.p.x}, {item.p.y})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                 <p className="text-sky-400 font-bold uppercase text-xs tracking-widest">Question {qIndex + 1}</p>
                 <h3 className="text-xl font-bold leading-tight text-white">{qs[qIndex].text}</h3>
                 <div className="space-y-3">
                    {qs[qIndex].options.map((o, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleAns(i)} 
                        className="w-full text-left p-4 bg-slate-800 border-2 border-slate-700 rounded-2xl hover:border-sky-500 transition-all font-medium text-white group"
                      >
                        <span className="inline-block w-8 h-8 rounded-full bg-slate-700 text-slate-400 group-hover:bg-sky-500 group-hover:text-white text-center leading-8 mr-3 transition-colors font-mono">{String.fromCharCode(65 + i)}</span>
                        {o}
                      </button>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {/* Feedback Area under Sidebar */}
          <div className="min-h-[4rem] flex items-center justify-center">
            {feedback && (
              <div className={`w-full px-6 py-3 rounded-2xl font-black text-center animate-fade-in-up 
                ${feedback.includes('Great') || feedback.includes('Correct') 
                  ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50' 
                  : 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/50'
                }`}
              >
                {feedback}
              </div>
            )}
          </div>
        </div>

        {/* Workspace Area: Graph */}
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl relative border-[12px] border-slate-900 group">
            <svg 
              width={DIM} 
              height={DIM} 
              viewBox={`0 0 ${DIM} ${DIM}`} 
              className="overflow-visible"
            >
              {/* Grid Lines */}
              {Array.from({ length: 11 }).map((_, i) => (
                <line key={`h-${i}`} x1={PAD + i * (DIM - 2 * PAD) / 10} y1={PAD} x2={PAD + i * (DIM - 2 * PAD) / 10} y2={DIM - PAD} stroke="#e2e8f0" strokeWidth="1" />
              ))}
              {Array.from({ length: 21 }).map((_, i) => (
                <line key={`v-${i}`} x1={PAD} y1={PAD + i * (DIM - 2 * PAD) / 20} x2={DIM - PAD} y2={PAD + i * (DIM - 2 * PAD) / 20} stroke="#e2e8f0" strokeWidth="1" />
              ))}
              
              {/* Main Axes */}
              <line x1={PAD} y1={DIM / 2} x2={DIM - PAD} y2={DIM / 2} stroke="#1e293b" strokeWidth="3" />
              <line x1={DIM / 2} y1={PAD} x2={DIM / 2} y2={DIM - PAD} stroke="#1e293b" strokeWidth="3" />
              
              <text x={DIM - PAD + 15} y={DIM / 2 + 5} className="fill-slate-800 font-black italic text-xl">x</text>
              <text x={DIM / 2} y={PAD - 20} textAnchor="middle" className="fill-slate-800 font-black italic text-2xl">y</text>

              {/* Connecting Lines (Analysis Phase) */}
              {phase === 'analysis' && (
                <>
                  <line x1={toPx(-3, -6).cx} y1={toPx(-3, -6).cy} x2={toPx(5, 10).cx} y2={toPx(5, 10).cy} stroke="#7c3aed" strokeWidth={6} strokeLinecap="round" className="opacity-40" />
                  <text x={toPx(4, 8).cx + 10} y={toPx(4, 8).cy} className="fill-purple-700 font-black text-xs italic">y = 2x</text>
                  
                  <line x1={toPx(-3, 0).cx} y1={toPx(-3, 0).cy} x2={toPx(5, 8).cx} y2={toPx(5, 8).cy} stroke="#10b981" strokeWidth={6} strokeLinecap="round" className="opacity-40" />
                  <text x={toPx(4, 7).cx + 10} y={toPx(4, 7).cy} className="fill-emerald-700 font-black text-xs italic">y = x + 3</text>
                </>
              )}

              {/* Plotting Dots */}
              {phase === 'plotting' && (
                <>
                  {/* Purple Dots */}
                  {PURPLE_PTS.map((pt, i) => {
                    const px = toPx(pt.x, pt.y);
                    const isPlaced = placedPurple.has(i);
                    const isTarget = selectedGroup === 'p' && selectedPairIndex === i;
                    const isWrong = wrongDotId?.g === 'p' && wrongDotId.id === i;

                    return (
                      <g key={`p-dot-${i}`} onClick={() => handleDotClick(i, 'p')} className="cursor-pointer">
                        <circle cx={px.cx} cy={px.cy} r={isPlaced ? 8 : 6} className={`transition-all duration-300 ${isPlaced ? 'fill-purple-600 shadow-lg' : isWrong ? 'fill-rose-500 animate-bounce' : 'fill-slate-200 stroke-slate-300 hover:fill-purple-300'}`} />
                        <circle cx={px.cx} cy={px.cy} r={35} fill="transparent" />
                      </g>
                    );
                  })}
                  {/* Green Dots */}
                  {GREEN_PTS.map((pt, i) => {
                    const px = toPx(pt.x, pt.y);
                    const isPlaced = placedGreen.has(i);
                    const isTarget = selectedGroup === 'g' && selectedPairIndex === i;
                    const isWrong = wrongDotId?.g === 'g' && wrongDotId.id === i;

                    return (
                      <g key={`g-dot-${i}`} onClick={() => handleDotClick(i, 'g')} className="cursor-pointer">
                        <circle cx={px.cx} cy={px.cy} r={isPlaced ? 8 : 6} className={`transition-all duration-300 ${isPlaced ? 'fill-emerald-600 shadow-lg' : isWrong ? 'fill-rose-500 animate-bounce' : 'fill-slate-200 stroke-slate-300 hover:fill-emerald-300'}`} />
                        <circle cx={px.cx} cy={px.cy} r={35} fill="transparent" />
                      </g>
                    );
                  })}
                </>
              )}

              {/* Static Analysis Points */}
              {phase === 'analysis' && (
                <>
                  {PURPLE_PTS.map((pt, i) => (
                    <circle key={`p-stat-${i}`} cx={toPx(pt.x, pt.y).cx} cy={toPx(pt.x, pt.y).cy} r={5} className="fill-purple-600 shadow-sm" />
                  ))}
                  {GREEN_PTS.map((pt, i) => (
                    <circle key={`g-stat-${i}`} cx={toPx(pt.x, pt.y).cx} cy={toPx(pt.x, pt.y).cy} r={5} className="fill-emerald-600 shadow-sm" />
                  ))}
                </>
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpressionsAndGraphsLevel2;
