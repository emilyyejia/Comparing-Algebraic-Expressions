import React, { useState } from 'react';
import { useToolbar } from '../../hooks/useToolbarState';
import Draggable from './Draggable';

const Calculator: React.FC = () => {
    const { toggleTool } = useToolbar();
    const [display, setDisplay] = useState('0');
    const [firstOperand, setFirstOperand] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForSecondOperand, setWaitingForSecondOperand] = useState(false);

    const handleDigit = (digit: string) => {
        if (waitingForSecondOperand) {
            setDisplay(digit);
            setWaitingForSecondOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const handleDecimal = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const handleOperator = (nextOperator: string) => {
        const inputValue = parseFloat(display);
        if (firstOperand === null) {
            setFirstOperand(inputValue);
        } else if (operator) {
            const result = performCalculation();
            setDisplay(String(result));
            setFirstOperand(result);
        }
        setWaitingForSecondOperand(true);
        setOperator(nextOperator);
    };
    
    const performCalculation = () => {
        if (firstOperand === null || operator === null) return parseFloat(display);
        const secondOperand = parseFloat(display);
        switch (operator) {
            case '+': return firstOperand + secondOperand;
            case '-': return firstOperand - secondOperand;
            case '*': return firstOperand * secondOperand;
            case '/': return firstOperand / secondOperand;
            default: return secondOperand;
        }
    };

    const handleEquals = () => {
        if (operator && !waitingForSecondOperand) {
            const result = performCalculation();
            setDisplay(String(result));
            setFirstOperand(null);
            setOperator(null);
            setWaitingForSecondOperand(true);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setFirstOperand(null);
        setOperator(null);
        setWaitingForSecondOperand(false);
    };

    const handleDel = () => {
        if (waitingForSecondOperand) return;
        setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    };
    
    const buttons = [
        { label: 'C', handler: handleClear, className: 'operator' },
        { label: 'Del', handler: handleDel, className: 'operator' },
        { label: '÷', handler: () => handleOperator('/'), className: 'operator' },
        { label: 'x', handler: () => handleOperator('*'), className: 'operator' },
        { label: '7', handler: () => handleDigit('7') },
        { label: '8', handler: () => handleDigit('8') },
        { label: '9', handler: () => handleDigit('9') },
        { label: '-', handler: () => handleOperator('-'), className: 'operator' },
        { label: '4', handler: () => handleDigit('4') },
        { label: '5', handler: () => handleDigit('5') },
        { label: '6', handler: () => handleDigit('6') },
        { label: '+', handler: () => handleOperator('+'), className: 'operator' },
        { label: '1', handler: () => handleDigit('1') },
        { label: '2', handler: () => handleDigit('2') },
        { label: '3', handler: () => handleDigit('3') },
        { label: '=', handler: handleEquals, className: 'row-span-2 operator' },
        { label: '0', handler: () => handleDigit('0'), className: 'zero' },
        { label: '.', handler: handleDecimal },
    ];

    return (
        <Draggable title="Calculator" onClose={() => toggleTool('calculator')}>
            <div className="w-64 p-2 bg-gray-900 rounded-md">
                <div className="bg-gray-800 text-white text-right text-4xl p-4 rounded-md mb-2 break-all">{display}</div>
                <div className="calculator-grid">
                     {buttons.map((btn, i) => (
                        <button key={i} onClick={btn.handler} className={`calculator-btn bg-gray-700 hover:bg-gray-600 text-white text-xl p-4 rounded-md ${btn.className || ''}`}>
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
        </Draggable>
    );
};

export default Calculator;