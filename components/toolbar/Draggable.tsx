import React, { useState, useRef, useCallback, ReactNode, useEffect } from 'react';

interface DraggableProps {
  children: ReactNode;
  title: string;
  onClose?: () => void;
  initialPosition?: { x: number; y: number };
}

const Draggable: React.FC<DraggableProps> = ({ children, title, onClose, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition || { x: window.innerWidth / 2 - 150, y: window.innerHeight / 2 - 200 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    if (nodeRef.current) {
        const { x, y } = nodeRef.current.getBoundingClientRect();
        elementStartPos.current = { x: position.x, y: position.y };
    }
  }, [position]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;
    setPosition({
      x: elementStartPos.current.x + dx,
      y: elementStartPos.current.y + dy,
    });
  }, [isDragging]);
  
  useEffect(() => {
    if(isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);


  return (
    <div
      ref={nodeRef}
      className="fixed bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-lg shadow-2xl z-[170] animate-fade-in"
      style={{ top: 0, left: 0, transform: `translate(${position.x}px, ${position.y}px)` }}
    >
      <header
        onMouseDown={handleMouseDown}
        className="bg-gray-700/80 p-2 flex justify-between items-center cursor-move rounded-t-lg"
      >
        <span className="font-bold text-white">{title}</span>
        {onClose && (
          <button onClick={onClose} className="text-gray-300 hover:text-white" aria-label={`Close ${title}`}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" clipRule="evenodd" /></svg>
          </button>
        )}
      </header>
      <div className="p-2">
        {children}
      </div>
    </div>
  );
};

export default Draggable;
