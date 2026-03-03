import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { Tool } from '../types';

export type DrawingTool = 'highlighter' | 'eraser';

interface ToolbarContextType {
  activeTool: Tool | null;
  drawingTool: DrawingTool | null;
  setDrawingTool: (tool: DrawingTool | null) => void;
  toggleTool: (tool: Tool) => void;
  setActiveTool: (tool: Tool | null) => void;
  
  zoomLevel: number;
  zoomIn: () => void;
  zoomOut: () => void;
  
  isHighContrast: boolean;
  toggleHighContrast: () => void;
  
  notes: string;
  setNotes: (notes: string) => void;

  showLineReader: boolean;
  lineReaderPosition: number;
  setLineReaderPosition: (pos: number) => void;
  
  highlighterColor: string;
  setHighlighterColor: (color: string) => void;

  clearHighlights: number; // A counter to trigger canvas clearing
  triggerClearHighlights: () => void;
}

const ToolbarContext = createContext<ToolbarContextType | undefined>(undefined);

// FIX: Explicitly type props to include children to satisfy React.FC type checking
export const ToolbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [drawingTool, setDrawingTool] = useState<DrawingTool | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [notes, setNotes] = useState('');
  const [showLineReader, setShowLineReader] = useState(false);
  const [lineReaderPosition, setLineReaderPosition] = useState(150);
  const [highlighterColor, setHighlighterColor] = useState('rgba(255, 255, 0, 0.4)');
  const [clearHighlights, setClearHighlights] = useState(0);

  const zoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  const toggleHighContrast = () => setIsHighContrast(prev => !prev);
  const triggerClearHighlights = () => setClearHighlights(c => c + 1);

  const toggleTool = useCallback((tool: Tool) => {
    switch(tool) {
        case 'zoomIn':
            zoomIn();
            break;
        case 'zoomOut':
            zoomOut();
            break;
        case 'highContrast':
            toggleHighContrast();
            break;
        case 'lineReader':
            setShowLineReader(prev => !prev);
            setActiveTool(null);
            setDrawingTool(null);
            break;
        case 'highlighter':
            setDrawingTool(prev => prev === 'highlighter' ? null : 'highlighter');
            setActiveTool(null);
            setShowLineReader(false);
            break;
        case 'eraser':
            setDrawingTool(prev => prev === 'eraser' ? null : 'eraser');
            setActiveTool(null);
            setShowLineReader(false);
            break;
        default:
            // For modal-based tools
            setActiveTool(prev => (prev === tool ? null : tool));
            setDrawingTool(null);
            setShowLineReader(false);
    }
  }, []);
  
  const value: ToolbarContextType = {
    activeTool,
    setActiveTool,
    drawingTool,
    setDrawingTool,
    toggleTool,
    zoomLevel,
    zoomIn,
    zoomOut,
    isHighContrast,
    toggleHighContrast,
    notes,
    setNotes,
    showLineReader,
    lineReaderPosition,
    setLineReaderPosition,
    highlighterColor,
    setHighlighterColor,
    clearHighlights,
    triggerClearHighlights,
  };

  // FIX: The file has a .ts extension but contains JSX, which causes parsing errors.
  // Replacing JSX with React.createElement resolves these errors without renaming the file.
  return React.createElement(ToolbarContext.Provider, { value: value }, children);
};

export const useToolbar = (): ToolbarContextType => {
  const context = useContext(ToolbarContext);
  if (!context) {
    throw new Error('useToolbar must be used within a ToolbarProvider');
  }
  return context;
};