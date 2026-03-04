
import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import CompletionModal from '../components/CompletionModal';

const M2Tile = () => <div className="w-16 h-16 bg-emerald-500 border-2 border-emerald-700 rounded-md flex items-center justify-center text-white font-bold shadow-md text-2xl">m²</div>;
const MTile = () => <div className="w-12 h-12 bg-blue-500 border-2 border-blue-700 rounded-md flex items-center justify-center text-white font-bold shadow-md text-xl">m</div>;
const XTile = () => <div className="w-16 h-8 bg-sky-200 border-2 border-sky-400 rounded flex items-center justify-center text-sky-900 font-bold shadow-sm text-xl">x</div>;
const UnitTile = () => <div className="w-8 h-8 bg-orange-400 border-2 border-orange-600 rounded flex items-center justify-center text-white font-bold shadow-sm text-xs">1</div>;
const NegUnitTile = () => <div className="w-8 h-8 bg-emerald-500 border-2 border-emerald-700 rounded flex items-center justify-center text-white font-bold shadow-sm text-xs">-1</div>;

// Helper to generate task parameters
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateTaskParams = () => {
  // Task 1: x + A vs x + B
  let t1A = getRandomInt(1, 6);
  let t1B = getRandomInt(1, 6);
  while (t1A === t1B) t1B = getRandomInt(1, 6);

  // Task 2: Ax - B vs Ax - C
  const t2A = getRandomInt(2, 3);
  let t2B = getRandomInt(2, 8);
  let t2C = getRandomInt(2, 8);
  while (t2B === t2C) t2C = getRandomInt(2, 8);

  // Task 3: k(am^2 + bm) vs kam^2 + kbm
  const t3K = getRandomInt(2, 3);
  const t3A = getRandomInt(1, 2);
  const t3B = getRandomInt(1, 2);

  return {
    t1: { a: t1A, b: t1B },
    t2: { a: t2A, b: t2B, c: t2C },
    t3: { k: t3K, a: t3A, b: t3B }
  };
};

const AlgebraTilesLevel3: React.FC<LevelComponentProps> = ({ onComplete, onExit, onNext, onProgressUpdate, partialProgress }) => {
  const [params, setParams] = useState(() => generateTaskParams());
  const [step, setStep] = useState(1);
  const [subStep, setSubStep] = useState<'build' | 'analyze'>('build');
  const [leftTiles, setLeftTiles] = useState<string[]>([]);
  const [rightTiles, setRightTiles] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isModelCorrect, setIsModelCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const isCompletedRef = useRef(false);

  useEffect(() => { onProgressUpdate?.(step, 3); }, [step, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
      const idx = partialProgress.jumpToIndex;
      if (idx >= 1 && idx <= 3) {
        setStep(idx);
        setSubStep('build');
        setLeftTiles([]);
        setRightTiles([]);
        setFeedback(null);
        setIsModelCorrect(false);
        setSelectedAnswer(null);
      }
    }
  }, [partialProgress?.jumpToIndex]);

  const getWeight = (tiles: string[]) => {
    return tiles.reduce((acc, t) => {
      switch (t) {
        case 'm2': return acc + 25; 
        case 'm':
        case 'x': return acc + 5;  
        case 'u': return acc + 1;  
        case 'nu': return acc - 1; 
        default: return acc;
      }
    }, 0);
  };

  const leftWeight = useMemo(() => getWeight(leftTiles), [leftTiles]);
  const rightWeight = useMemo(() => getWeight(rightTiles), [rightTiles]);

  const tiltAngle = useMemo(() => {
    if (leftWeight === rightWeight) return 0;
    return rightWeight > leftWeight ? 15 : -15;
  }, [leftWeight, rightWeight]);

  const checkModel = () => {
    let ok = false;
    if (step === 1) {
      ok = leftTiles.filter(t=>t==='x').length === 1 && leftTiles.filter(t=>t==='u').length === params.t1.a && 
           rightTiles.filter(t=>t==='x').length === 1 && rightTiles.filter(t=>t==='u').length === params.t1.b &&
           leftTiles.length === (1 + params.t1.a) && rightTiles.length === (1 + params.t1.b);
    } else if (step === 2) {
      ok = leftTiles.filter(t=>t==='x').length === params.t2.a && leftTiles.filter(t=>t==='nu').length === params.t2.b && 
           rightTiles.filter(t=>t==='x').length === params.t2.a && rightTiles.filter(t=>t==='nu').length === params.t2.c &&
           leftTiles.length === (params.t2.a + params.t2.b) && rightTiles.length === (params.t2.a + params.t2.c);
    } else if (step === 3) {
      const leftM2 = params.t3.k * params.t3.a;
      const leftM = params.t3.k * params.t3.b;
      ok = leftTiles.filter(t=>t==='m2').length === leftM2 && leftTiles.filter(t=>t==='m').length === leftM && 
           rightTiles.filter(t=>t==='m2').length === leftM2 && rightTiles.filter(t=>t==='m').length === leftM &&
           leftTiles.length === (leftM2 + leftM) && rightTiles.length === (leftM2 + leftM);
    }

    if (ok) {
      setFeedback("Correct!");
      setIsModelCorrect(true);
      setTimeout(() => {
        setSubStep('analyze');
        setFeedback(null);
      }, 1500);
    } else {
      setErrorCount(e => e + 1);
      setFeedback("Try again!");
      setIsModelCorrect(false);
    }
  };

  const handleAnswerSubmit = () => {
    let correctId = 'C'; // default for equal
    if (step === 1) {
      correctId = params.t1.a > params.t1.b ? 'A' : 'B';
    } else if (step === 2) {
      // Ax - B vs Ax - C. Subtracting less is heavier.
      correctId = params.t2.b < params.t2.c ? 'A' : 'B';
    } else if (step === 3) {
      correctId = 'C';
    }

    if (selectedAnswer === correctId) {
      setFeedback("Correct!");
      setTimeout(() => {
        if (step < 3) {
          setStep(s => s + 1); 
          setSubStep('build');
          setLeftTiles([]); 
          setRightTiles([]); 
          setFeedback(null); 
          setSelectedAnswer(null); 
          setIsModelCorrect(false);
        } else {
          isCompletedRef.current = true;
          let stars = 1;
          if (errorCount <= 1) stars = 3;
          else if (errorCount <= 3) stars = 2;
          
          onComplete(stars);
          setShowCompletion(true);
        }
      }, 1500);
    } else {
      setErrorCount(e => e + 1);
      setFeedback("Try again!");
    }
  };

  const handleReplay = () => {
    setParams(generateTaskParams());
    setStep(1);
    setSubStep('build');
    setLeftTiles([]);
    setRightTiles([]);
    setFeedback(null);
    setIsModelCorrect(false);
    setSelectedAnswer(null);
    setErrorCount(0);
    setShowCompletion(false);
  };

  if (showCompletion) {
    let stars = 1;
    if (errorCount <= 1) stars = 3;
    else if (errorCount <= 3) stars = 2;

    const tip = (stars === 1 || stars === 2) ? "Answer correctly on your first try to earn more stars!" : undefined;

    return (
      <CompletionModal 
        stars={stars} 
        onReplay={stars === 1 ? handleReplay : undefined} 
        onBackToMap={stars >= 2 ? onExit : undefined} 
        onNext={undefined} // Per requirements, remove Next Level button for all cases
        hint={tip}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-white bg-slate-950 font-sans text-xl max-w-6xl mx-auto pb-24">
      <div className="w-full bg-slate-900 rounded-3xl p-10 border border-slate-800 shadow-2xl relative transition-all duration-500">
        
        <h2 className="text-2xl font-bold text-center mb-10 min-h-[3rem] animate-fade-in">
          {subStep === 'build' 
            ? "Add algebra tiles to represent the expressions shown on each side of the scale."
            : "The model is built! Now compare the weights."}
        </h2>
        
        {subStep === 'build' && (
          <div className="grid grid-cols-2 gap-12 w-full max-w-4xl mx-auto mb-6 animate-fade-in">
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl flex flex-wrap justify-center gap-4">
              {step < 3 ? (
                <>
                  <button onClick={()=>setLeftTiles(p=>[...p, 'x'])} className="hover:scale-110 transition-transform"><XTile/></button>
                  <button onClick={()=>setLeftTiles(p=>[...p, 'u'])} className="hover:scale-110 transition-transform"><UnitTile/></button>
                  {step===2 && <button onClick={()=>setLeftTiles(p=>[...p, 'nu'])} className="hover:scale-110 transition-transform"><NegUnitTile/></button>}
                </>
              ) : (
                <>
                  <button onClick={()=>setLeftTiles(p=>[...p, 'm2'])} className="hover:scale-110 transition-transform"><M2Tile/></button>
                  <button onClick={()=>setLeftTiles(p=>[...p, 'm'])} className="hover:scale-110 transition-transform"><MTile/></button>
                </>
              )}
            </div>
            <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl flex flex-wrap justify-center gap-4">
              {step < 3 ? (
                <>
                  <button onClick={()=>setRightTiles(p=>[...p, 'x'])} className="hover:scale-110 transition-transform"><XTile/></button>
                  <button onClick={()=>setRightTiles(p=>[...p, 'u'])} className="hover:scale-110 transition-transform"><UnitTile/></button>
                  {step===2 && <button onClick={()=>setRightTiles(p=>[...p, 'nu'])} className="hover:scale-110 transition-transform"><NegUnitTile/></button>}
                </>
              ) : (
                <>
                  <button onClick={()=>setRightTiles(p=>[...p, 'm2'])} className="hover:scale-110 transition-transform"><M2Tile/></button>
                  <button onClick={()=>setRightTiles(p=>[...p, 'm'])} className="hover:scale-110 transition-transform"><MTile/></button>
                </>
              )}
            </div>
          </div>
        )}

        <div className="w-full flex justify-around items-center h-[400px] relative mb-12 bg-slate-800/40 rounded-[3rem] border border-slate-700 shadow-inner overflow-hidden">
          <div className="absolute bottom-0 w-32 h-80 bg-slate-800 border-x-4 border-t-4 border-slate-700 rounded-t-3xl" />
          <div className={`flex justify-between w-full px-24 transition-transform duration-1000 ease-in-out`} style={{ transform: `rotate(${tiltAngle}deg)` }}>
            <div className="flex flex-col items-center gap-4">
               <div className={`min-w-[200px] min-h-[140px] bg-slate-800/80 border-4 ${subStep === 'analyze' ? 'border-sky-500/50' : 'border-slate-600'} rounded-3xl p-4 flex flex-wrap gap-1 items-start content-start shadow-inner transition-colors`}>
                 {leftTiles.map((t,i) => (
                    <div 
                      key={i} 
                      onClick={subStep === 'build' ? ()=>setLeftTiles(p=>p.filter((_,idx)=>idx!==i)) : undefined} 
                      className={`scale-75 transition-all ${subStep === 'build' ? 'cursor-pointer hover:opacity-70' : 'opacity-100'}`}
                    >
                      {t==='x'?<XTile/>:t==='u'?<UnitTile/>:t==='nu'?<NegUnitTile/>:t==='m2'?<M2Tile/>:<MTile/>}
                    </div>
                 ))}
               </div>
               <p className={`font-bold text-2xl transition-colors ${subStep === 'analyze' ? 'text-white' : 'text-sky-400'}`}>
                 {step===1 ? `x + ${params.t1.a}` : step===2 ? `${params.t2.a}x - ${params.t2.b}` : `${params.t3.k}(${params.t3.a === 1 ? '' : params.t3.a}m² + ${params.t3.b === 1 ? '' : params.t3.b}m)`}
               </p>
            </div>
            <div className="flex flex-col items-center gap-4">
               <div className={`min-w-[200px] min-h-[140px] bg-slate-800/80 border-4 ${subStep === 'analyze' ? 'border-sky-500/50' : 'border-slate-600'} rounded-3xl p-4 flex flex-wrap gap-1 items-start content-start shadow-inner transition-colors`}>
                 {rightTiles.map((t,i) => (
                    <div 
                      key={i} 
                      onClick={subStep === 'build' ? ()=>setRightTiles(p=>p.filter((_,idx)=>idx!==i)) : undefined} 
                      className={`scale-75 transition-all ${subStep === 'build' ? 'cursor-pointer hover:opacity-70' : 'opacity-100'}`}
                    >
                      {t==='x'?<XTile/>:t==='u'?<UnitTile/>:t==='nu'?<NegUnitTile/>:t==='m2'?<M2Tile/>:<MTile/>}
                    </div>
                 ))}
               </div>
               <p className={`font-bold text-2xl transition-colors ${subStep === 'analyze' ? 'text-white' : 'text-sky-400'}`}>
                 {step===1 ? `x + ${params.t1.b}` : step===2 ? `${params.t2.a}x - ${params.t2.c}` : `${params.t3.k * params.t3.a}m² + ${params.t3.k * params.t3.b}m`}
               </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center w-full max-w-2xl mx-auto min-h-[120px]">
          {subStep === 'build' ? (
            <div className="w-full space-y-6 flex flex-col items-center animate-fade-in">
              <button 
                onClick={checkModel} 
                className="w-full max-w-sm bg-sky-600 hover:bg-sky-500 py-5 rounded-2xl font-black text-2xl transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                Check
              </button>
            </div>
          ) : (
            <div className="w-full bg-slate-800 p-8 rounded-[2rem] border-2 border-sky-500/30 shadow-2xl space-y-6 animate-fade-in-up">
               <h3 className="text-2xl font-black text-center mb-6 text-sky-200 tracking-tight">Which statement is true?</h3>
               <div className="grid grid-cols-1 gap-3">
                 {[
                   { id: 'A', text: 'Left side is heavier.' },
                   { id: 'B', text: 'Right side is heavier.' },
                   { id: 'C', text: 'They are equal.' }
                 ].map((opt) => (
                   <button 
                    key={opt.id} 
                    onClick={() => setSelectedAnswer(opt.id)} 
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-bold ${selectedAnswer === opt.id ? 'bg-sky-600 border-sky-300 text-white shadow-lg scale-102' : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-300'}`}
                   >
                     <span className="mr-4 text-sky-400 font-mono">{opt.id}</span> {opt.text}
                   </button>
                 ))}
               </div>
               <button 
                onClick={handleAnswerSubmit} 
                disabled={!selectedAnswer} 
                className="w-full bg-emerald-600 hover:bg-emerald-500 py-5 rounded-2xl font-black text-2xl disabled:opacity-50 transition-all shadow-xl hover:scale-105 active:scale-95 mt-4"
               >
                 Check
               </button>
            </div>
          )}
          
          {feedback && (
            <div className="mt-8">
              <p className={`text-center font-black text-2xl animate-bounce ${isModelCorrect && feedback.includes('Correct') ? 'text-emerald-400' : 'text-amber-400'}`}>
                {feedback}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AlgebraTilesLevel3;
