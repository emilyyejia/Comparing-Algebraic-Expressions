
import React, { useState, useEffect, useRef } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';
import CompletionModal from '../components/CompletionModal';

type TileVal = 'x2_expand' | 'x3_expand';

const DropSlot: React.FC<{ onDrop: (val: TileVal) => void; onRemove: () => void; current: TileVal | null; placeholder: string }> = ({ onDrop, onRemove, current, placeholder }) => {
  const [{ isOver }, drop] = useDrop(() => ({ accept: 'TILE', drop: (item: { value: TileVal }) => onDrop(item.value), collect: m => ({ isOver: !!m.isOver() }) }));
  return (
    <div ref={drop} onClick={onRemove} className={`min-w-[100px] h-14 flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${current ? 'bg-slate-800 border-sky-500 text-sky-400' : isOver ? 'bg-sky-900/30 border-sky-400 border-dashed scale-105' : 'bg-slate-900 border-slate-700 border-dashed text-slate-600 italic text-xs'}`}>
      {current ? (current === 'x2_expand' ? '(x ⋅ x)' : '(x ⋅ x ⋅ x)') : placeholder}
    </div>
  );
};

const ExponentLawsLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, onProgressUpdate, partialProgress }) => {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [slotsA, setSlotsA] = useState<(TileVal | null)[]>( [null, null]);
  const [slotsB, setSlotsB] = useState<(TileVal | null)[]>( [null, null, null]);
  const [simpA, setSimpA] = useState('');
  const [simpB, setSimpB] = useState('');
  const [showSimp, setShowSimp] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Update progress to have 2 tasks total
  useEffect(() => {
    onProgressUpdate?.(showSimp ? 2 : 1, 2);
  }, [showSimp, onProgressUpdate]);

  useEffect(() => {
    if (partialProgress?.jumpToIndex) {
        if (partialProgress.jumpToIndex === 1) {
            setShowSimp(false);
            setPhase(1);
        } else if (partialProgress.jumpToIndex === 2) {
            setShowSimp(true);
            setPhase(1);
        }
    }
  }, [partialProgress?.jumpToIndex]);

  const checkExp = () => {
    const ok = slotsA[0] === 'x2_expand' && slotsA[1] === 'x3_expand' && slotsB.every(s => s === 'x2_expand');
    if (ok) {
        setShowSimp(true);
        setFeedback(null);
    } else {
        setFeedback("Check the expansion!");
    }
  };

  const ExpansionTile: React.FC<{ value: TileVal; content: string }> = ({ value, content }) => {
    const [{ isDragging }, drag] = useDrag(() => ({ type: 'TILE', item: { value, content }, collect: m => ({ isDragging: !!m.isDragging() }) }));
    return <div ref={drag} className={`px-6 py-3 bg-indigo-600 border-2 border-indigo-400 rounded-xl font-mono text-xl cursor-grab transition-all ${isDragging?'opacity-30':''}`}>{content}</div>;
  };

  const handleReplay = () => {
    setPhase(1);
    setSlotsA([null, null]);
    setSlotsB([null, null, null]);
    setSimpA('');
    setSimpB('');
    setShowSimp(false);
    setFeedback(null);
  };

  if (phase === 2) return <CompletionModal stars={3} onReplay={handleReplay} onBackToMap={onExit || (() => {})} />;

  const isTouch = 'ontouchstart' in window;
  const backend = isTouch ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={backend}>
      <div className="flex flex-col items-center min-h-full p-8 text-white max-w-5xl mx-auto pb-24 text-xl">
        <InstructionButton onClick={() => {}} />
        <h1 className="text-3xl font-bold text-sky-400 mb-8 uppercase">Expanding Exponents</h1>
        <div className="w-full bg-slate-900 p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-10">
           <p className="text-center italic">Drag and drop the purple boxes into the correct dotted box.</p>
           <div className="flex justify-center gap-6"><ExpansionTile value="x2_expand" content="(x ⋅ x)" /><ExpansionTile value="x3_expand" content="(x ⋅ x ⋅ x)" /></div>
           <div className="space-y-12">
             <div className="flex items-center justify-center gap-4">
                <span className="font-mono text-2xl">(x²)(x³) =</span>
                <DropSlot placeholder="expand x²" current={slotsA[0]} onDrop={v=>setSlotsA(prev=>[v, prev[1]])} onRemove={()=>setSlotsA(prev=>[null, prev[1]])}/>
                <DropSlot placeholder="expand x³" current={slotsA[1]} onDrop={v=>setSlotsA(prev=>[prev[0], v])} onRemove={()=>setSlotsA(prev=>[prev[0], null])}/>
                {showSimp && <><span className="text-2xl">=</span><input value={simpA} onChange={e=>setSimpA(e.target.value)} className="w-24 bg-black border-b-2 border-sky-400 text-center" placeholder="x^?" /></>}
             </div>
             <div className="flex items-center justify-center gap-4">
                <span className="font-mono text-2xl">(x²)³ =</span>
                {slotsB.map((s,i)=><DropSlot key={i} placeholder={`group ${i+1}`} current={s} onDrop={v=>{setSlotsB(prev=>{const next=[...prev];next[i]=v;return next;});}} onRemove={()=>{setSlotsB(prev=>{const next=[...prev];next[i]=null;return next;});}}/>)}
                {showSimp && <><span className="text-2xl">=</span><input value={simpB} onChange={e=>setSimpB(e.target.value)} className="w-24 bg-black border-b-2 border-sky-400 text-center" placeholder="x^?" /></>}
             </div>
           </div>
           <button onClick={showSimp ? () => {if(simpA.toLowerCase().replace(/\s/g,'')==='x^5'&&simpB.toLowerCase().replace(/\s/g,'')==='x^6'){onComplete(3); setPhase(2);}else setFeedback("Check your simplified forms!");} : checkExp} className="block mx-auto bg-sky-600 px-12 py-4 rounded-xl font-bold text-2xl shadow-lg transition-transform hover:scale-105 active:scale-95">{showSimp?'Check Result':'Check Expansion'}</button>
        </div>
        {feedback && <p className="mt-6 text-amber-400 font-bold animate-bounce text-center">{feedback}</p>}
      </div>
    </DndProvider>
  );
};

export default ExponentLawsLevel1;
