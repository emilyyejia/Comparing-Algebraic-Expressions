import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { LevelComponentProps } from '../types';
import CompletionModal from '../components/CompletionModal';

// --- Visual Components ---
// FIX: Using React.FC to allow 'key' and other standard component props during mapping
const RectTile: React.FC<{ label: string }> = ({ label }) => <div className="w-24 h-12 bg-sky-200 text-sky-900 flex items-center justify-center font-bold border-2 border-black/20 shadow-sm rounded-sm text-2xl animate-fade-in">{label}</div>;

const SquareUnit: React.FC<{ label: string; color?: string }> = ({ label, color = "bg-orange-400" }) => <div className={`w-12 h-12 ${color} text-white flex items-center justify-center font-bold border-2 border-black/10 shadow-sm rounded-sm text-2xl animate-fade-in`}>{label}</div>;

// FIX: Using React.FC to allow 'key' and other standard component props during mapping
const CircleM: React.FC<{ label: string }> = ({ label }) => <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-blue-600 text-2xl animate-fade-in">{label}</div>;

// FIX: Using React.FC to allow 'key' and other standard component props during mapping
const StarUnit: React.FC = () => <div className="w-14 h-14 bg-yellow-400 flex items-center justify-center text-amber-900 font-bold shadow-md text-2xl" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>1</div>;

// FIX: Using React.FC to allow 'key' and other standard component props during mapping
const ParallelogramR: React.FC<{ label: string }> = ({ label }) => <div className="w-20 h-14 bg-rose-400 flex items-center justify-center text-rose-900 font-bold shadow-md border-2 border-rose-500 text-2xl animate-fade-in" style={{ transform: 'skew(-20deg)' }}><span style={{ transform: 'skew(20deg)' }}>{label}</span></div>;

// FIX: Using React.FC to allow 'key' and other standard component props during mapping
const DiamondUnit: React.FC = () => <div className="w-14 h-14 bg-blue-400 flex items-center justify-center text-white font-bold shadow-md border-2 border-blue-500 text-2xl animate-fade-in" style={{ transform: 'rotate(45deg)' }}><span style={{ transform: 'rotate(-45deg)' }}>1</span></div>;

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const AlgebraTilesLevel2: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, partialProgress, onProgressUpdate }) => {
  // --- Randomization Setup ---
  const generateParams = () => {
    const vars = ['m', 'n', 'r', 't', 'x', 's', 'y'];
    const p5Var = vars[getRandomInt(0, vars.length - 1)];
    const p6Var = vars.filter(v => v !== p5Var)[getRandomInt(0, vars.length - 2)];

    // Phase 3: a(x + b) -> ensure a * b <= 12 to prevent click fatigue
    const p3A = getRandomInt(2, 3);
    const p3B = getRandomInt(2, 4);

    // Phase 7: a(x + b) -> ensure a * b <= 12 for better subitizing/counting
    let p7A = getRandomInt(2, 4);
    let p7B = getRandomInt(2, 4);
    while (p7A * p7B > 12) {
      p7A = getRandomInt(2, 4);
      p7B = getRandomInt(2, 4);
    }

    return {
      p1: { a: getRandomInt(2, 5), b: getRandomInt(1, 6), var: 'm' },
      p2: { a: getRandomInt(3, 5), b: getRandomInt(1, 5), var: 't' },
      p3: { a: p3A, b: p3B, var: 'x' },
      p5: { a: getRandomInt(2, 5), b: getRandomInt(2, 5), var: p5Var },
      p6: { a: getRandomInt(2, 5), b: getRandomInt(2, 5), var: p6Var },
      p7: { 
        a: p7A, 
        b: p7B, 
        var: 'x', 
        distractors: [
          `${p7A}x + ${p7B}`,           // Mistake: forgot to distribute
          `${p7A}(x + ${p7B + 2})`      // Mistake: wrong constant
        ]
      }
    };
  };

  const [params, setParams] = useState(() => generateParams());
  const [phase, setPhase] = useState(1);
  const [placedTiles, setPlacedTiles] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'hint' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const isCompletedRef = useRef(false);

  useEffect(() => {
    onProgressUpdate?.(phase, 6);
  }, [phase, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
      const idx = partialProgress.jumpToIndex;
      if (idx >= 1 && idx <= 6) {
        setPhase(idx);
        setPlacedTiles([]);
        setInputText("");
        setSelectedOptions([]);
        setFeedback(null);
        setFeedbackType(null);
        setShowHint(false);
        setShowErrors(false);
      }
    }
  }, [partialProgress?.jumpToIndex]);

  const addTile = (type: string) => {
    setPlacedTiles(prev => [...prev, { type, id: Date.now() + Math.random() }]);
  };

  const removeTile = (id: number) => {
    setPlacedTiles(prev => prev.filter(t => t.id !== id));
  };

  const checkRep = (reqs: Record<string, number>) => {
    const counts: Record<string, number> = {};
    placedTiles.forEach(t => { counts[t.type] = (counts[t.type] || 0) + 1; });
    const ok = Object.keys(reqs).every(k => counts[k] === reqs[k]) && Object.keys(counts).every(k => reqs[k] !== undefined);
    if (ok) {
      setFeedbackType('success');
      setFeedback("Correct!");
      setTimeout(() => { 
        setPhase(p => p + 1); 
        setPlacedTiles([]); 
        setFeedback(null); 
        setFeedbackType(null); 
        setShowHint(false);
      }, 1000);
    } else {
      setErrorCount(e => e + 1);
      setFeedbackType('hint');
      
      // Phase-specific hints
      if (phase === 1) {
        setFeedback("Try again! How many m-tiles and 1-tiles do we need?");
      } else if (phase === 2) {
        setFeedback("Try again! How many t-tiles and -1-tiles do we need?");
      } else if (phase === 3) {
        setFeedback(`Try again! We have ${params.p3.a} groups of (${params.p3.var} + ${params.p3.b}). How many ${params.p3.var}-tiles and 1-tiles do we need in total?`);
      } else {
        setFeedback("Try again! Check the number of tiles.");
      }
    }
  };

  const checkId = (correct: string) => {
    if (inputText.replace(/\s/g, '').toLowerCase() === correct.toLowerCase()) {
      setFeedbackType('success');
      setFeedback("Correct!");
      setTimeout(() => { 
        if (phase < 6) {
          setPhase(p => p + 1); setInputText(""); setFeedback(null); setFeedbackType(null);
        } else {
          isCompletedRef.current = true;
          setShowCompletion(true);
        }
      }, 1000);
    } else {
      setErrorCount(e => e + 1);
      setFeedbackType('hint');
      
      // Phase-specific hints
      if (phase === 4) {
        setFeedback(`Try again! How many ${params.p5.var}-tiles and 1-tiles do we have in total?`);
      } else if (phase === 5) {
        setFeedback(`Try again! How many ${params.p6.var}-tiles and 1-tiles do we have in total?`);
      } else {
        setFeedback("Check the total number of variable tiles and unit tiles.");
      }
    }
  };

  const p7Options = useMemo(() => {
    const correct = [`${params.p7.a}x + ${params.p7.a * params.p7.b}`, `${params.p7.a}(x + ${params.p7.b})`];
    const pool = [...correct, ...params.p7.distractors];
    return shuffleArray(pool).map((text, i) => ({ id: i, text, isCorrect: correct.includes(text) }));
  }, [params]);

  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const handleFinish = () => {
    const selectedTexts = selectedOptions.map(id => p7Options[parseInt(id)].text);
    const correctCount = p7Options.filter(o => o.isCorrect).length;
    const selectedCorrect = p7Options.filter(o => o.isCorrect && selectedOptions.includes(o.id.toString())).length;
    
    if (selectedOptions.length === correctCount && selectedCorrect === correctCount) {
      setFeedbackType('success');
      setFeedback("Excellent! Both expressions correctly represent the model.");
      isCompletedRef.current = true;
      setTimeout(() => setShowCompletion(true), 1500);
    } else {
      setErrorCount(e => e + 1);
      setFeedbackType('hint');
      setShowErrors(true);
      if (selectedOptions.length !== 2) {
        setFeedback("Choose exactly TWO correct expressions.");
      } else {
        setFeedback("Try again! Check the total number of x-tiles and 1-tiles.");
      }
    }
  };

  const handleReplay = () => {
    setParams(generateParams());
    setPhase(1);
    setPlacedTiles([]);
    setInputText("");
    setSelectedOptions([]);
    setFeedback(null);
    setFeedbackType(null);
    setShowHint(false);
    setShowErrors(false);
    setErrorCount(0);
    setHintCount(0);
    setShowCompletion(false);
  };

  if (showCompletion) {
    const penaltyPoints = errorCount + (hintCount * 0.5);
    let stars = 1;
    if (penaltyPoints <= 1.5) stars = 3;
    else if (penaltyPoints <= 4.5) stars = 2;
    
    const tip = stars < 3 ? "Complete the level with fewer errors or hints to earn more stars!" : undefined;
    
    return (
      <CompletionModal 
        stars={stars} 
        onReplay={stars < 3 ? handleReplay : undefined} 
        onNext={stars >= 2 ? onNext : undefined}
        onBackToMap={undefined} 
        hint={tip}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-white bg-slate-950 max-w-5xl mx-auto pb-24 text-xl">
      <div className="w-full bg-slate-900 rounded-3xl p-10 border border-slate-800 shadow-2xl relative">
        
        {phase === 1 && (
          <div className="space-y-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold">Click the tiles to represent <span className="text-amber-400 font-bold">{params.p1.a}{params.p1.var} + {params.p1.b}</span></h2>
            <div className="flex justify-center gap-8 bg-slate-800 p-6 rounded-2xl">
              <button onClick={() => addTile('v')} aria-label={`Add ${params.p1.var} tile`}><CircleM label={params.p1.var}/></button>
              <button onClick={() => addTile('u')} aria-label="Add unit tile"><StarUnit /></button>
            </div>
            <div className="min-h-[250px] bg-slate-800/50 border-4 border-dashed border-slate-700 rounded-2xl p-6 flex flex-wrap gap-4 content-start">
              {placedTiles.map(t => <div key={t.id} onClick={() => removeTile(t.id)} className="cursor-pointer hover:opacity-50">{t.type === 'v' ? <CircleM label={params.p1.var}/> : <StarUnit />}</div>)}
            </div>
            <button onClick={() => checkRep({v: params.p1.a, u: params.p1.b})} className="bg-sky-600 px-12 py-3 rounded-xl font-bold hover:bg-sky-500 transition-colors">Check</button>
          </div>
        )}

        {phase === 2 && (
          <div className="space-y-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold">Click the tiles to represent <span className="text-amber-400 font-bold">{params.p2.a}{params.p2.var} - {params.p2.b}</span></h2>
            <div className="flex justify-center gap-8 bg-slate-800 p-6 rounded-2xl">
              <button onClick={() => addTile('v')} aria-label={`Add ${params.p2.var} tile`}><RectTile label={params.p2.var} /></button>
              <button onClick={() => addTile('nu')} aria-label="Add negative unit tile"><SquareUnit label="-1" /></button>
            </div>
            <div className="min-h-[250px] bg-slate-800/50 border-4 border-dashed border-slate-700 rounded-2xl p-6 flex flex-wrap gap-4 content-start">
              {placedTiles.map(t => <div key={t.id} onClick={() => removeTile(t.id)} className="cursor-pointer hover:opacity-50">{t.type === 'v' ? <RectTile label={params.p2.var} /> : <SquareUnit label="-1" />}</div>)}
            </div>
            <button onClick={() => checkRep({v: params.p2.a, nu: params.p2.b})} className="bg-sky-600 px-12 py-3 rounded-xl font-bold hover:bg-sky-500 transition-colors">Check</button>
          </div>
        )}

        {phase === 3 && (
          <div className="space-y-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold">Click the tiles to represent <span className="text-amber-400 font-bold">{params.p3.a}({params.p3.var} + {params.p3.b})</span></h2>
            <div className="flex justify-center gap-8 bg-slate-800 p-6 rounded-2xl">
              <button onClick={() => addTile('v')} aria-label={`Add ${params.p3.var} tile`}><RectTile label={params.p3.var} /></button>
              <button onClick={() => addTile('u')} aria-label="Add unit tile"><SquareUnit label="1" color="bg-orange-500" /></button>
            </div>
            <div className="min-h-[250px] bg-slate-800/50 border-4 border-dashed border-slate-700 rounded-2xl p-6 flex flex-wrap gap-4 content-start">
              {placedTiles.map(t => <div key={t.id} onClick={() => removeTile(t.id)} className="cursor-pointer hover:opacity-50">{t.type === 'v' ? <RectTile label={params.p3.var} /> : <SquareUnit label="1" color="bg-orange-500" />}</div>)}
            </div>
            <button onClick={() => checkRep({v: params.p3.a, u: params.p3.a * params.p3.b})} className="bg-sky-600 px-12 py-3 rounded-xl font-bold hover:bg-sky-500 transition-colors">Check</button>
          </div>
        )}

        {phase === 4 && (
          <div className="space-y-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold">Write an algebraic expression that represents the pattern shown below.</h2>
            <div className="bg-slate-800 p-10 rounded-2xl flex flex-wrap justify-center gap-6">
              {[...Array(params.p5.a)].map((_, i) => <ParallelogramR key={`p5v-${i}`} label={params.p5.var} />)}
              {[...Array(params.p5.b)].map((_, i) => <DiamondUnit key={`p5u-${i}`} />)}
            </div>
            <input value={inputText} onChange={e => setInputText(e.target.value)} className="bg-slate-950 border-b-4 border-sky-500 text-center w-64 text-2xl outline-none focus:border-sky-400 transition-colors" placeholder="____" />
            <button onClick={() => checkId(`${params.p5.a}${params.p5.var}+${params.p5.b}`)} className="block mx-auto bg-sky-600 px-12 py-3 rounded-xl font-bold mt-4 hover:bg-sky-500 transition-colors">Check</button>
          </div>
        )}

        {phase === 5 && (
          <div className="space-y-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold">Write an algebraic expression that represents the pattern shown below.</h2>
            <div className="bg-slate-800 p-10 rounded-2xl flex flex-wrap justify-center gap-6">
              {[...Array(params.p6.a)].map((_, i) => <RectTile key={`p6v-${i}`} label={params.p6.var} />)}
              {[...Array(params.p6.b)].map((_, i) => <SquareUnit key={`p6u-${i}`} label="1" />)}
            </div>
            <input value={inputText} onChange={e => setInputText(e.target.value)} className="bg-slate-950 border-b-4 border-sky-500 text-center w-64 text-2xl outline-none focus:border-sky-400 transition-colors" placeholder="____" />
            <button onClick={() => checkId(`${params.p6.a}${params.p6.var}+${params.p6.b}`)} className="block mx-auto bg-sky-600 px-12 py-3 rounded-xl font-bold mt-4 hover:bg-sky-500 transition-colors">Check</button>
          </div>
        )}

        {phase === 6 && (
          <div className="space-y-8 text-center animate-fade-in">
            <h2 className="text-2xl font-bold">Select TWO expressions that represent the pattern below:</h2>
            <div className="bg-slate-800 p-10 rounded-2xl flex flex-wrap justify-center gap-6">
              {[...Array(params.p7.a)].map((_, i) => <RectTile key={`p7v-${i}`} label="x" />)}
              {[...Array(params.p7.a * params.p7.b)].map((_, i) => <SquareUnit key={`p7u-${i}`} label="1" />)}
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              {p7Options.map((opt) => {
                const isSelected = selectedOptions.includes(opt.id.toString());
                const shouldShowError = showErrors && isSelected && !opt.isCorrect;
                
                let btnClasses = `p-4 rounded-xl border-2 transition-all font-medium text-lg `;
                if (isSelected) {
                  if (shouldShowError) {
                    btnClasses += 'bg-red-500/20 border-red-500 text-red-200 input-flash-incorrect ';
                  } else {
                    btnClasses += 'bg-sky-600 border-sky-400 text-white ';
                  }
                } else {
                  btnClasses += 'bg-slate-800 border-slate-700 hover:border-slate-600 text-slate-300 ';
                }

                return (
                  <button 
                    key={opt.id} 
                    onClick={() => {
                      setSelectedOptions(p => p.includes(opt.id.toString()) ? p.filter(x=>x!==opt.id.toString()) : [...p, opt.id.toString()]);
                      setShowErrors(false);
                      setFeedback(null);
                    }} 
                    className={btnClasses}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={handleFinish} 
              className="bg-emerald-600 hover:bg-emerald-500 px-12 py-4 rounded-xl font-bold text-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              Check
            </button>
          </div>
        )}

        {feedback && (
          <div className={`mt-8 text-center font-bold px-4 max-w-lg mx-auto ${feedbackType === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlgebraTilesLevel2;