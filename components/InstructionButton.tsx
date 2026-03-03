
import React from 'react';

interface InstructionButtonProps {
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}

const InstructionButton: React.FC<InstructionButtonProps> = ({ onClick, className = '', disabled = false }) => {
    // Hidden globally as per pedagogical request to simplify the interface
    return null;
};

export default InstructionButton;
