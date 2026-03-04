
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import type { LevelComponentProps } from '../types';
import CompletionModal from '../components/CompletionModal';

// --- Types ---
type TileType = 'x2' | 'x' | 'unit_neg' | 'n' | 'unit_pos' | 'y';

interface DraggableTile {
  id: string;
  type: TileType;
}

interface TaskParams {
  t1: { a: number; c: number };
  t2: { b: number; a: number; c: number };
  t3: { k: number };
  t4: { k: number };
}

// --- Icons / Shapes ---
const X2Shape = () => (
  <svg viewBox="0 0 100 80" className="w-20 h-16 text-purple-500 fill-current drop-shadow-md">
    <polygon points="20,0 80,0 100,80 0,80" />
    <text x="50" y="50" textAnchor="middle" fill="white" className="text-2xl font-bold font-mono">x²</text>
  </svg>
);

const XShape = () => (
  <svg viewBox="0 0 100 100" className="w-14 h-14 text-emerald-500 fill-current drop-shadow-md">
    <polygon points="50,0 100,38 82,100 18,100 0,38" />
    <text x="50" y="65" textAnchor="middle" fill="white" className="text-3xl font-bold font-mono">x</text>
  </svg>
);

const UnitNegShape = () => (
  <div className="w-12 h-12 bg-orange-500 rounded-sm shadow-md flex items-center justify-center text-white font-bold font-mono text-xl border-2 border-orange-600">
    -1
  </div>
);

const NTileShape = () => (
  <div className="w-28 h-14 bg-blue-500 rounded-md shadow-md flex items-center justify-center text-white font-bold font-mono text-2xl border-2 border-blue-600">
    n
  </div>
);

const YTileShape = () => (
  <div className="w-16 h-16 bg-rose-500 rounded-md shadow-md flex items-center justify-center text-white font-bold font-mono text-2xl border-2 border-rose-600">
    y
  </div>
);

const UnitPosShape = () => (
  <div className="w-14 h-14 bg-amber-400 rounded-md shadow-md flex items-center justify-center text-white font-bold font-mono text-2xl border-2 border-amber-500">
    1
  </div>
);

const DeleteButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-red-500 z-10"
  >
    ✕
  </button>
);

// --- Helper for Randomization ---
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateLevelParams = (): TaskParams => ({
  t1: { a: getRandomInt(3, 5), c: getRandomInt(2, 6) },
  t2: { b: getRandomInt(1, 2), a: getRandomInt(3, 5), c: getRandomInt(2, 6) },
  t3: { k: getRandomInt(1, 3) },
  t4: { k: getRandomInt(1, 3) },
});

// --- Components ---

const DraggableItem: React.FC<{ type: TileType; id: string; disabled?: boolean }> = ({ type, id, disabled }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TILE',
    item: { id, type },
    canDrag: !disabled,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type, id, disabled]);

  const renderShape = () => {
    switch (type) {
      case 'x2': return <X2Shape />;
      case 'x': return <XShape />;
      case 'unit_neg': return <UnitNegShape />;
      case 'n': return <NTileShape />;
      case 'y': return <YTileShape />;
      case 'unit_pos': return <UnitPosShape />;
      default: return null;
    }
  };

  return (
    <div ref={drag} className={`transition-all ${isDragging ? 'opacity-30' : 'opacity-100'} ${disabled ? 'grayscale opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:scale-110'} p-1`}>
      {renderShape()}
    </div>
  );
};

const DropZone: React.FC<{ 
  onDrop: (type: TileType) => void; 
  children: React.ReactNode; 
  className?: string;
  disabled?: boolean;
}> = ({ onDrop, children, className = '', disabled }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'TILE',
    canDrop: () => !disabled,
    drop: (item: DraggableTile) => onDrop(item.type),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [onDrop, disabled]);

  return (
    <div ref={drop} className={`${className} transition-colors ${isOver && canDrop ? 'bg-emerald-500/10' : ''} ${disabled ? 'bg-slate-800/20 opacity-80' : ''}`}>
      {children}
    </div>
  );
};

const AlgebraTilesLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, partialProgress, onSavePartialProgress, onProgressUpdate }) => {
  const [task, setTask] = useState<number>(() => partialProgress?.task || 1);
  const [params, setParams] = useState<TaskParams>(() => partialProgress?.params || generateLevelParams());
  const [subStep, setSubStep] = useState<number>(1); // 1: Modeling, 2: Simplifying
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Workspace States
  const [p1Counts, setP1Counts] = useState<Record<string, number>>({ x2: 0, x: 0, unit_neg: 0 });
  const [p2Groups, setP2Groups] = useState<{A: TileType[], B: TileType[], C: TileType[]}>({ A: [], B: [], C: [] });
  const [p2ExtraAns, setP2ExtraAns] = useState('');
  const [p3Groups, setP3Groups] = useState<{A: TileType[], B: TileType[]}>({ A: [], B: [] });
  const [p3ExtraAns, setP3ExtraAns] = useState('');

  const isCompletedRef = useRef(false);

  useEffect(() => {
    onProgressUpdate?.(task, 4);
  }, [task, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
      const idx = partialProgress.jumpToIndex;
      if (idx >= 1 && idx <= 4) {
        setTask(idx);
        resetCurrentTask();
      }
    }
  }, [partialProgress?.jumpToIndex]);

  const resetCurrentTask = useCallback(() => {
    setIsCorrect(false);
    setSubStep(1);
    setFeedback(null);
    setP1Counts({ x2: 0, x: 0, unit_neg: 0 });
    setP2Groups({ A: [], B: [], C: [] });
    setP3Groups({ A: [], B: [] });
    setP2ExtraAns('');
    setP3ExtraAns('');
  }, []);

  const handleDrop = (type: TileType, gid?: string) => {
    if (isCorrect || (task >= 3 && subStep === 2)) return;
    if (task <= 2) {
      setP1Counts(prev => ({ ...prev, [type]: prev[type] + 1 }));
    } else if (task === 3) {
      const id = gid as 'A' | 'B' | 'C';
      setP2Groups(prev => ({ ...prev, [id]: [...prev[id], type] }));
    } else if (task === 4) {
      const id = gid as 'A' | 'B';
      setP3Groups(prev => ({ ...prev, [id]: [...prev[id], type] }));
    }
  };

  const removeTile = (type: string, index?: number, gid?: string) => {
    if (isCorrect || (task >= 3 && subStep === 2)) return;
    if (task <= 2) {
      setP1Counts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
    } else if (task === 3) {
      const id = gid as 'A' | 'B' | 'C';
      setP2Groups(prev => ({ ...prev, [id]: prev[id].filter((_, i) => i !== index) }));
    } else if (task === 4) {
      const id = gid as 'A' | 'B';
      setP3Groups(prev => ({ ...prev, [id]: prev[id].filter((_, i) => i !== index) }));
    }
  };

  const checkCurrentTask = () => {
    if (task === 1) {
      const ok = p1Counts.x === params.t1.a && p1Counts.unit_neg === params.t1.c && p1Counts.x2 === 0;
      if (ok) { setIsCorrect(true); setFeedback("Excellent! Task complete."); }
      else { setErrorCount(prev => prev + 1); setFeedback("Try again! How many x‑tiles and −1-tiles do we need?"); }
    } else if (task === 2) {
      const ok = p1Counts.x2 === params.t2.b && p1Counts.x === params.t2.a && p1Counts.unit_neg === params.t2.c;
      if (ok) { setIsCorrect(true); setFeedback("Excellent! Task complete."); }
      else { setErrorCount(prev => prev + 1); setFeedback("Try again! How many x²‑tiles, x-tiles, and −1-tiles do we need?"); }
    } else if (task === 3) {
      const isCorrectModel = (g: TileType[]) => g.filter(t => t === 'n').length === 1 && g.filter(t => t === 'unit_pos').length === params.t3.k && g.length === (1 + params.t3.k);
      const modelOk = isCorrectModel(p2Groups.A) && isCorrectModel(p2Groups.B) && isCorrectModel(p2Groups.C);
      
      if (subStep === 1) {
        if (modelOk) { setSubStep(2); setFeedback("Model correct! Now simplify the expression."); }
        else { setErrorCount(prev => prev + 1); setFeedback(`Try again! How many n-tiles and 1-tiles do we need for each group?`); }
      } else {
        const norm = p2ExtraAns.replace(/\s/g, '').toLowerCase();
        const expected = `3n+${3 * params.t3.k}`;
        if (norm === expected) { setIsCorrect(true); setFeedback("Excellent! Task complete."); }
        else { setErrorCount(prev => prev + 1); setFeedback(`Try again! Count the total number of n-tiles and 1-tiles.`); }
      }
    } else if (task === 4) {
      const isCorrectModel = (g: TileType[]) => g.filter(t => t === 'y').length === 1 && g.filter(t => t === 'unit_pos').length === params.t4.k && g.length === (1 + params.t4.k);
      const modelOk = isCorrectModel(p3Groups.A) && isCorrectModel(p3Groups.B);
      
      if (subStep === 1) {
        if (modelOk) { setSubStep(2); setFeedback("Great job!"); }
        else { setErrorCount(prev => prev + 1); setFeedback(`Try again! How many y-tiles and 1-tiles do we need for each group?`); }
      } else {
        const norm = p3ExtraAns.replace(/\s/g, '').toLowerCase();
        const expected = `2y+${2 * params.t4.k}`;
        if (norm === expected) { setIsCorrect(true); setFeedback("Excellent! Task complete."); }
        else { setErrorCount(prev => prev + 1); setFeedback(`Try again! Count the total number of y-tiles and 1-tiles.`); }
      }
    }
  };

  const nextTask = () => {
    if (task < 4) {
      setTask(t => t + 1);
      resetCurrentTask();
    } else {
      isCompletedRef.current = true;
      setShowCompletion(true);
    }
  };

  const handleReplay = () => {
    setTask(1);
    setParams(generateLevelParams());
    setErrorCount(0);
    setShowCompletion(false);
    resetCurrentTask();
  };

  if (showCompletion) {
    const stars = errorCount <= 1 ? 3 : errorCount <= 3 ? 2 : 1;
    const tip = "Answer correctly on your first try to earn more stars!";
    
    return (
      <CompletionModal 
        stars={stars} 
        onReplay={stars < 3 ? handleReplay : undefined} 
        onBackToMap={stars === 1 ? undefined : (stars >= 2 ? undefined : onExit)}
        onNext={stars >= 2 ? onNext : undefined}
        hint={stars < 3 ? tip : undefined}
      />
    );
  }

  const instructions = [
    <>Drag tiles to represent <span className="text-amber-400 font-bold">{params.t1.a}x - {params.t1.c}</span></>,
    <>Drag tiles to represent <span className="text-amber-400 font-bold">{params.t2.b}x² + {params.t2.a}x - {params.t2.c}</span></>,
    subStep === 1 
      ? <>Drag the tiles to make 3 groups of <span className="text-amber-400 font-bold">(n + {params.t3.k})</span></>
      : <>Now, expand <span className="text-amber-400 font-bold">3(n + {params.t3.k})</span></>,
    subStep === 1
      ? <>Drag the tiles to make 2 groups of <span className="text-amber-400 font-bold">(y + {params.t4.k})</span></>
      : <>Now, expand <span className="text-amber-400 font-bold">2(y + {params.t4.k})</span></>
  ];

  return (
    <DndProvider backend={'ontouchstart' in window ? TouchBackend : HTML5Backend}>
      <div className="flex flex-col items-center justify-start min-h-full p-6 text-white bg-slate-950 font-sans max-w-6xl mx-auto pb-24 text-xl overflow-y-auto">
        
        {/* Centered Instructions at top */}
        <div className="w-full text-center py-6 mb-8 border-b border-slate-800">
           <h2 className="text-2xl md:text-3xl font-medium text-slate-200">
             {instructions[task - 1]}
           </h2>
        </div>

        {/* Workspace Area */}
        <div className="w-full flex-grow flex flex-col gap-8">
          
          {(task === 1 || task === 2) && (
            <div className="grid md:grid-cols-[200px_1fr] gap-12">
              <div className="bg-slate-800 p-6 rounded-2xl flex flex-col gap-6 items-center border border-slate-700 shadow-lg">
                <DraggableItem type="x2" id="p1x2" />
                <DraggableItem type="x" id="p1x" />
                <DraggableItem type="unit_neg" id="p1uneg" />
              </div>
              <DropZone onDrop={(t) => handleDrop(t)} className="bg-slate-800/50 min-h-[400px] border-4 border-dashed border-slate-600 rounded-3xl p-8 flex flex-wrap content-start gap-4">
                {Object.entries(p1Counts).map(([type, count]) => 
                  Array.from({ length: count as number }).map((_, i) => (
                    <div key={`${type}-${i}`} className="relative group animate-fade-in">
                      {type === 'x2' ? <X2Shape /> : type === 'x' ? <XShape /> : <UnitNegShape />}
                      {!isCorrect && <DeleteButton onClick={() => removeTile(type)} />}
                    </div>
                  ))
                )}
              </DropZone>
            </div>
          )}

          {task === 3 && (
            <div className="space-y-8">
              <div className="flex justify-center gap-12 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                <DraggableItem type="n" id="p2n" disabled={subStep === 2} />
                <DraggableItem type="unit_pos" id="p2up" disabled={subStep === 2} />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {(['A', 'B', 'C'] as const).map(gid => (
                  <DropZone key={gid} onDrop={(t) => handleDrop(t, gid)} disabled={subStep === 2} className="bg-slate-800/30 min-h-[250px] border-2 border-dashed border-slate-600 rounded-2xl p-4 flex flex-wrap content-start gap-2 relative">
                    {p2Groups[gid].map((t, i) => (
                      <div key={i} className="relative animate-fade-in">
                        {t === 'n' ? <NTileShape /> : <UnitPosShape />}
                        {!isCorrect && subStep === 1 && <DeleteButton onClick={() => removeTile(t, i, gid)} />}
                      </div>
                    ))}
                  </DropZone>
                ))}
              </div>
              
              {subStep === 2 && (
                <div className="bg-slate-800 p-8 rounded-2xl border-2 border-sky-500/30 text-center space-y-4 shadow-xl animate-fade-in-up">
                  <div className="flex items-center justify-center gap-4 text-3xl font-mono">
                    <span>3(n + {params.t3.k}) =</span>
                    <input 
                      value={p2ExtraAns} 
                      onChange={e => setP2ExtraAns(e.target.value)} 
                      disabled={isCorrect}
                      autoFocus
                      className="bg-slate-950 border-b-4 border-sky-500 w-48 text-center outline-none focus:bg-slate-900 transition-colors" 
                      placeholder="____" 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {task === 4 && (
            <div className="space-y-8">
              <div className="flex justify-center gap-12 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
                <DraggableItem type="y" id="p3y" disabled={subStep === 2} />
                <DraggableItem type="unit_pos" id="p3up" disabled={subStep === 2} />
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
                {(['A', 'B'] as const).map(gid => (
                  <DropZone key={gid} onDrop={(t) => handleDrop(t, gid)} disabled={subStep === 2} className="bg-slate-800/30 min-h-[250px] border-2 border-dashed border-slate-600 rounded-2xl p-4 flex flex-wrap content-start gap-2 relative">
                    {p3Groups[gid].map((t, i) => (
                      <div key={i} className="relative animate-fade-in">
                        {t === 'y' ? <YTileShape /> : <UnitPosShape />}
                        {!isCorrect && subStep === 1 && <DeleteButton onClick={() => removeTile(t, i, gid)} />}
                      </div>
                    ))}
                  </DropZone>
                ))}
              </div>

              {subStep === 2 && (
                <div className="bg-slate-800 p-8 rounded-2xl border-2 border-sky-500/30 text-center space-y-4 shadow-xl animate-fade-in-up">
                  <div className="flex items-center justify-center gap-4 text-3xl font-mono">
                    <span>2(y + {params.t4.k}) =</span>
                    <input 
                      value={p3ExtraAns} 
                      onChange={e => setP3ExtraAns(e.target.value)} 
                      disabled={isCorrect}
                      autoFocus
                      className="bg-slate-950 border-b-4 border-sky-500 w-48 text-center outline-none focus:bg-slate-900 transition-colors" 
                      placeholder="____" 
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action and Feedback Area */}
          <div className="flex flex-col items-center gap-6 mt-8">
            {!isCorrect ? (
              <button 
                onClick={checkCurrentTask} 
                className="bg-sky-600 px-16 py-4 rounded-xl font-bold text-2xl hover:bg-sky-500 shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                Check
              </button>
            ) : (
              <button 
                onClick={nextTask} 
                className="bg-emerald-600 px-16 py-4 rounded-xl font-bold text-2xl hover:bg-emerald-500 shadow-lg hover:scale-105 active:scale-95 transition-all animate-bounce"
              >
                {task < 4 ? 'Next Task' : 'Complete Level'}
              </button>
            )}
            
            {feedback && (
              <p className={`text-center font-bold text-xl ${isCorrect || (task >= 3 && subStep === 2) ? 'text-emerald-400' : 'text-amber-400'}`}>
                {feedback}
              </p>
            )}
          </div>

        </div>
      </div>
    </DndProvider>
  );
};

export default AlgebraTilesLevel1;
