import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useToolbar } from '../../hooks/useToolbarState';

interface LineReaderProps {
  initialPosition: number;
}

const SLIT_HEIGHT = 60;

const LineReader: React.FC<LineReaderProps> = ({ initialPosition }) => {
    const { setLineReaderPosition } = useToolbar();
    const [y, setY] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartPos = useRef(0);
    const elementStartPos = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragStartPos.current = e.clientY;
        elementStartPos.current = y;
    }, [y]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const dy = e.clientY - dragStartPos.current;
        const newY = elementStartPos.current + dy;
        const clampedY = Math.max(0, Math.min(newY, window.innerHeight - SLIT_HEIGHT));
        setY(clampedY);
        setLineReaderPosition(clampedY);
    }, [isDragging, setLineReaderPosition]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <>
            <div className="line-reader-overlay top" style={{ height: `${y}px` }} />
            <div
                className="line-reader-handle"
                style={{ top: `${y}px`, height: `${SLIT_HEIGHT}px` }}
                onMouseDown={handleMouseDown}
            />
            <div className="line-reader-overlay bottom" style={{ top: `${y + SLIT_HEIGHT}px` }} />
        </>
    );
};

export default LineReader;