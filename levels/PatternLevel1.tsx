
import React, { useState, useEffect, useRef } from 'react';
import type { LevelComponentProps } from '../types';
import InstructionButton from '../components/InstructionButton';
import InstructionModal from '../components/InstructionModal';

type Step = 1 | 2 | 3 | 4 | 5;

const PatternLevel1: React.FC<LevelComponentProps> = ({ onComplete, onExit, partialProgress, onSavePartialProgress }) => {
  const [step, setStep] = useState<Step>(() => partialProgress?.step || 1);
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message?: string } | null>(null);
  
  // Task 1 State: 3, 7, 11, 15, 19, 23...
  const [t1Behavior, setT1Behavior] = useState('');
  const [t1Value, setT1Value] = useState('');
  const [t1Term3, setT1Term3] = useState('');

  // Task 2 State: 37, 34, 31, 28...
  const [t2Values, setT2Values] = useState({ 5: '', 6: '', 7: '' });
  const [t2Behavior, setT2Behavior] = useState('');
  const [t2Term9, setT2Term9] = useState('');

  // Task 3 State: Graph y=3x
  const [t3Behavior, setT3Behavior] = useState('');
  const [t3Value, setT3Value] = useState('');
  const [t3Term5, setT3Term5] = useState('');

  // Task 4 State: 2, 4, 8, 16...
  const [t4Behavior, setT4Behavior] = useState('');
  const [t4Term5, setT4Term5] = useState('');

  // Task 5 State: Riddle
  const [t5Input, setT5Input] = useState('');
  const [t5Answer, setT5Answer] = useState('');

  const isCompletedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && onSavePartialProgress) {
        onSavePartialProgress({ step });
      }
    };
  }, [onSavePartialProgress, step]);

  const triggerCorrect = (nextStep?: Step) => {
    setFeedback({ type: 'correct' });
    setTimeout(() => {
      setFeedback(null);
      if (nextStep) setStep(nextStep);
      else {
        isCompletedRef.current = true;
        onComplete(3);
      }
    }, 1500);
  };

  const triggerIncorrect = (msg: string) => {
    setFeedback({ type: 'incorrect', message: msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  const validateT1 = () => {
    if (t1Behavior === 'increases' && t1Value === '4' && t1Term3 === '11') {
      triggerCorrect(2);
    } else {
      let hint = "Look at the numbers: 3 to 7 is +4. 7 to 11 is +4.";
      if (t1Term3 !== '11' && t1Term3 !== '') hint = "The 3rd term is the 3rd number in the list: 3, 7, 11...";
      triggerIncorrect(hint);
    }
  };

  const validateT2 = () => {
    const v5 = parseInt(t2Values[5]);
    const v6 = parseInt(t2Values[6]);
    const v7 = parseInt(t2Values[7]);
    const v9 = parseInt(t2Term9);

    if (v5 === 25 && v6 === 22 && v7 === 19 && t2Behavior === 'decreases' && v9 === 13) {
      triggerCorrect(3);
    } else {
      triggerIncorrect("The value goes down by 3 each time. 28 - 3 = 25. For the 9th term, keep subtracting!");
    }
  };

  const validateT3 = () => {
    if (t3Behavior === 'increases' && t3Value === '3' && t3Term5 === '15') {
      triggerCorrect(4);
    } else {
      triggerIncorrect("Check the graph: At n=1, V=3. At n=2, V=6. It increases by 3!");
    }
  };

  const validateT4 = () => {
    if (t4Behavior === 'doubles' && t4Term5 === '32') {
      triggerCorrect(5);
    } else {
      triggerIncorrect("2, 4, 8, 16... each figure is twice as big as the last! 16 x 2 = ?");
    }
  };

  const validateT5 = () => {
    if (t5Answer === '4') {
      triggerCorrect();
    } else {
      triggerIncorrect("Follow the steps carefully! The answer to this riddle is always the same.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 text-white bg-gray-900 font-sans max-w-4xl mx-auto">
      <InstructionButton onClick={() => setIsInstructionOpen(true)} />
      <InstructionModal
        isOpen={isInstructionOpen}
        onClose={() => setIsInstructionOpen(false)}
        title="Identifying Patterns"
      >
        <p>Patterns are rules that connect numbers or shapes. To find a pattern, look at how the value changes from one step to the next!</p>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
          <li>Check if values increase, decrease, or multiply.</li>
          <li>Use tables and graphs to spot trends.</li>
          <li>Apply the rule to find future values.</li>
        </ul>
      </InstructionModal>

      {/* PROGRESS BAR */}
      <div className="w-full flex gap-2 mb-8 px-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div 
            key={i} 
            className={`h-2 flex-1 rounded-full transition-colors duration-500 ${step >= i ? 'bg-sky-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]' : 'bg-gray-700'}`} 
          />
        ))}
      </div>

      {/* FEEDBACK POPUP */}
      {feedback && (
        <div className={`fixed top-24 px-6 py-3 rounded-xl font-bold shadow-2xl z-50 animate-fade-in ${
          feedback.type === 'correct' ? 'bg-emerald-500 text-white' : 'bg-rose-600 text-white'
        }`}>
          {feedback.type === 'correct' ? '✨ Correct!' : feedback.message}
        </div>
      )}

      <div className="w-full bg-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl border border-gray-700">
        
        {/* TASK 1: SEQUENCE */}
        {step === 1 && (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-sky-400 mb-6 uppercase tracking-wider">What's the Pattern?</h2>
            <div className="bg-gray-900 p-8 rounded-2xl mb-8 font-mono text-4xl text-indigo-300 tracking-widest shadow-inner border border-gray-700">
              3, 7, 11, 15, 19, 23, ...
            </div>
            <div className="space-y-6 text-lg">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span>The pattern</span>
                <select 
                  className="bg-gray-700 border-b-2 border-sky-500 px-2 py-1 rounded"
                  value={t1Behavior}
                  onChange={e => setT1Behavior(e.target.value)}
                >
                  <option value="">-- select --</option>
                  <option value="increases">increases</option>
                  <option value="decreases">decreases</option>
                </select>
                <span>by</span>
                <input 
                   type="number"
                   className="w-16 bg-gray-700 border-b-2 border-sky-500 text-center rounded"
                   value={t1Value}
                   onChange={e => setT1Value(e.target.value)}
                />
                <span>each time!</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span>What's the value for the 3rd term?</span>
                <input 
                  type="number"
                  className="w-20 bg-gray-700 border-b-2 border-sky-500 text-center rounded p-1"
                  value={t1Term3}
                  onChange={e => setT1Term3(e.target.value)}
                />
              </div>
              <button onClick={validateT1} className="mt-4 bg-sky-600 hover:bg-sky-500 px-10 py-3 rounded-xl font-bold transition-all transform hover:scale-105">Verify Pattern</button>
            </div>
          </div>
        )}

        {/* TASK 2: TABLE */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-sky-400 mb-6 text-center">Complete the Table</h2>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-lg border border-gray-700">
                <thead>
                  <tr className="bg-gray-700 text-sky-300">
                    <th className="p-3 border border-gray-600">n (Term)</th>
                    <th className="p-3 border border-gray-600">Value</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 font-mono">
                  {[1, 2, 3, 4].map(n => (
                    <tr key={n}>
                      <td className="p-3 border border-gray-700 text-center">{n}</td>
                      <td className="p-3 border border-gray-700 text-center text-indigo-300">{37 - (n-1)*3}</td>
                    </tr>
                  ))}
                  {[5, 6, 7].map(n => (
                    <tr key={n}>
                      <td className="p-3 border border-gray-700 text-center">{n}</td>
                      <td className="p-3 border border-gray-700 text-center">
                        <input 
                          type="number"
                          className="w-16 bg-gray-900 border border-sky-500/50 text-center rounded py-1"
                          value={t2Values[n as 5|6|7]}
                          onChange={e => setT2Values({...t2Values, [n]: e.target.value})}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-6 text-lg">
                <p className="text-gray-400 italic">"Identify the pattern and complete the table."</p>
                <div className="flex items-center gap-2">
                  <span>The pattern</span>
                  <select 
                    className="bg-gray-700 border-b-2 border-sky-500 px-2 rounded"
                    value={t2Behavior}
                    onChange={e => setT2Behavior(e.target.value)}
                  >
                    <option value="">-- select --</option>
                    <option value="increases">increases</option>
                    <option value="decreases">decreases</option>
                  </select>
                  <span>by 3!</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>What's the 9th term?</span>
                  <input 
                    type="number"
                    className="w-16 bg-gray-700 border-b-2 border-sky-500 text-center rounded"
                    value={t2Term9}
                    onChange={e => setT2Term9(e.target.value)}
                  />
                </div>
                <button onClick={validateT2} className="w-full bg-sky-600 hover:bg-sky-500 py-3 rounded-xl font-bold transition-all">Check Table</button>
              </div>
            </div>
          </div>
        )}

        {/* TASK 3: GRAPH */}
        {step === 3 && (
          <div className="animate-fade-in text-center">
            <h2 className="text-2xl font-bold text-sky-400 mb-4">Graph Patterns</h2>
            <div className="bg-white p-6 rounded-2xl mb-8 shadow-xl max-w-md mx-auto">
              <svg viewBox="0 0 120 120" className="w-full h-auto overflow-visible">
                {/* Grid */}
                {Array.from({length: 11}).map((_, i) => (
                  <React.Fragment key={i}>
                    <line x1="10" y1={10 + i*10} x2="110" y2={10 + i*10} stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="10 + i*10" y1="10" x2="10 + i*10" y2="110" stroke="#e2e8f0" strokeWidth="0.5" />
                  </React.Fragment>
                ))}
                {/* Axis */}
                <line x1="10" y1="110" x2="115" y2="110" stroke="#475569" strokeWidth="1.5" />
                <line x1="10" y1="110" x2="10" y2="5" stroke="#475569" strokeWidth="1.5" />
                {/* Labels */}
                <text x="60" y="125" fontSize="6" textAnchor="middle" fill="#475569" fontWeight="bold">Term (n)</text>
                <text x="-60" y="4" fontSize="6" textAnchor="middle" fill="#475569" fontWeight="bold" transform="rotate(-90)">Value (V)</text>
                {/* Scale */}
                {[0, 2, 4, 6].map(x => <text key={x} x={10 + x*15} y="118" fontSize="4" textAnchor="middle" fill="#94a3b8">{x}</text>)}
                {[0, 10, 20].map(y => <text key={y} x="6" y={110 - (y/22)*100} fontSize="4" textAnchor="end" fill="#94a3b8">{y}</text>)}
                {/* Points and Line y=3x */}
                <polyline 
                  points={[1,2,3,4,5,6,7].map(x => `${10 + x*14.28},${110 - (x*3*4.5)}`).join(' ')}
                  fill="none" stroke="#3b82f6" strokeWidth="2"
                />
                {[1, 2, 3, 4, 5, 6, 7].map(x => (
                  <circle key={x} cx={10 + x*14.28} cy={110 - (x*3*4.5)} r="2" fill="#1d4ed8" />
                ))}
              </svg>
            </div>
            <div className="space-y-6 text-lg">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span>The pattern</span>
                <select className="bg-gray-700 border-b-2 border-sky-400 rounded" value={t3Behavior} onChange={e => setT3Behavior(e.target.value)}>
                  <option value="">-- select --</option>
                  <option value="increases">increases</option>
                  <option value="decreases">decreases</option>
                </select>
                <span>by</span>
                <select className="bg-gray-700 border-b-2 border-sky-400 rounded px-1" value={t3Value} onChange={e => setT3Value(e.target.value)}>
                   <option value="">--</option>
                   {[2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <span>each time!</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span>What's the 5th term?</span>
                <input type="number" className="w-20 bg-gray-700 border-b-2 border-sky-400 rounded text-center" value={t3Term5} onChange={e => setT3Term5(e.target.value)} />
              </div>
              <button onClick={validateT3} className="bg-sky-600 hover:bg-sky-500 px-10 py-3 rounded-xl font-bold transition-all">Submit Analysis</button>
            </div>
          </div>
        )}

        {/* TASK 4: TILES */}
        {step === 4 && (
          <div className="animate-fade-in text-center">
             <h2 className="text-2xl font-bold text-sky-400 mb-8">Tile Growth</h2>
             <div className="flex justify-center gap-8 mb-12 flex-wrap">
               {[2, 4, 8, 16].map((count, i) => (
                 <div key={i} className="flex flex-col items-center gap-3">
                    <div className={`grid grid-cols-2 gap-1 p-2 bg-gray-700/50 rounded-lg border border-gray-600`}>
                      {Array.from({length: count}).map((_, j) => (
                        <div key={j} className="w-4 h-4 bg-emerald-500 rounded-sm shadow-sm" />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-gray-500">Figure {i+1}</span>
                 </div>
               ))}
             </div>
             <div className="space-y-6 text-lg">
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span>The pattern</span>
                  <select className="bg-gray-700 border-b-2 border-sky-500 rounded px-2" value={t4Behavior} onChange={e => setT4Behavior(e.target.value)}>
                    <option value="">-- select --</option>
                    <option value="increases">increases</option>
                    <option value="decreases">decreases</option>
                    <option value="doubles">doubles</option>
                    <option value="triples">triples</option>
                  </select>
                  <span>by each time!</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                   <span>What's the 5th term?</span>
                   <input type="number" className="w-20 bg-gray-700 border-b-2 border-sky-500 rounded text-center" value={t4Term5} onChange={e => setT4Term5(e.target.value)} />
                </div>
                <button onClick={validateT4} className="bg-sky-600 hover:bg-sky-500 px-10 py-3 rounded-xl font-bold transition-all">Verify Logic</button>
             </div>
          </div>
        )}

        {/* TASK 5: RIDDLE */}
        {step === 5 && (
          <div className="animate-fade-in text-center max-w-lg mx-auto">
            <h2 className="text-3xl font-bold text-sky-400 mb-8">Number Riddle</h2>
            <div className="bg-gray-900 rounded-3xl p-8 border-2 border-indigo-500/30 shadow-2xl space-y-6 text-left">
              <div className="flex flex-col gap-2">
                <span className="text-sky-300 font-bold">1. Pick a number:</span>
                <input 
                  type="number" 
                  className="bg-gray-800 border-2 border-sky-500 rounded-xl p-3 text-2xl font-bold text-center"
                  value={t5Input}
                  onChange={e => setT5Input(e.target.value)}
                  placeholder="?"
                />
              </div>
              
              {t5Input && (
                <div className="space-y-4 animate-fade-in text-lg text-gray-300">
                  <p className="flex items-center gap-3"><span className="bg-sky-900 h-6 w-6 rounded-full text-xs flex items-center justify-center">2</span> Multiply your number by 3.</p>
                  <p className="flex items-center gap-3"><span className="bg-sky-900 h-6 w-6 rounded-full text-xs flex items-center justify-center">3</span> Add 12.</p>
                  <p className="flex items-center gap-3"><span className="bg-sky-900 h-6 w-6 rounded-full text-xs flex items-center justify-center">4</span> Divide the result by 3.</p>
                  <p className="flex items-center gap-3"><span className="bg-sky-900 h-6 w-6 rounded-full text-xs flex items-center justify-center">5</span> Subtract your original number ({t5Input}).</p>
                  
                  <div className="pt-6 border-t border-gray-700 mt-6 flex flex-col items-center">
                    <p className="text-xl font-bold text-white mb-4 text-center">What is your final answer?</p>
                    <input 
                      type="number"
                      className="w-32 text-4xl font-bold bg-gray-800 border-2 border-emerald-400 rounded-2xl p-4 text-center mb-8"
                      value={t5Answer}
                      onChange={e => setT5Answer(e.target.value)}
                    />
                    <button onClick={validateT5} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold text-xl transition-all shadow-lg">SOLVE RIDDLE</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatternLevel1;
