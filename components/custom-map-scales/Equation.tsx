import React from 'react';

interface EquationProps {
  count: number;
  scale: number;
  total: number;
}

const Box: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center justify-center w-12 h-12 border-2 border-slate-400 rounded-md text-slate-800 font-bold text-xl bg-slate-100">
    {children}
  </span>
);

const Equation: React.FC<EquationProps> = ({ count, scale, total }) => {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 text-xl sm:text-2xl font-semibold text-slate-600 my-6" aria-live="polite">
      <Box>{count}</Box>
      <span>×</span>
      <span>{scale} m</span>
      <span>=</span>
      <Box>{total}</Box>
      <span>m</span>
    </div>
  );
};

export default Equation;
