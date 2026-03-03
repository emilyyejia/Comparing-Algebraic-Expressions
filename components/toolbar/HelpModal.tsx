import React from 'react';
import { useToolbar } from '../../hooks/useToolbarState';
import { HelpIcon, ListenIcon, ZoomInIcon, ZoomOutIcon, LineReaderIcon, ContrastIcon, HighlighterIcon, EraserIcon, NotesIcon, CalculatorIcon, DocumentsIcon } from './icons';

const HelpModal: React.FC = () => {
    const { toggleTool } = useToolbar();

    const tools = [
        { id: 'help', icon: <HelpIcon />, name: 'Help page', description: 'Shows this help page, explaining all the tool icons and their functions.' },
        { id: 'listen', icon: <ListenIcon />, name: 'Listen', description: 'Reads the text on the page aloud. A play bar will appear at the top.' },
        { id: 'zoomIn', icon: <ZoomInIcon />, name: 'Zoom in', description: 'Makes everything on the page bigger.' },
        { id: 'zoomOut', icon: <ZoomOutIcon />, name: 'Zoom out', description: 'Makes everything on the page smaller.' },
        { id: 'lineReader', icon: <LineReaderIcon />, name: 'Line reader', description: 'Provides a draggable guide to help you focus on one line of text at a time.' },
        { id: 'highContrast', icon: <ContrastIcon />, name: 'High contrast', description: 'Changes the colors to make the text easier to read.' },
        { id: 'highlighter', icon: <HighlighterIcon />, name: 'Highlighter', description: 'Lets you highlight text on the page. A color palette will appear at the bottom.' },
        { id: 'eraser', icon: <EraserIcon />, name: 'Eraser', description: 'Lets you erase any highlights you have made.' },
        { id: 'notes', icon: <NotesIcon />, name: 'Rough notes', description: 'Opens a draggable notepad for you to type in.' },
        { id: 'calculator', icon: <CalculatorIcon />, name: 'Calculator', description: 'Opens a simple, draggable calculator.' },
        { id: 'documents', icon: <DocumentsIcon />, name: 'Documents', description: 'Opens a formula sheet with helpful math formulas.' },
    ];

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[200] p-4 animate-fade-in"
            onClick={() => toggleTool('help')}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
        >
            <div 
                className="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="help-modal-title" className="text-3xl font-bold text-sky-700 mb-6">Tools Help</h2>
                <ul className="space-y-4">
                    {tools.map(tool => (
                        <li key={tool.id} className="flex items-start gap-4 p-3 bg-gray-100 rounded-md">
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-600 text-gray-200 rounded-full flex items-center justify-center">
                                {tool.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{tool.name}</h3>
                                <p className="text-gray-600">{tool.description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
                <div className="mt-6 text-right">
                    <button
                        onClick={() => toggleTool('help')}
                        className="bg-sky-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
