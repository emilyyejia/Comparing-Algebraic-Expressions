import React from 'react';

interface ToolbarButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  isActive?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({ label, onClick, children, isActive }) => {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        aria-label={label}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-sky-400/50
          ${isActive 
            ? 'bg-sky-500 text-white scale-110' 
            : 'bg-gray-600 text-gray-300 hover:bg-gray-500 hover:text-white'
          }`}
      >
        {children}
      </button>
      <div
        className="absolute right-full top-1/2 -translate-y-1/2 mr-4 px-3 py-1.5 bg-gray-900 text-white text-sm font-semibold rounded-md shadow-lg 
                   opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 whitespace-nowrap"
        role="tooltip"
      >
        {label}
      </div>
    </div>
  );
};
