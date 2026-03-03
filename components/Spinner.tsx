
import React from 'react';

interface SpinnerProps {
    size?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'h-8 w-8' }) => {
    return (
        <div className={`animate-spin rounded-full ${size} border-b-2 border-t-2 border-sky-400`}></div>
    );
};

export default Spinner;
