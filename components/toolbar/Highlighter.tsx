import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useToolbar, DrawingTool } from '../../hooks/useToolbarState';

interface HighlighterProps {
  contentRef: React.RefObject<HTMLElement>;
}

const Highlighter: React.FC<HighlighterProps> = ({ contentRef }) => {
  const { 
    drawingTool, 
    setDrawingTool, 
    highlighterColor, 
    setHighlighterColor,
    triggerClearHighlights,
    clearHighlights,
  } = useToolbar();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getCanvasContext = () => canvasRef.current?.getContext('2d');

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = contentRef.current;
    if (canvas && container) {
      canvas.width = container.scrollWidth;
      canvas.height = container.scrollHeight;
    }
  }, [contentRef]);

  useEffect(() => {
    resizeCanvas();
    const container = contentRef.current;
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if(container) {
        resizeObserver.observe(container);
        container.addEventListener('scroll', resizeCanvas);
    }
    return () => {
        if(container){
            resizeObserver.unobserve(container);
            container.removeEventListener('scroll', resizeCanvas);
        }
    };
  }, [resizeCanvas]);

  useEffect(() => {
    const ctx = getCanvasContext();
    if(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
  }, [clearHighlights]);

  const getCoords = (e: MouseEvent | TouchEvent): { x: number, y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoords(e.nativeEvent);
    if (!coords) return;
    setIsDrawing(true);
    lastPos.current = coords;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoords(e.nativeEvent);
    const ctx = getCanvasContext();
    if (!coords || !ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(coords.x, coords.y);
    
    if (drawingTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 20;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = highlighterColor;
      ctx.lineWidth = 15;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    ctx.stroke();
    lastPos.current = coords;
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const colors = [
    { name: 'Yellow', value: 'rgba(255, 255, 0, 0.4)' },
    { name: 'Blue', value: 'rgba(0, 150, 255, 0.4)' },
    { name: 'Pink', value: 'rgba(255, 105, 180, 0.4)' },
  ];

  const eraserCursor = `url('data:image/svg+xml;charset=utf-8,%3Csvg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"%3E%3Ccircle cx="16" cy="16" r="14" fill="white" stroke="black" stroke-width="2"/%3E%3C/svg%3E') 16 16, auto`;

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="absolute top-0 left-0 z-[10]"
        style={{ 
            cursor: drawingTool === 'eraser' ? eraserCursor : 'crosshair',
            pointerEvents: drawingTool ? 'auto' : 'none'
        }}
      />
      {(drawingTool === 'highlighter' || drawingTool === 'eraser') && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800/80 backdrop-blur-sm p-3 rounded-lg shadow-lg flex items-center gap-4 z-[160] animate-fade-in">
            {colors.map(color => (
            <button
                key={color.name}
                onClick={() => { setHighlighterColor(color.value); setDrawingTool('highlighter'); }}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${drawingTool === 'highlighter' && highlighterColor === color.value ? 'border-sky-400 scale-110' : 'border-gray-500'}`}
                style={{ backgroundColor: color.value.replace(/, 0.4\)/, ')') }}
                aria-label={`Highlight ${color.name}`}
            />
            ))}
            <div className="w-px h-10 bg-gray-600" />
            <button
            onClick={triggerClearHighlights}
            className="text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
                Clear drawings
            </button>
            <button
            onClick={() => setDrawingTool(null)}
            className="text-gray-300 hover:text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
            Exit Drawing Tools
            </button>
        </div>
      )}
    </>
  );
};

export default Highlighter;