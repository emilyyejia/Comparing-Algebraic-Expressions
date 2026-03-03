import React from 'react';
import { useToolbar } from '../../hooks/useToolbarState';

const Formula: React.FC<{ shape: string, formula: string }> = ({ shape, formula }) => (
    <div className="p-3 bg-gray-100 rounded-md">
        <h3 className="font-bold text-lg text-gray-900">{shape}</h3>
        <p className="text-gray-600 font-mono text-lg">Area = {formula}</p>
    </div>
);

const DocumentsModal: React.FC = () => {
    const { toggleTool } = useToolbar();

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[200] p-4 animate-fade-in"
            onClick={() => toggleTool('documents')}
            role="dialog"
            aria-modal="true"
            aria-labelledby="documents-modal-title"
        >
            <div 
                className="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="documents-modal-title" className="text-3xl font-bold text-sky-700 mb-6">Area Formulas</h2>
                <div className="space-y-4">
                    <Formula shape="Rectangle" formula="length × width" />
                    <Formula shape="Parallelogram" formula="base × height" />
                    <Formula shape="Triangle" formula="½ × base × height" />
                    <Formula shape="Trapezoid" formula="½ × (base₁ + base₂) × height" />
                    <Formula shape="Rhombus" formula="½ × diagonal₁ × diagonal₂" />
                    <Formula shape="Kite" formula="½ × diagonal₁ × diagonal₂" />
                </div>
                <div className="mt-6 text-right">
                    <button
                        onClick={() => toggleTool('documents')}
                        className="bg-sky-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentsModal;
