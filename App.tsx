
import React, { useState, useMemo, useEffect } from 'react';
import type { Level, PlayerProgress, Lesson } from './types';
import { LevelStatus } from './types';
import { usePlayerProgress } from './hooks/usePlayerProgress';
import { ToolbarProvider } from './hooks/useToolbarState';

import LevelView from './components/LevelView';
import AlgebraTilesLevel1 from './levels/AlgebraTilesLevel1';
import AlgebraTilesLevel2 from './levels/AlgebraTilesLevel2';
import AlgebraTilesLevel3 from './levels/AlgebraTilesLevel3';
import ReplaceVariableLevel1 from './levels/ReplaceVariableLevel1';
import TableOfValuesLevel2 from './levels/TableOfValuesLevel2';
import TableOfValuesLevel3 from './levels/TableOfValuesLevel3';
import ExpressionsAndGraphsLevel1 from './levels/ExpressionsAndGraphsLevel1';
import ExpressionsAndGraphsLevel2 from './levels/ExpressionsAndGraphsLevel2';
import ExpressionsAndGraphsLevel3 from './levels/ExpressionsAndGraphsLevel3';
import ExponentLawsLevel1 from './levels/ExponentLawsLevel1';
import ExponentLawsLevel2 from './levels/ExponentLawsLevel2';
import ExponentLawsLevel3 from './levels/ExponentLawsLevel3';

// --- Icon Components ---
const StarIcon: React.FC<{ className?: string; filled: boolean }> = ({ className, filled }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 20 20" 
        fill={filled ? "currentColor" : "none"} 
        stroke="currentColor" 
        strokeWidth={filled ? 0 : 1.5}
        className={className}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002 2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
    </svg>
);

const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.89a1.5 1.5 0 0 0 0-2.54L6.3 2.841Z" />
    </svg>
);

const AVATAR_UNLOCK_THRESHOLD = 20;

const LESSON_DEFINITIONS: Lesson[] = [
    {
        title: "Visualizing Algebra",
        levels: [
            { id: 'algebra-tiles-1', name: 'Level 1', description: 'Represent expressions using pattern blocks and tile models.', component: AlgebraTilesLevel1, topic: 'Algebraic Visualization' },
            { id: 'algebra-tiles-2', name: 'Level 2', description: 'Advanced algebraic visualization challenge.', component: AlgebraTilesLevel2, topic: 'Algebraic Visualization' },
            { id: 'algebra-tiles-3', name: 'Level 3', description: 'Represent and compare expressions using a balance scale.', component: AlgebraTilesLevel3, topic: 'Algebraic Visualization' },
        ]
    },
    {
        title: "Substitution & Tables",
        levels: [
            { id: 'replace-variable-1', name: 'Level 1', description: 'Learn to substitute numbers for variables and evaluate expressions.', component: ReplaceVariableLevel1, topic: 'Substitution' },
            { id: 'table-values-2', name: 'Level 2', description: 'Compare expressions using tables of values.', component: TableOfValuesLevel2, topic: 'Substitution' },
            { id: 'table-values-3', name: 'Level 3', description: 'Deep dive into expression behavior and crossover points.', component: TableOfValuesLevel3, topic: 'Substitution' }
        ]
    },
    {
        title: "Expressions & Graphs",
        levels: [
            { id: 'exp-graphs-1', name: 'Level 1', description: 'Plot linear equations and identify points on curves.', component: ExpressionsAndGraphsLevel1, topic: 'Graphing' },
            { id: 'exp-graphs-2', name: 'Level 2', description: 'Graph two lines and analyze their intersection.', component: ExpressionsAndGraphsLevel2, topic: 'Graphing' },
            { id: 'exp-graphs-3', name: 'Level 3', description: 'Compare parallel lines and quadratic translations.', component: ExpressionsAndGraphsLevel3, topic: 'Graphing' },
        ]
    },
    {
        title: "Exponent Laws",
        levels: [
            { id: 'exp-laws-1', name: 'Level 1', description: 'Expand and simplify expressions with exponents.', component: ExponentLawsLevel1, topic: 'Exponents' },
            { id: 'exp-laws-2', name: 'Level 2', description: 'Compare expressions with identical bases and different forms.', component: ExponentLawsLevel2, topic: 'Exponents' },
            { id: 'exp-laws-3', name: 'Level 3', description: 'Evaluate equivalence across various algebraic forms.', component: ExponentLawsLevel3, topic: 'Exponents' },
        ]
    }
];

const PlayerStatusDisplay: React.FC<{ totalStars: number; selectedAvatar: string | null }> = ({ totalStars, selectedAvatar }) => {
    return (
        <div className="fixed top-6 left-6 z-50 flex flex-col gap-4">
            <div className="p-4 border-2 border-yellow-500/30 rounded-xl bg-slate-900/90 shadow-2xl backdrop-blur-md min-w-[180px]">
                <div className="flex items-center gap-4">
                    {selectedAvatar ? (
                        <div className="w-12 h-12 bg-sky-500/20 border border-sky-400/50 rounded-full flex items-center justify-center text-3xl shadow-inner">{selectedAvatar}</div>
                    ) : (
                        <div className="relative">
                            <StarIcon className="w-10 h-10 text-yellow-400 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" filled={true} />
                        </div>
                    )}
                    <div>
                        <span key={totalStars} className="text-4xl font-black text-white tracking-tighter animate-count-up">{totalStars}</span>
                    </div>
                </div>
                {totalStars < AVATAR_UNLOCK_THRESHOLD ? (
                    <p className="text-[10px] font-bold text-yellow-500 mt-2 uppercase tracking-wide">Earn {AVATAR_UNLOCK_THRESHOLD - totalStars} more to choose avatar</p>
                ) : (
                    <p className="text-[10px] font-bold text-emerald-400 mt-2 uppercase tracking-wide">Avatar Unlocked!</p>
                )}
            </div>
        </div>
    );
};

const getLevelStatus = (level: Level, progress: PlayerProgress, manuallyUnlockedLevels: string[]): LevelStatus => {
    // If has stars, it's completed
    if ((progress[level.id] || 0) >= 1) return LevelStatus.COMPLETED;

    // If manually unlocked, it's playable
    if (manuallyUnlockedLevels.includes(level.id)) return LevelStatus.UNLOCKED;

    const allLevels = LESSON_DEFINITIONS.flatMap(l => l.levels);
    const index = allLevels.findIndex(l => l.id === level.id);
    
    // First level is always unlocked
    if (index === 0) return LevelStatus.UNLOCKED;

    // Normal progression requires 2 stars on previous level
    const prevLevel = allLevels[index - 1];
    return (progress[prevLevel.id] || 0) >= 2 ? LevelStatus.UNLOCKED : LevelStatus.LOCKED;
};

const LevelNode: React.FC<{ level: Level; status: LevelStatus; stars: number; onSelectLevel: (id: string) => void; onManualUnlock: () => void }> = ({ level, status, stars, onSelectLevel, onManualUnlock }) => {
    const isLocked = status === LevelStatus.LOCKED;

    const buttonClass = isLocked 
        ? 'bg-slate-700 border-slate-600 text-slate-500' 
        : 'bg-gradient-to-b from-sky-400 to-sky-600 border-sky-300 text-white shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:scale-110 active:scale-95';
    
    return (
        <div className="flex flex-col items-center relative w-28 text-center group">
            <button
                onClick={() => !isLocked && onSelectLevel(level.id)}
                disabled={isLocked}
                className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-xl ${buttonClass}`}
            >
                {isLocked ? <LockIcon className="w-7 h-7" /> : <PlayIcon className="w-8 h-8 ml-1" />}
            </button>
            
            <p className="mt-4 font-black text-[11px] uppercase text-white tracking-wide leading-tight px-1 drop-shadow-sm group-hover:text-sky-300 transition-colors">
                {level.name}
            </p>
            
            <div className="flex gap-0.5 mt-2">
                {[1, 2, 3].map((i) => (
                    <StarIcon 
                        key={i} 
                        filled={i <= stars} 
                        className={`w-4 h-4 ${i <= stars ? 'text-yellow-400' : 'text-slate-700'}`} 
                    />
                ))}
            </div>

            {isLocked && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onManualUnlock(); }}
                    className="mt-2 text-[8px] font-black text-slate-500 hover:text-sky-400 uppercase tracking-tighter"
                >
                    Unlock
                </button>
            )}
        </div>
    );
};

const LevelMap: React.FC<{ progress: PlayerProgress; manuallyUnlockedLevels: string[]; onSelectLevel: (id: string) => void; totalStars: number; selectedAvatar: string | null; onManualUnlockLevel: (id: string) => void }> = ({ progress, manuallyUnlockedLevels, onSelectLevel, totalStars, selectedAvatar, onManualUnlockLevel }) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-start p-8 bg-[#0f172a] relative overflow-x-hidden">
            <PlayerStatusDisplay totalStars={totalStars} selectedAvatar={selectedAvatar} />
            
            {/* Header section adjusted to prevent overlap with top-left status box */}
            <div className="text-center pt-32 pb-24 relative z-10 w-full max-w-5xl">
                <h1 className="text-7xl font-black text-sky-400 tracking-tight drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                    Comparing Algebraic Expressions
                </h1>
                <p className="mt-4 text-2xl text-white italic font-light opacity-90">
                    Goal: I can compare algebraic expressions using various methods.
                </p>
            </div>

            <div className="w-full relative flex items-center justify-center min-h-[400px]">
                <div className="absolute top-1/2 left-0 right-0 h-5 bg-gradient-to-b from-yellow-600 via-yellow-400 to-yellow-700 rounded-full transform -translate-y-1/2 shadow-[0_4px_10px_rgba(0,0,0,0.5)]" />
                
                <div className="flex gap-16 relative z-10 px-20 max-w-full overflow-x-auto pb-12 scrollbar-hide">
                    {LESSON_DEFINITIONS.map((lesson) => (
                        <div key={lesson.title} className="flex-shrink-0 flex flex-col items-center">
                            <div className="bg-slate-800/60 backdrop-blur-xl border-2 border-slate-700/50 rounded-[2.5rem] p-8 pb-10 shadow-2xl min-w-[280px]">
                                <h2 className="text-sky-400 text-lg font-black uppercase tracking-widest text-center mb-10 drop-shadow-sm">
                                    {lesson.title}
                                </h2>
                                <div className="flex gap-10 justify-center">
                                    {lesson.levels.map(level => (
                                        <LevelNode 
                                            key={level.id} 
                                            level={level} 
                                            status={getLevelStatus(level, progress, manuallyUnlockedLevels)} 
                                            stars={progress[level.id] || 0} 
                                            onSelectLevel={onSelectLevel} 
                                            onManualUnlock={() => onManualUnlockLevel(level.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const App = () => {
    const { progress, partialProgress, manuallyUnlockedLevels, savePartialProgress, completeLevel, unlockLevel, unlockAll, selectedAvatar, setSelectedAvatar } = usePlayerProgress(LESSON_DEFINITIONS);
    const [currentLevelId, setCurrentLevelId] = useState<string | null>(null);
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    const totalStars = useMemo(() => Object.values(progress).reduce((sum, stars) => sum + stars, 0), [progress]);

    useEffect(() => {
        if (!selectedAvatar && totalStars >= AVATAR_UNLOCK_THRESHOLD) setShowAvatarModal(true);
    }, [totalStars, selectedAvatar]);

    const handleLevelSelect = (id: string) => setCurrentLevelId(id);
    const handleBackToMap = () => setCurrentLevelId(null);
    const currentLevel = LESSON_DEFINITIONS.flatMap(l => l.levels).find(l => l.id === currentLevelId);
    const lessonTitle = LESSON_DEFINITIONS.find(l => l.levels.some(lvl => lvl.id === currentLevelId))?.title;

    return (
        <ToolbarProvider>
            <div className="min-h-screen bg-black font-sans text-white">
                {currentLevel ? (
                    <LevelView
                        level={currentLevel}
                        onBackToMap={handleBackToMap}
                        onComplete={(stars) => completeLevel(currentLevel.id, stars)}
                        onExit={handleBackToMap}
                        onNext={() => {
                            const allLevels = LESSON_DEFINITIONS.flatMap(l => l.levels);
                            const idx = allLevels.findIndex(l => l.id === currentLevelId);
                            if (idx < allLevels.length - 1) setCurrentLevelId(allLevels[idx+1].id);
                            else setCurrentLevelId(null);
                        }}
                        partialProgress={partialProgress[currentLevel.id]}
                        onSavePartialProgress={(state) => savePartialProgress(currentLevel.id, state)}
                        progress={progress}
                        lessonTitle={lessonTitle}
                    />
                ) : (
                    <LevelMap
                        progress={progress}
                        manuallyUnlockedLevels={manuallyUnlockedLevels}
                        onSelectLevel={handleLevelSelect}
                        totalStars={totalStars}
                        selectedAvatar={selectedAvatar}
                        onManualUnlockLevel={unlockLevel}
                    />
                )}
                
                {showAvatarModal && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-slate-900 p-10 rounded-3xl border border-sky-500/50 text-center max-w-2xl shadow-[0_0_50px_rgba(56,189,248,0.2)]">
                            <h2 className="text-4xl font-black text-sky-400 mb-2">YOU ARE AN EXPLORER!</h2>
                            <p className="text-slate-400 mb-10">Pick your avatar to continue the journey.</p>
                            <div className="grid grid-cols-4 gap-6 mb-10">
                                {['👩‍🚀', '🕵️‍♀️', '👨‍🌾', '👩‍🎨', '👨‍💻', '🦸‍♀️', '🧑‍🔬', '🧑‍🚒'].map(a => (
                                    <button 
                                        key={a} 
                                        onClick={() => { setSelectedAvatar(a); setShowAvatarModal(false); }} 
                                        className="text-6xl p-4 bg-slate-800 rounded-2xl hover:bg-sky-500 transition-all transform hover:scale-110 shadow-lg"
                                    >
                                        {a}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ToolbarProvider>
    );
};

export default App;
