
import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import CompletionModal from '../components/CompletionModal';

const LINEAR_POINTS = [
  { x: -2, y: -4 },
  { x: -1, y: -2 },
  { x: 0, y: 0 },
  { x: 1, y: 2 },
  { x: 2, y: 4 }
];

const getRandomC = () => Math.floor(Math.random() * (2 - (-5) + 1)) + (-5);

const ExpressionsAndGraphsLevel1: React.FC<LevelComponentProps> = ({ 
  onComplete, 
  onExit, 
  onNext,
  onProgressUpdate, 
  partialProgress 
}) => {
  const [phase, setPhase] = useState<'plotting' | 'identifying'>(() => partialProgress?.phase || 'plotting');
  const [placedIndices, setPlacedIndices] = useState<Set<number>>(new Set());
  const [selectedPairIndex, setSelectedPairIndex] = useState<number | null>(null);
  const [wrongDotId, setWrongDotId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  
  // Randomization for Task 2
  const [constantC, setConstantC] = useState(() => partialProgress?.constantC ?? getRandomC());
  
  const dynamicQuadPoints = useMemo(() => ({
    P: { x: 0, y: constantC }, 
    A: { x: -1, y: 2 + constantC }, 
    B: { x: 1, y: 2 + constantC }, 
    C: { x: 2, y: 8 + constantC }, 
    D: { x: -2, y: 8 + constantC } 
  }), [constantC]);

  const [quadAns, setQuadAns] = useState<Record<string, { x: string, y: string }>>({ 
    P: { x: '', y: '' }, 
    A: { x: '', y: '' }, 
    B: { x: '', y: '' }, 
    C: { x: '', y: '' }, 
    D: { x: '', y: '' } 
  });
  
  const [invalidFields, setInvalidFields] = useState<Record<string, { x: boolean, y: boolean }>>({});

  const [showCompletion, setShowCompletion] = useState(false);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  // Constants for Graph UI
  const DIM = 550; // Larger graph
  const PAD = 50;
  
  const toPx = (x: number, y: number) => ({
    cx: PAD + ((x + 5) / 10) * (DIM - 2 * PAD),
    cy: PAD + ((10 - y) / 20) * (DIM - 2 * PAD)
  });

  useEffect(() => {
    onProgressUpdate?.(phase === 'plotting' ? 1 : 2, 2);
  }, [phase, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
      const idx = partialProgress.jumpToIndex;
      if (idx === 1) {
        setPhase('plotting');
      } else {
        setPhase('identifying');
      }
      setPlacedIndices(new Set());
      setSelectedPairIndex(null);
      setFeedback(null);
    }
  }, [partialProgress?.jumpToIndex]);

  const handlePairSelect = (index: number) => {
    if (placedIndices.has(index)) return;
    setSelectedPairIndex(selectedPairIndex === index ? null : index);
    setFeedback(null);
  };

  const handleDotClick = (pointIndex: number) => {
    if (phase !== 'plotting' || selectedPairIndex === null) return;

    const selectedPoint = LINEAR_POINTS[selectedPairIndex];
    const clickedPoint = LINEAR_POINTS[pointIndex];

    if (selectedPoint.x === clickedPoint.x && selectedPoint.y === clickedPoint.y) {
      setPlacedIndices(prev => {
        const next = new Set(prev).add(selectedPairIndex);
        if (next.size === LINEAR_POINTS.length) {
          setFeedback("Great Job! You've plotted the line y = 2x.");
          setTimeout(() => {
            setPhase('identifying');
            setFeedback(null);
            setSelectedPairIndex(null);
          }, 2000);
        }
        return next;
      });
      setSelectedPairIndex(null);
    } else {
      setErrorCount(prev => prev + 1);
      setWrongDotId(pointIndex);
      setFeedback("That's not the right spot for this coordinate pair.");
      setTimeout(() => setWrongDotId(null), 1000);
    }
  };

  const calculateStars = (errors: number) => {
    if (errors <= 2) return 3;
    if (errors <= 4) return 2;
    return 1;
  };

  const handleCheckAnswers = () => {
    const validation: Record<string, { x: boolean, y: boolean }> = {};
    let allOk = true;

    (Object.entries(dynamicQuadPoints) as [string, { x: number, y: number }][]).forEach(([k, p]) => {
      const userX = parseInt(quadAns[k].x);
      const userY = parseInt(quadAns[k].y);
      const xWrong = isNaN(userX) || userX !== p.x;
      const yWrong = isNaN(userY) || userY !== p.y;
      
      validation[k] = { x: xWrong, y: yWrong };
      if (xWrong || yWrong) allOk = false;
    });

    setInvalidFields(validation);

    if (allOk) {
      setFeedback(`Correct! You've identified the points on y = 2x² ${constantC >= 0 ? '+' : '-'} ${Math.abs(constantC)}.`);
      const stars = calculateStars(errorCount);
      onComplete(stars);
      setTimeout(() => setShowCompletion(true), 1500);
    } else {
      setErrorCount(prev => prev + 1);
      setFeedback("Some coordinates aren't quite right. Check the highlighted boxes!");
    }
  };

  const handleReplay = () => {
    setPhase('plotting');
    setPlacedIndices(new Set());
    setSelectedPairIndex(null);
    setFeedback(null);
    setErrorCount(0);
    setConstantC(getRandomC()); // Re-randomize for Task 2
    setQuadAns({ 
      P: { x: '', y: '' }, 
      A: { x: '', y: '' }, 
      B: { x: '', y: '' }, 
      C: { x: '', y: '' }, 
      D: { x: '', y: '' } 
    });
    setInvalidFields({});
    setShowCompletion(false);
  };

  if (showCompletion) {
    const stars = calculateStars(errorCount);
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
        title={phase === 'plotting' ? "Plotting Points" : "Identifying Points"}
      >
        {phase === 'plotting' ? (
          <p>Plot the line <span className="text-sky-400 font-bold italic">y = 2x</span>. Select an ordered pair, then mark its <span className="italic">(x, y)</span> position on the grid. Remember: horizontal first, then vertical.</p>
        ) : (
          <p>Examine the quadratic graph. Enter the (x, y) coordinates for each labeled point P, A, B, C, and D. The curve follows the rule <span className="italic">y = 2x² {constantC >= 0 ? '+' : '-'} {Math.abs(constantC)}</span>.</p>
        )}
      </InstructionModal>

      {/* Centered Instructions above activity with consistent font style */}
      <div className="w-full text-center py-6 mb-8 border-b border-slate-800">
         <h2 className="text-2xl md:text-3xl font-medium text-slate-200">
           {phase === 'plotting' 
             ? <span>Plot the line <span className="text-sky-300 italic">y = 2x</span>. Select an ordered pair, then mark its <span className="italic">(x, y)</span> on the grid.</span>
             : <span>Identify the points on the graph of <span className="text-fuchsia-400 italic">y = 2x² {constantC >= 0 ? '+' : '-'} {Math.abs(constantC)}</span></span>}
         </h2>
      </div>

      <div className="w-full flex flex-col lg:flex-row gap-12 items-start justify-center">
        {/* Sidebar Controls Column */}
        <div className="flex flex-col w-full lg:w-[350px] gap-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] border border-slate-800 shadow-2xl space-y-6">
            <h2 className="text-xl font-bold text-sky-300 uppercase tracking-widest border-b border-slate-800 pb-4">
              {phase === 'plotting' ? 'Ordered Pairs' : 'Quadratic Points'}
            </h2>
            
            {phase === 'plotting' ? (
              <div className="space-y-3">
                {LINEAR_POINTS.map((p, idx) => {
                  const isPlaced = placedIndices.has(idx);
                  const isSelected = selectedPairIndex === idx;
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handlePairSelect(idx)}
                      disabled={isPlaced}
                      className={`w-full p-4 rounded-2xl border-2 font-mono text-xl flex items-center justify-between transition-all duration-300 
                        ${isPlaced 
                          ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 opacity-60' 
                          : isSelected 
                            ? 'bg-sky-600 border-sky-300 text-white shadow-[0_0_20px_rgba(56,189,248,0.5)] scale-105 animate-pulse' 
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-sky-500 hover:bg-slate-700'
                        }`}
                    >
                      <span>({p.x}, {p.y})</span>
                      {isPlaced && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {['P', 'A', 'B', 'C', 'D'].map(k => (
                  <div key={k} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <span className="font-black text-fuchsia-400 w-6">{k}:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 font-mono">(</span>
                      <input 
                        value={quadAns[k].x} 
                        onChange={e => {
                          setQuadAns({ ...quadAns, [k]: { ...quadAns[k], x: e.target.value } });
                          if (invalidFields[k]?.x) setInvalidFields({ ...invalidFields, [k]: { ...invalidFields[k], x: false } });
                        }} 
                        className={`w-12 bg-slate-950 border rounded-md text-center py-1 font-mono transition-colors focus:outline-none 
                          ${invalidFields[k]?.x 
                            ? 'border-rose-500 text-rose-400 bg-rose-950/30 shadow-[0_0_8px_rgba(244,63,94,0.3)]' 
                            : 'border-slate-700 text-sky-400 focus:border-sky-500'}`} 
                      />
                      <span className="text-slate-500 font-mono">,</span>
                      <input 
                        value={quadAns[k].y} 
                        onChange={e => {
                          setQuadAns({ ...quadAns, [k]: { ...quadAns[k], y: e.target.value } });
                          if (invalidFields[k]?.y) setInvalidFields({ ...invalidFields, [k]: { ...invalidFields[k], y: false } });
                        }} 
                        className={`w-12 bg-slate-950 border rounded-md text-center py-1 font-mono transition-colors focus:outline-none 
                          ${invalidFields[k]?.y 
                            ? 'border-rose-500 text-rose-400 bg-rose-950/30 shadow-[0_0_8px_rgba(244,63,94,0.3)]' 
                            : 'border-slate-700 text-sky-400 focus:border-sky-500'}`} 
                      />
                      <span className="text-slate-500 font-mono">)</span>
                    </div>
                  </div>
                ))}
                <button 
                  onClick={handleCheckAnswers} 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 uppercase tracking-widest mt-4"
                >
                  Check Answers
                </button>
              </div>
            )}
          </div>

          {/* Feedback Area moved here, under the sidebar box */}
          <div className="min-h-[4rem] flex items-center justify-center">
            {feedback && (
              <div className={`w-full px-6 py-3 rounded-2xl font-black text-center animate-fade-in-up 
                ${feedback.includes('Correct') 
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
              {/* Grid Lines - Horizontal */}
              {Array.from({ length: 11 }).map((_, i) => (
                <line 
                  key={`h-${i}`} 
                  x1={PAD + i * (DIM - 2 * PAD) / 10} y1={PAD} 
                  x2={PAD + i * (DIM - 2 * PAD) / 10} y2={DIM - PAD} 
                  stroke="#e2e8f0" strokeWidth="1" 
                />
              ))}
              {/* Grid Lines - Vertical */}
              {Array.from({ length: 21 }).map((_, i) => (
                <line 
                  key={`v-${i}`} 
                  x1={PAD} y1={PAD + i * (DIM - 2 * PAD) / 20} 
                  x2={DIM - PAD} y2={PAD + i * (DIM - 2 * PAD) / 20} 
                  stroke="#e2e8f0" strokeWidth="1" 
                />
              ))}
              
              {/* Main Axes */}
              <line x1={PAD} y1={DIM / 2} x2={DIM - PAD} y2={DIM / 2} stroke="#1e293b" strokeWidth="3" />
              <line x1={DIM / 2} y1={PAD} x2={DIM / 2} y2={DIM - PAD} stroke="#1e293b" strokeWidth="3" />
              
              {/* Axis Labels */}
              <text x={DIM - PAD + 15} y={DIM / 2 + 5} className="fill-slate-800 font-black italic text-xl">x</text>
              <text x={DIM / 2} y={PAD - 20} textAnchor="middle" className="fill-slate-800 font-black italic text-2xl">y</text>
              
              {/* Origin Marker */}
              <circle cx={DIM / 2} cy={DIM / 2} r="4" fill="#1e293b" />

              {/* Task 1 Dots (Plotting) */}
              {phase === 'plotting' && LINEAR_POINTS.map((pt, i) => {
                const px = toPx(pt.x, pt.y);
                const isPlaced = placedIndices.has(i);
                const isWrong = wrongDotId === i;
                const isTarget = !isPlaced && selectedPairIndex !== null;

                return (
                  <g 
                    key={`dot-${i}`} 
                    onClick={() => handleDotClick(i)}
                    className="cursor-pointer"
                  >
                    {/* Pulsing Highlight for target if pair selected */}
                    {isTarget && (
                      <circle 
                        cx={px.cx} cy={px.cy} r={18} 
                        className="fill-sky-400/10 animate-pulse"
                      />
                    )}
                    {/* Visual Point */}
                    <circle 
                      cx={px.cx} cy={px.cy} r={isPlaced ? 8 : 6} 
                      className={`transition-all duration-300 
                        ${isPlaced 
                          ? 'fill-emerald-500 shadow-xl' 
                          : isWrong 
                            ? 'fill-rose-500 animate-bounce' 
                            : 'fill-slate-300 stroke-slate-400 hover:fill-sky-400'
                        }`} 
                    />
                    {/* Invisible large hit area */}
                    <circle 
                      cx={px.cx} cy={px.cy} r={35} 
                      fill="transparent" 
                    />
                  </g>
                );
              })}

              {/* Task 2 Points (Identifying) */}
              {phase === 'identifying' && (Object.entries(dynamicQuadPoints) as [string, { x: number, y: number }][]).map(([k, pt]) => {
                const px = toPx(pt.x, pt.y);
                return (
                  <g key={`quad-${k}`}>
                    <circle cx={px.cx} cy={px.cy} r={8} className="fill-fuchsia-600 shadow-md" />
                    <text 
                      x={px.cx + 12} y={px.cy - 12} 
                      className="fill-slate-900 font-black text-xl drop-shadow-sm"
                    >
                      {k}
                    </text>
                  </g>
                );
              })}

              {/* Connecting Lines for visualization once complete */}
              {placedIndices.size === LINEAR_POINTS.length && phase === 'plotting' && (
                <line 
                  x1={toPx(-2.5, -5).cx} y1={toPx(-2.5, -5).cy} 
                  x2={toPx(2.5, 5).cx} y2={toPx(2.5, 5).cy} 
                  stroke="#0284c7" strokeWidth={6} strokeLinecap="round" strokeDasharray="12,12" 
                  className="opacity-50"
                />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpressionsAndGraphsLevel1;
