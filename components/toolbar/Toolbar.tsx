import React from 'react';
import { useToolbar } from '../../hooks/useToolbarState';
import { ToolbarButton } from './ToolbarButton';
import { HelpIcon, ListenIcon, ZoomInIcon, ZoomOutIcon, LineReaderIcon, ContrastIcon, HighlighterIcon, EraserIcon, NotesIcon, CalculatorIcon, DocumentsIcon } from './icons';

export const Toolbar: React.FC = () => {
    const { activeTool, toggleTool, drawingTool, isHighContrast, showLineReader } = useToolbar();

    const tools = [
        { id: 'help', icon: <HelpIcon />, name: 'Help page' },
        { id: 'listen', icon: <ListenIcon />, name: 'Listen' },
        { id: 'zoomIn', icon: <ZoomInIcon />, name: 'Zoom in' },
        { id: 'zoomOut', icon: <ZoomOutIcon />, name: 'Zoom out' },
        { id: 'lineReader', icon: <LineReaderIcon />, name: 'Line reader' },
        { id: 'highContrast', icon: <ContrastIcon />, name: 'High contrast' },
        { id: 'highlighter', icon: <HighlighterIcon />, name: 'Highlighter' },
        { id: 'eraser', icon: <EraserIcon />, name: 'Eraser' },
        { id: 'notes', icon: <NotesIcon />, name: 'Rough notes' },
        { id: 'calculator', icon: <CalculatorIcon />, name: 'Calculator' },
        { id: 'documents', icon: <DocumentsIcon />, name: 'Documents' },
    ] as const;

    return (
        <div className="fixed top-1/2 right-4 -translate-y-1/2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-full shadow-lg p-2 flex flex-col gap-2 z-[150]">
            {tools.map(tool => {
                let isActive = activeTool === tool.id;
                if (tool.id === 'highlighter') isActive = drawingTool === 'highlighter';
                if (tool.id === 'eraser') isActive = drawingTool === 'eraser';
                if (tool.id === 'highContrast') isActive = isHighContrast;
                if (tool.id === 'lineReader') isActive = showLineReader;
                
                return (
                    <ToolbarButton
                        key={tool.id}
                        label={tool.name}
                        onClick={() => toggleTool(tool.id)}
                        isActive={isActive}
                    >
                        {tool.icon}
                    </ToolbarButton>
                );
            })}
        </div>
    );
};

export default Toolbar;
